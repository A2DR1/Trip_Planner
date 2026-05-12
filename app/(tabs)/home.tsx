import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { Colors } from '../../constants/colors';
import { Trip } from '../../types';

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);

  return (
    <TouchableOpacity style={styles.tripCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[trip.coverColor, trip.coverColor + 'CC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tripCardGradient}
      >
        <Text style={styles.tripEmoji}>{trip.coverEmoji}</Text>
        <View style={styles.tripCardBody}>
          <Text style={styles.tripTitle}>{trip.title}</Text>
          <Text style={styles.tripDest}>📍 {trip.destination}</Text>
          <Text style={styles.tripDates}>{start} → {end}</Text>
        </View>
        {daysUntil > 0 && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{daysUntil}d</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { trips, subscribeToTrips } = useTripStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToTrips(user.uid);
    return unsub;
  }, [user]);

  const upcomingTrips = trips
    .filter((t) => new Date(t.endDate) >= new Date())
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  const pastTrips = trips
    .filter((t) => new Date(t.endDate) < new Date())
    .sort((a, b) => b.startDate.localeCompare(a.startDate));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[Colors.primary, Colors.orange]} style={styles.header}>
        <Text style={styles.greeting}>{greeting}, {user?.displayName?.split(' ')[0]} 👋</Text>
        <Text style={styles.tagline}>Where are we going next?</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/(tabs)/trips/create')}
          >
            <Text style={styles.quickBtnEmoji}>➕</Text>
            <Text style={styles.quickBtnText}>New Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.purple }]}
            onPress={() => router.push('/(tabs)/ai-suggest')}
          >
            <Text style={styles.quickBtnEmoji}>✨</Text>
            <Text style={styles.quickBtnText}>AI Suggest</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/(tabs)/trips/index')}
          >
            <Text style={styles.quickBtnEmoji}>🗺️</Text>
            <Text style={styles.quickBtnText}>All Trips</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming trips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✈️ Upcoming Trips</Text>
          {upcomingTrips.length === 0 ? (
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push('/(tabs)/trips/create')}
            >
              <Text style={styles.emptyEmoji}>🌴</Text>
              <Text style={styles.emptyText}>No trips planned yet!</Text>
              <Text style={styles.emptySubtext}>Tap to plan your first adventure</Text>
            </TouchableOpacity>
          ) : (
            upcomingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: trip.id } })}
              />
            ))
          )}
        </View>

        {/* Past trips */}
        {pastTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Past Adventures</Text>
            {pastTrips.slice(0, 3).map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: trip.id } })}
              />
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: 24 },
  greeting: { fontSize: 26, fontWeight: '900', color: '#fff' },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flex: 1 },
  quickActions: { flexDirection: 'row', padding: 20, gap: 10 },
  quickBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickBtnEmoji: { fontSize: 22, marginBottom: 4 },
  quickBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  tripCard: { borderRadius: 20, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10, elevation: 4 },
  tripCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  tripEmoji: { fontSize: 40 },
  tripCardBody: { flex: 1 },
  tripTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  tripDest: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  tripDates: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  countdownBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  countdownText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed' },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.text },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
});
