import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Colors } from '../../constants/colors';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Oops!', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: name.trim() });
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Decorative blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Logo + Title */}
          <View style={styles.topSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>tm</Text>
            </View>
            <Text style={styles.appName}>Join TripMate</Text>
            <Text style={styles.tagline}>Start planning epic trips</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.label}>YOUR NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="Alex Johnson"
              placeholderTextColor={Colors.ink2}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@email.com"
              placeholderTextColor={Colors.ink2}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Min 6 characters"
              placeholderTextColor={Colors.ink2}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : "Let's go!"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.linkRow}>
              <Text style={styles.linkText}>Already have an account? <Text style={styles.link}>Sign in</Text></Text>
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  flex: { flex: 1 },
  blobTop: {
    position: 'absolute', top: -60, right: -60,
    width: 240, height: 240, borderRadius: 999,
    backgroundColor: Colors.teal, opacity: 0.18,
  },
  blobBottom: {
    position: 'absolute', bottom: -80, left: -80,
    width: 280, height: 280, borderRadius: 999,
    backgroundColor: Colors.coral, opacity: 0.18,
  },
  scrollContent: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  topSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: Colors.ink, justifyContent: 'center', alignItems: 'center',
  },
  logoText: { fontSize: 28, fontWeight: '900', color: Colors.coral },
  appName: { fontSize: 40, fontWeight: '800', color: Colors.ink, letterSpacing: -0.8, marginTop: 16 },
  tagline: { fontSize: 16, color: Colors.ink2, marginTop: 8 },
  formSection: { marginTop: 32 },
  label: {
    fontSize: 11, fontWeight: '800', color: Colors.ink2,
    letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1.5, borderColor: Colors.line,
    fontSize: 17, fontWeight: '600', color: Colors.ink,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.teal, borderRadius: 16,
    padding: 16, alignItems: 'center', marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  linkRow: { marginTop: 20, alignItems: 'center' },
  linkText: { color: Colors.ink2, fontSize: 14 },
  link: { color: Colors.coral, fontWeight: '700' },
  progressDots: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: 6, marginTop: 32,
  },
  dotActive: { width: 24, height: 6, borderRadius: 3, backgroundColor: Colors.coral },
  dotInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.line },
});
