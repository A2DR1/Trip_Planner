import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../store/tripStore';
import { Colors, CategoryEmojis } from '../../../constants/colors';
import { Expense } from '../../../types';

function ExpenseItem({ expense, memberNames, onDelete }: {
  expense: Expense; memberNames: Record<string, string>; onDelete: () => void;
}) {
  return (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseEmoji}>{expense.emoji}</Text>
      <View style={styles.expenseBody}>
        <Text style={styles.expenseTitle}>{expense.title}</Text>
        <Text style={styles.expenseMeta}>{memberNames[expense.paidBy] || 'Someone'} · {expense.category}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ color: Colors.danger, fontSize: 13, marginTop: 2 }}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { trips, expenses, subscribeToExpenses, deleteExpense } = useTripStore();
  const trip = trips.find((t) => t.id === id);

  useEffect(() => {
    if (!id) return;
    return subscribeToExpenses(id);
  }, [id]);

  if (!trip) return null;

  const total = trip.budget.total;
  const spent = expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = total - spent;
  const pct = total > 0 ? Math.min((spent / total) * 100, 100) : 0;
  const progressColor = pct > 90 ? Colors.danger : pct > 70 ? Colors.orange : Colors.teal;

  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Budget 💰</Text>
        <Text style={styles.subtitle}>{trip.title}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Total card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL BUDGET</Text>
          <Text style={styles.totalAmount}>${total.toFixed(0)}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: progressColor }]} />
          </View>
          <Text style={styles.totalMeta}>${spent.toFixed(2)} spent · ${Math.abs(remaining).toFixed(2)} {remaining >= 0 ? 'left' : 'over'}</Text>
        </View>

        {/* Categories */}
        {Object.keys(byCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.catCard}>
              {Object.entries(byCategory).map(([cat, amt], i, arr) => (
                <View key={cat} style={[styles.catRow, i < arr.length - 1 && styles.catRowBorder]}>
                  <View style={styles.catLeft}>
                    <View style={[styles.catEmoji, { backgroundColor: Colors.coral + '25' }]}>
                      <Text style={{ fontSize: 18 }}>{CategoryEmojis[cat] || '💸'}</Text>
                    </View>
                    <Text style={styles.catName}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={styles.catAmt}>${amt.toFixed(2)}</Text>
                    <View style={styles.catProgressTrack}>
                      <View style={[styles.catProgressFill, { width: `${total > 0 ? (amt / total) * 100 : 0}%` as any }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expenses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          {expenses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>💸</Text>
              <Text style={styles.emptyText}>No expenses logged yet</Text>
            </View>
          ) : (
            <View style={styles.expenseList}>
              {expenses.map((e) => (
                <ExpenseItem
                  key={e.id}
                  expense={e}
                  memberNames={trip.memberNames}
                  onDelete={() => Alert.alert('Delete?', '', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id!, e.id) },
                  ])}
                />
              ))}
            </View>
          )}
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/(tabs)/trips/add-expense', params: { id } })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  backBtn: { marginBottom: 12 },
  backBtnText: { fontSize: 16, color: Colors.coral, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.ink, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.ink2, marginTop: 4 },
  scroll: { flex: 1 },
  totalCard: {
    backgroundColor: Colors.ink, marginHorizontal: 20, borderRadius: 22, padding: 22, marginBottom: 4,
  },
  totalLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, textTransform: 'uppercase' },
  totalAmount: { fontSize: 42, fontWeight: '800', color: '#fff', letterSpacing: -1, marginTop: 6 },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  totalMeta: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 8 },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.ink, marginBottom: 10 },
  catCard: {
    backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 2,
  },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 14 },
  catRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.line },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  catEmoji: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  catName: { fontSize: 14, fontWeight: '700', color: Colors.ink, textTransform: 'capitalize' },
  catRight: { alignItems: 'flex-end', gap: 4 },
  catAmt: { fontSize: 14, fontWeight: '800', color: Colors.ink },
  catProgressTrack: { width: 60, height: 4, backgroundColor: Colors.line, borderRadius: 99, overflow: 'hidden' },
  catProgressFill: { height: '100%', backgroundColor: Colors.coral, borderRadius: 99 },
  expenseList: {
    backgroundColor: Colors.card, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#281408', shadowOpacity: 0.06, shadowRadius: 9, elevation: 2,
  },
  expenseItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.line,
  },
  expenseEmoji: { fontSize: 22, marginRight: 12 },
  expenseBody: { flex: 1 },
  expenseTitle: { fontSize: 14, fontWeight: '700', color: Colors.ink },
  expenseMeta: { fontSize: 12, color: Colors.ink2, marginTop: 2, textTransform: 'capitalize' },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 15, fontWeight: '800', color: Colors.ink },
  empty: { alignItems: 'center', padding: 32 },
  emptyText: { color: Colors.ink2, marginTop: 8 },
  fab: {
    position: 'absolute', bottom: 100, right: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: Colors.green,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.green, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
