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
import { useAuthStore } from '../../store/authStore';
import { useTripStore } from '../../store/tripStore';
import { Colors } from '../../constants/colors';
import { Trip } from '../../types';

function HeroTripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = Math.ceil((new Date(trip.startDate).getTime() - Date.now()) / 86400000);

  return (
    <TouchableOpacity style={styles.heroCard} onPress={onPress} activeOpacity={0.92}>
      {/* Photo placeholder area */}
      <View style={[styles.heroPhoto, { backgroundColor: trip.coverColor + '30' }]}>
        <Text style={styles.heroEmoji}>{trip.coverEmoji}</Text>
        {daysUntil > 0 && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>in {daysUntil}d</Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: daysUntil > 0 ? Colors.butter : Colors.teal }]}>
          <Text style={styles.statusText}>{daysUntil > 0 ? 'Upcoming' : 'Active'}</Text>
        </View>
      </View>
      {/* Content */}
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{trip.title}</Text>
        <View style={styles.heroDetails}>
          <Text style={styles.heroDetailText}>📍 {trip.destination}</Text>
          <Text style={styles.heroDetailText}>  ·  </Text>
          <Text style={styles.heroDetailText}>🗓 {start} – {end}</Text>
        </View>
        {/* Avatar stack */}
        <View style={styles.avatarStack}>
          {[Colors.coral, Colors.teal, Colors.lilac].map((color, i) => (
            <View key={i} style={[styles.avatarCircle, { backgroundColor: color, marginLeft: i === 0 ? 0 : -8 }]} />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function SmallTripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.smallCard} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.smallEmoji, { backgroundColor: trip.coverColor + '25' }]}>
        <Text style={{ fontSize: 22 }}>{trip.coverEmoji}</Text>
      </View>
      <Text style={styles.smallTitle} numberOfLines={1}>{trip.title}</Text>
      <Text style={styles.smallDest} numberOfLines={1}>📍 {trip.destination}</Text>
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
  const firstName = user?.displayName?.split(' ')[0] || 'Traveler';
  const heroTrip = upcomingTrips[0] || null;
  const radarTrips = upcomingTrips.slice(1);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoSmall}>
          <Text style={styles.logoSmallText}>tm</Text>
        </View>
        <View style={styles.avatarBig}>
          <Text style={styles.avatarBigText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingLabel}>{greeting}</Text>
          <Text style={styles.greetingName}>
            <Text style={styles.greetingNameMuted}>Hey </Text>
            <Text style={styles.greetingNameCoral}>{firstName}</Text>
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickBtnCoral}
            onPress={() => router.push('/(tabs)/trips/create')}
          >
            <Text style={styles.quickBtnText}>New trip +</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickBtnInk}
            onPress={() => router.push('/(tabs)/ai-suggest')}
          >
            <Text style={styles.quickBtnTextLight}>AI Plan ✨</Text>
          </TouchableOpacity>
        </View>

        {/* Hero trip */}
        {heroTrip ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Next up</Text>
            <HeroTripCard
              trip={heroTrip}
              onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: heroTrip.id } })}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.emptyCard}
              onPress={() => router.push('/(tabs)/trips/create')}
            >
              <Text style={styles.emptyEmoji}>🌴</Text>
              <Text style={styles.emptyText}>No trips planned yet!</Text>
              <Text style={styles.emptySubtext}>Tap to plan your first adventure</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* On the radar */}
        {radarTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>On the radar</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radarScroll}>
              {radarTrips.map((trip) => (
                <SmallTripCard
                  key={trip.id}
                  trip={trip}
                  onPress={() => router.push({ pathname: '/(tabs)/trips/[id]', params: { id: trip.id } })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  topBar: {
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 8,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  logoSmall: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.ink, justifyContent: 'center', alignItems: 'center',
  },
  logoSmallText: { fontSize: 14, fontWeight: '900', color: Colors.coral },
  avatarBig: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.coral, justifyContent: 'center', alignItems: 'center',
  },
  avatarBigText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  scroll: { flex: 1 },
  greetingSection: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 4 },
  greetingLabel: { fontSize: 15, fontWeight: '600', color: Colors.ink2 },
  greetingName: { fontSize: 34, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  greetingNameMuted: { color: Colors.ink },
  greetingNameCoral: { color: Colors.coral },
  quickActions: { flexDirection: 'row', paddingHorizontal: 24, gap: 10, marginTop: 20, marginBottom: 4 },
  quickBtnCoral: {
    flex: 1, backgroundColor: Colors.coral, borderRadius: 16,
    padding: 14, alignItems: 'center',
  },
  quickBtnInk: {
    flex: 1, backgroundColor: Colors.ink, borderRadius: 16,
    padding: 14, alignItems: 'center',
  },
  quickBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  quickBtnTextLight: { color: Colors.cream, fontWeight: '800', fontSize: 14 },
  section: { paddingHorizontal: 24, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink, marginBottom: 12 },
  heroCard: {
    backgroundColor: Colors.card, borderRadius: 28, overflow: 'hidden',
    shadowColor: '#281408', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  heroPhoto: { height: 180, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  heroEmoji: { fontSize: 64 },
  countdownBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: Colors.ink, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  countdownText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  statusBadge: {
    position: 'absolute', top: 12, left: 12,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5,
  },
  statusText: { color: Colors.ink, fontWeight: '800', fontSize: 11 },
  heroContent: { padding: 18 },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3, color: Colors.ink },
  heroDetails: { flexDirection: 'row', marginTop: 6, alignItems: 'center' },
  heroDetailText: { fontSize: 13, color: Colors.ink2 },
  avatarStack: { flexDirection: 'row', marginTop: 14 },
  avatarCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: Colors.card },
  emptyCard: {
    backgroundColor: Colors.card, borderRadius: 20, padding: 32, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.line, borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: Colors.ink },
  emptySubtext: { fontSize: 13, color: Colors.ink2, marginTop: 4 },
  radarScroll: { paddingBottom: 4, gap: 12 },
  smallCard: {
    backgroundColor: Colors.card, borderRadius: 18, padding: 14, width: 130,
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 3,
  },
  smallEmoji: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  smallTitle: { fontSize: 13, fontWeight: '800', color: Colors.ink, letterSpacing: -0.2 },
  smallDest: { fontSize: 11, color: Colors.ink2, marginTop: 3 },
});
