import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
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
      {/* Simple top bar */}
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.editBadge}>
              <Text style={{ fontSize: 11, color: Colors.cream }}>✏</Text>
            </View>
          </View>
          <Text style={styles.name}>{user?.displayName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>STUDENT EXPLORER</Text>
          </View>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trips.length}</Text>
              <Text style={styles.statLabel}>TOTAL</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{upcoming}</Text>
              <Text style={styles.statLabel}>UPCOMING</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{past}</Text>
              <Text style={styles.statLabel}>DONE</Text>
            </View>
          </View>
        </View>

        {/* Settings list */}
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
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={() => router.push('/(tabs)/trips/index')}>
            <Text style={styles.menuEmoji}>🗺️</Text>
            <Text style={styles.menuLabel}>My Trips</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleSignOut}>
            <Text style={styles.menuEmoji}>🚪</Text>
            <Text style={[styles.menuLabel, { color: Colors.coral }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>TripMate v1.0 · Made for students 🎓</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  topBar: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12 },
  pageTitle: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5, color: Colors.ink },
  scroll: { flex: 1 },
  profileCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 22,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#281408',
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.coral,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 26, height: 26, borderRadius: 26,
    backgroundColor: Colors.ink,
    borderWidth: 2, borderColor: Colors.card,
    justifyContent: 'center', alignItems: 'center',
  },
  name: { fontSize: 22, fontWeight: '800', color: Colors.ink, letterSpacing: -0.2 },
  email: { fontSize: 13, color: Colors.ink2, marginTop: 2 },
  badge: {
    marginTop: 10,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.butter + 'AA',
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: Colors.ink, letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: Colors.line,
    paddingTop: 18, marginTop: 16,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.ink },
  statLabel: { fontSize: 10, color: Colors.ink2, fontWeight: '700', textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.4 },
  statDivider: { width: 1, backgroundColor: Colors.line },
  menu: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#281408',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    paddingHorizontal: 16, borderBottomWidth: 1, borderColor: Colors.line,
  },
  menuEmoji: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.ink },
  menuChevron: { fontSize: 22, color: Colors.ink2 },
  version: { textAlign: 'center', color: Colors.ink2, fontSize: 12, marginTop: 16 },
});
