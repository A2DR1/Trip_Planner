import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../store/authStore';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';
import { Trip } from '../../../types';

function TripRow({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.rowEmoji, { backgroundColor: trip.coverColor + '22' }]}>
        <Text style={{ fontSize: 28 }}>{trip.coverEmoji}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{trip.title}</Text>
        <Text style={styles.rowDest}>📍 {trip.destination}</Text>
        <Text style={styles.rowDates}>{start} – {end}</Text>
      </View>
      <Text style={styles.rowChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const { user } = useAuthStore();
  const { trips, subscribeToTrips } = useTripStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    return subscribeToTrips(user.uid);
  }, [user]);

  const upcoming = trips.filter((t) => new Date(t.endDate) >= new Date());
  const past = trips.filter((t) => new Date(t.endDate) < new Date());

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.secondary, Colors.blue]} style={styles.header}>
        <Text style={styles.headerTitle}>My Trips 🗺️</Text>
        <Text style={styles.headerSub}>{trips.length} adventure{trips.length !== 1 ? 's' : ''} total</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {trips.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 64 }}>🌍</Text>
            <Text style={styles.emptyTitle}>No trips yet!</Text>
            <Text style={styles.emptySub}>Create your first trip below</Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                {upcoming.map((t) => (
                  <TripRow key={t.id} trip={t} onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: t.id } })} />
                ))}
              </View>
            )}
            {past.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Past</Text>
                {past.map((t) => (
                  <TripRow key={t.id} trip={t} onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: t.id } })} />
                ))}
              </View>
            )}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/trips/create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 24 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  scroll: { flex: 1 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  row: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  rowEmoji: { width: 52, height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 16, fontWeight: '800', color: Colors.text },
  rowDest: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  rowDates: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  rowChevron: { fontSize: 24, color: Colors.textSecondary },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 16 },
  emptySub: { color: Colors.textSecondary, marginTop: 6 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
});
