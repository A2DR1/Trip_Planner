import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { trips } = useTripStore();
  const router = useRouter();

  const initials = user?.displayName?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const upcoming = trips.filter((t) => new Date(t.endDate) >= new Date()).length;
  const past = trips.filter((t) => new Date(t.endDate) < new Date()).length;

  const handleSignOut = () => {
    Alert.alert('Sign out?', "You'll need to sign back in to access your trips.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut(auth);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.orange, Colors.primary]} style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trips.length}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{upcoming}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{past}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/trips/create')}>
            <Text style={styles.menuEmoji}>➕</Text>
            <Text style={styles.menuLabel}>Create New Trip</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/ai-suggest')}>
            <Text style={styles.menuEmoji}>✨</Text>
            <Text style={styles.menuLabel}>AI Trip Planner</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/trips/index')}>
            <Text style={styles.menuEmoji}>🗺️</Text>
            <Text style={styles.menuLabel}>My Trips</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={[styles.menuItem, styles.signOutItem]} onPress={handleSignOut}>
            <Text style={styles.menuEmoji}>🚪</Text>
            <Text style={[styles.menuLabel, { color: Colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>TripMate v1.0 · Made for students 🎓</Text>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 32, alignItems: 'center', paddingHorizontal: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#fff' },
  name: { fontSize: 22, fontWeight: '900', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flex: 1 },
  statsCard: {
    backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 20,
    flexDirection: 'row', justifyContent: 'space-around',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 3,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '900', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 4, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menu: {
    backgroundColor: '#fff', marginHorizontal: 20, marginBottom: 12, borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: Colors.border },
  signOutItem: { borderBottomWidth: 0 },
  menuEmoji: { fontSize: 22, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  menuChevron: { fontSize: 22, color: Colors.textSecondary },
  version: { textAlign: 'center', color: Colors.textSecondary, fontSize: 12, marginTop: 8 },
});
