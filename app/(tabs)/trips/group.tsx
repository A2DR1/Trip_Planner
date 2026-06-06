import { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';

function MemberAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = [Colors.coral, Colors.teal, Colors.lilac, Colors.orange, Colors.blue];
  const color = avatarColors[name.length % avatarColors.length];
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

export default function GroupScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips, expenses, subscribeToExpenses } = useTripStore();

  const trip = trips.find((t) => t.id === id);

  useEffect(() => {
    if (!id) return;
    return subscribeToExpenses(id);
  }, [id]);

  if (!trip) return null;

  // Calculate who owes whom
  const memberIds = trip.members;
  const memberNames = trip.memberNames;

  // Net balance per member (positive = owed money, negative = owes money)
  const balances: Record<string, number> = {};
  memberIds.forEach((uid) => (balances[uid] = 0));

  expenses.forEach((expense) => {
    const paidBy = expense.paidBy;
    const splitCount = expense.splitAmong.length;
    const share = expense.amount / splitCount;

    expense.splitAmong.forEach((uid) => {
      if (uid === paidBy) {
        balances[paidBy] = (balances[paidBy] || 0) + expense.amount - share;
      } else {
        balances[uid] = (balances[uid] || 0) - share;
        balances[paidBy] = (balances[paidBy] || 0) + share;
      }
    });
  });

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = memberIds.length > 0 ? totalSpent / memberIds.length : 0;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join my trip "${trip.title}" on TripMate! Trip ID: ${id}`,
        title: 'Join my trip on TripMate',
      });
    } catch (e) {}
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Crew 👥</Text>
        <Text style={styles.subtitle}>{memberIds.length} member{memberIds.length !== 1 ? 's' : ''} · {trip.title}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Members */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Members</Text>
            <TouchableOpacity style={styles.inviteBtn} onPress={handleShare}>
              <Text style={styles.inviteBtnText}>Invite +</Text>
            </TouchableOpacity>
          </View>
          {memberIds.map((uid) => {
            const balance = balances[uid] || 0;
            return (
              <View key={uid} style={styles.memberRow}>
                <MemberAvatar name={memberNames[uid] || uid} />
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{memberNames[uid] || uid}</Text>
                  <Text style={styles.memberBalance}>
                    {balance > 0.01
                      ? `Gets back $${balance.toFixed(2)}`
                      : balance < -0.01
                      ? `Owes $${Math.abs(balance).toFixed(2)}`
                      : 'Settled up ✅'}
                  </Text>
                </View>
                <Text style={[
                  styles.balanceAmount,
                  { color: balance > 0 ? Colors.success : balance < 0 ? Colors.danger : Colors.ink2 }
                ]}>
                  {balance > 0 ? '+' : ''}{balance.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Summary stats */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={styles.statValue}>${totalSpent.toFixed(2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Per Person</Text>
            <Text style={styles.statValue}>${perPerson.toFixed(2)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Expenses</Text>
            <Text style={styles.statValue}>{expenses.length}</Text>
          </View>
        </View>

        {/* Recent expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          {expenses.length === 0 ? (
            <Text style={styles.emptyText}>No expenses logged yet</Text>
          ) : (
            expenses.slice(0, 5).map((e) => (
              <View key={e.id} style={styles.expenseRow}>
                <Text style={{ fontSize: 22 }}>{e.emoji}</Text>
                <View style={styles.expenseBody}>
                  <Text style={styles.expenseTitle}>{e.title}</Text>
                  <Text style={styles.expensePaidBy}>{memberNames[e.paidBy] || e.paidBy} paid</Text>
                </View>
                <Text style={styles.expenseAmt}>${e.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 24 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 16, color: Colors.coral, fontWeight: '600' },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.ink },
  inviteBtn: {
    backgroundColor: Colors.lilac + '30', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  inviteBtnText: { color: Colors.ink, fontWeight: '700', fontSize: 12 },
  memberRow: {
    backgroundColor: Colors.card, borderRadius: 18, flexDirection: 'row', alignItems: 'center',
    padding: 16, marginBottom: 8,
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 2,
  },
  avatar: { width: 48, height: 48, borderRadius: 48, justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 3, borderColor: Colors.card },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  memberBalance: { fontSize: 12, color: Colors.ink2, marginTop: 2 },
  balanceAmount: { fontSize: 16, fontWeight: '900' },
  statsCard: {
    backgroundColor: Colors.ink, marginHorizontal: 20, marginTop: 4, borderRadius: 22, padding: 22,
    flexDirection: 'row', justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  expenseRow: {
    backgroundColor: Colors.card, borderRadius: 14, flexDirection: 'row', alignItems: 'center',
    padding: 14, marginBottom: 8, gap: 10,
    shadowColor: '#281408', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  expenseBody: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  expensePaidBy: { fontSize: 12, color: Colors.ink2, marginTop: 2 },
  expenseAmt: { fontSize: 15, fontWeight: '800', color: Colors.ink },
  emptyText: { color: Colors.ink2, fontStyle: 'italic', paddingVertical: 8 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.ink2, marginTop: 4 },
});
