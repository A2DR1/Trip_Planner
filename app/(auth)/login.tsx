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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Colors } from '../../constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.primary, Colors.orange]} style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.emoji}>✈️</Text>
            <Text style={styles.title}>TripMate</Text>
            <Text style={styles.subtitle}>Plan your perfect spring break</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back!</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={Colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In 🚀'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/signup')} style={styles.linkRow}>
              <Text style={styles.linkText}>New here? <Text style={styles.link}>Create account</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 64, marginBottom: 8 },
  title: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  linkRow: { marginTop: 16, alignItems: 'center' },
  linkText: { color: Colors.textSecondary, fontSize: 14 },
  link: { color: Colors.primary, fontWeight: '700' },
});
