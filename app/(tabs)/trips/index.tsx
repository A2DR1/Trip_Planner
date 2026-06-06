import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';
import { Trip } from '../../../types';

const FILTERS = ['All', 'Upcoming', 'Past'];

function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const isUpcoming = new Date(trip.endDate) >= new Date();
  const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);

  return (
    <TouchableOpacity style={[styles.card, !isUpcoming && styles.cardPast]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.cardEmoji, { backgroundColor: trip.coverColor + '28' }]}>
        <Text style={{ fontSize: 24 }}>{trip.coverEmoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{trip.title}</Text>
        <Text style={styles.cardLocation}>📍 {trip.destination}</Text>
        <Text style={styles.cardDates}>{start} – {end}</Text>
      </View>
      {isUpcoming && daysUntil > 0 ? (
        <View style={[styles.badge, { backgroundColor: trip.coverColor }]}>
          <Text style={styles.badgeText}>{daysUntil}d</Text>
        </View>
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const { user } = useAuthStore();
  const { trips, subscribeToTrips } = useTripStore();
  const router = useRouter();
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    return subscribeToTrips(user.uid);
  }, [user]);

  const filtered = trips.filter((t) => {
    if (filter === 'Upcoming') return new Date(t.endDate) >= new Date();
    if (filter === 'Past') return new Date(t.endDate) < new Date();
    return true;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Trips 🗺️</Text>
        <Text style={styles.subtitle}>{trips.length} adventure{trips.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 52 }}>🌍</Text>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptySub}>Create your first adventure below</Text>
            </View>
          ) : (
            filtered.map((t) => (
              <TripCard
                key={t.id}
                trip={t}
                onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: t.id } })}
              />
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/(tabs)/trips/create')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 12 },
  title: { fontSize: 32, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.ink2, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.line,
  },
  filterChipActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  filterText: { fontSize: 12, fontWeight: '700', color: Colors.ink2 },
  filterTextActive: { color: Colors.cream },
  scroll: { flex: 1 },
  list: { paddingHorizontal: 20, paddingTop: 8 },
  card: {
    backgroundColor: Colors.card, borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    padding: 14, marginBottom: 10,
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 3,
  },
  cardPast: { opacity: 0.7 },
  cardEmoji: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.ink, letterSpacing: -0.2 },
  cardLocation: { fontSize: 12, color: Colors.ink2, marginTop: 2 },
  cardDates: { fontSize: 11, color: Colors.ink2, marginTop: 1, fontWeight: '600' },
  badge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chevron: { fontSize: 22, color: Colors.ink2 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.ink, marginTop: 14 },
  emptySub: { color: Colors.ink2, marginTop: 6, fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 100, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: Colors.coral,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.coral, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
