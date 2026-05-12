import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';
import { Activity } from '../../../types';

function ActivityItem({ activity, onDelete }: { activity: Activity; onDelete: () => void }) {
  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityTime}>{activity.time}</Text>
      <View style={styles.activityDot} />
      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityEmoji}>{activity.emoji}</Text>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={{ color: Colors.danger, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>
        {activity.location ? <Text style={styles.activityLoc}>📍 {activity.location}</Text> : null}
        {activity.notes ? <Text style={styles.activityNotes}>{activity.notes}</Text> : null}
      </View>
    </View>
  );
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips, activities, subscribeToActivities, deleteActivity } = useTripStore();
  const [activeTab, setActiveTab] = useState<'itinerary' | 'budget' | 'group'>('itinerary');

  const trip = trips.find((t) => t.id === id);

  useEffect(() => {
    if (!id) return;
    return subscribeToActivities(id);
  }, [id]);

  if (!trip) {
    return (
      <View style={styles.notFound}>
        <Text>Trip not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group activities by day
  const byDay: Record<string, Activity[]> = {};
  activities.forEach((a) => {
    if (!byDay[a.day]) byDay[a.day] = [];
    byDay[a.day].push(a);
  });
  const days = Object.keys(byDay).sort();

  const handleDeleteActivity = (activityId: string) => {
    Alert.alert('Delete activity?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteActivity(id!, activityId) },
    ]);
  };

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  const duration = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[trip.coverColor, trip.coverColor + 'AA']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerEmoji}>{trip.coverEmoji}</Text>
        <Text style={styles.headerTitle}>{trip.title}</Text>
        <Text style={styles.headerSub}>📍 {trip.destination} · {duration} days</Text>
      </LinearGradient>

      {/* Tab bar */}
      <View style={styles.tabs}>
        {(['itinerary', 'budget', 'group'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              if (tab === 'budget') router.push({ pathname: '/(tabs)/trips/budget', params: { id } });
              else if (tab === 'group') router.push({ pathname: '/(tabs)/trips/group', params: { id } });
              else setActiveTab(tab);
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'itinerary' ? '🗓 Itinerary' : tab === 'budget' ? '💰 Budget' : '👥 Group'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {days.length === 0 ? (
          <View style={styles.empty}>
            <Text style={{ fontSize: 52 }}>📅</Text>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>Add your first activity below</Text>
          </View>
        ) : (
          days.map((day) => (
            <View key={day} style={styles.daySection}>
              <Text style={styles.dayLabel}>
                {new Date(day).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              {byDay[day].map((a) => (
                <ActivityItem key={a.id} activity={a} onDelete={() => handleDeleteActivity(a.id)} />
              ))}
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  backText: { fontSize: 28, color: '#fff', fontWeight: '300' },
  headerEmoji: { fontSize: 52, marginBottom: 8 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary, fontWeight: '800' },
  scroll: { flex: 1 },
  daySection: { padding: 20, paddingBottom: 0 },
  dayLabel: { fontSize: 14, fontWeight: '800', color: Colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  activityItem: { flexDirection: 'row', marginBottom: 12 },
  activityTime: { width: 46, fontSize: 11, color: Colors.textSecondary, fontWeight: '700', paddingTop: 10 },
  activityDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 12, marginHorizontal: 8 },
  activityCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  activityHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activityEmoji: { fontSize: 20 },
  activityTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: Colors.text },
  deleteBtn: { padding: 4 },
  activityLoc: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  activityNotes: { fontSize: 13, color: Colors.text, marginTop: 4, fontStyle: 'italic' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 12 },
  emptySub: { color: Colors.textSecondary, marginTop: 4 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
  notFound: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
