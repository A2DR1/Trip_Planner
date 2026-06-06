import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';
import { Activity } from '../../../types';

const TABS = ['Itinerary', 'Budget', 'Crew'] as const;
type TabType = typeof TABS[number];

function ActivityCard({ activity, onDelete }: { activity: Activity; onDelete: () => void }) {
  const nodeColors: Record<string, string> = {
    '🏖️': Colors.teal, '🍕': Colors.coral, '🎡': Colors.lilac,
    '🏛️': Colors.butter, '🛍️': Colors.orange, '🍺': Colors.blue,
  };
  const nodeColor = nodeColors[activity.emoji] || Colors.coral;

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <Text style={styles.timelineTime}>{activity.time}</Text>
        <View style={[styles.timelineNode, { backgroundColor: nodeColor, shadowColor: nodeColor }]} />
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={{ color: Colors.danger, fontSize: 14 }}>✕</Text>
          </TouchableOpacity>
        </View>
        {activity.location ? <Text style={styles.activityMeta}>📍 {activity.location}</Text> : null}
        {activity.notes ? <Text style={styles.activityNotes}>{activity.notes}</Text> : null}
        <View style={[styles.activityTag, { backgroundColor: nodeColor + '30' }]}>
          <Text style={[styles.activityTagText, { color: nodeColor }]}>Activity</Text>
        </View>
      </View>
    </View>
  );
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips, activities, subscribeToActivities, deleteActivity } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabType>('Itinerary');

  const trip = trips.find((t) => t.id === id);

  useEffect(() => {
    if (!id) return;
    return subscribeToActivities(id);
  }, [id]);

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: Colors.ink }}>Trip not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.coral, marginTop: 8 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const byDay: Record<string, Activity[]> = {};
  activities.forEach((a) => {
    if (!byDay[a.day]) byDay[a.day] = [];
    byDay[a.day].push(a);
  });
  const days = Object.keys(byDay).sort();

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  const spent = 0;
  const budgetUsed = trip.budget.total > 0 ? (spent / trip.budget.total) * 100 : 0;

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert('Delete activity?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteActivity(id!, activityId) },
    ]);
  };

  const handleTabPress = (tab: TabType) => {
    if (tab === 'Budget') {
      router.push({ pathname: '/(tabs)/trips/budget', params: { id } });
    } else if (tab === 'Crew') {
      router.push({ pathname: '/(tabs)/trips/group', params: { id } });
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <View style={styles.container}>
      {/* Hero area */}
      <View style={[styles.hero, { backgroundColor: trip.coverColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.heroEmoji}>{trip.coverEmoji}</Text>
        <View style={styles.heroBottom}>
          <Text style={styles.heroTitle}>{trip.title}</Text>
          <Text style={styles.heroDest}>📍 {trip.destination}</Text>
        </View>
      </View>

      {/* Stats card */}
      <View style={styles.statsCard}>
        {[
          { value: `${duration}`, label: 'DAYS' },
          { value: `${trip.members.length}`, label: 'CREW' },
          { value: `$${trip.budget.total}`, label: 'BUDGET' },
          { value: `${Math.round(budgetUsed)}%`, label: 'USED' },
        ].map((s, i) => (
          <View key={i} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabPill, activeTab === tab && styles.tabPillActive]}
            onPress={() => handleTabPress(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {days.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📅</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>Tap + to add your first activity</Text>
          </View>
        ) : (
          days.map((day) => (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayLabel}>
                {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              {byDay[day].map((a) => (
                <ActivityCard key={a.id} activity={a} onDelete={() => handleDeleteActivity(a.id)} />
              ))}
            </View>
          ))
        )}
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(tabs)/trips/add-activity', params: { id } })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  hero: { height: 260, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    position: 'absolute', top: 56, left: 18,
    width: 40, height: 40, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontSize: 22, color: '#fff', fontWeight: '600' },
  heroEmoji: { fontSize: 64 },
  heroBottom: { position: 'absolute', bottom: 20, left: 22, right: 22 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  heroDest: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  statsCard: {
    backgroundColor: Colors.card, marginHorizontal: 20, marginTop: -22,
    borderRadius: 22, padding: 18, flexDirection: 'row', justifyContent: 'space-around',
    shadowColor: '#281408', shadowOpacity: 0.10, shadowRadius: 15, elevation: 5,
    zIndex: 2,
  },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.ink },
  statLabel: { fontSize: 10, fontWeight: '700', color: Colors.ink2, textTransform: 'uppercase', marginTop: 2, letterSpacing: 0.5 },
  tabsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  tabPill: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.line,
  },
  tabPillActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.ink2 },
  tabTextActive: { color: Colors.cream },
  scroll: { flex: 1 },
  daySection: { paddingHorizontal: 20, paddingTop: 4 },
  dayLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.ink2, letterSpacing: 0.6,
    textTransform: 'uppercase', marginBottom: 12,
  },
  timelineRow: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  timelineLeft: { alignItems: 'center', paddingTop: 10 },
  timelineTime: { fontSize: 11, fontWeight: '700', color: Colors.ink2, marginBottom: 4, width: 36, textAlign: 'right' },
  timelineNode: {
    width: 10, height: 10, borderRadius: 10,
    borderWidth: 2, borderColor: Colors.cream,
    shadowOpacity: 0.5, shadowRadius: 3, elevation: 2,
  },
  timelineLine: { flex: 1, width: 2, backgroundColor: Colors.line, marginTop: 2 },
  activityCard: {
    flex: 1, backgroundColor: Colors.card, borderRadius: 18, padding: 14,
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 2,
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  activityEmoji: { fontSize: 20 },
  activityTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.ink },
  deleteBtn: { padding: 4 },
  activityMeta: { fontSize: 12, color: Colors.ink2, marginTop: 2 },
  activityNotes: { fontSize: 13, color: Colors.ink, marginTop: 4, fontStyle: 'italic', lineHeight: 18 },
  activityTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginTop: 8 },
  activityTagText: { fontSize: 10, fontWeight: '800' },
  empty: { alignItems: 'center', paddingTop: 52 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink, marginTop: 12 },
  emptySub: { color: Colors.ink2, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 100, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: Colors.coral,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.coral, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.cream },
});
