import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTripStore } from '../../../store/tripStore';
import { Colors, CategoryEmojis } from '../../../constants/colors';
import { Expense } from '../../../types';

function ExpenseItem({ expense, memberNames, onDelete }: { expense: Expense; memberNames: Record<string, string>; onDelete: () => void }) {
  const paidByName = memberNames[expense.paidBy] || 'Someone';
  return (
    <View style={styles.expenseItem}>
      <Text style={styles.expenseEmoji}>{expense.emoji}</Text>
      <View style={styles.expenseBody}>
        <Text style={styles.expenseTitle}>{expense.title}</Text>
        <Text style={styles.expenseMeta}>{paidByName} paid · {expense.category}</Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
        <TouchableOpacity onPress={onDelete}>
          <Text style={{ color: Colors.danger, fontSize: 14, marginTop: 2 }}>✕</Text>
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
  const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = total - spent;
  const percentage = total > 0 ? Math.min((spent / total) * 100, 100) : 0;

  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  const handleDelete = (expenseId: string) => {
    Alert.alert('Delete expense?', '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id!, expenseId) },
    ]);
  };

  const progressColor = percentage > 90 ? Colors.danger : percentage > 70 ? Colors.orange : Colors.success;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.green, Colors.secondary]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Budget Tracker</Text>
        <Text style={styles.headerSub}>{trip.title}</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Budget</Text>
              <Text style={styles.summaryValue}>${total.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={[styles.summaryValue, { color: Colors.danger }]}>${spent.toFixed(0)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Left</Text>
              <Text style={[styles.summaryValue, { color: remaining >= 0 ? Colors.success : Colors.danger }]}>
                ${Math.abs(remaining).toFixed(0)}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percentage}%` as any, backgroundColor: progressColor }]} />
          </View>
          <Text style={styles.progressLabel}>{percentage.toFixed(0)}% of budget used</Text>
        </View>

        {/* By category */}
        {Object.keys(byCategory).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.categoriesGrid}>
              {Object.entries(byCategory).map(([cat, amt]) => (
                <View key={cat} style={styles.categoryChip}>
                  <Text style={styles.categoryEmoji}>{CategoryEmojis[cat] || '💸'}</Text>
                  <Text style={styles.categoryName}>{cat}</Text>
                  <Text style={styles.categoryAmt}>${amt.toFixed(0)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Expenses list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          {expenses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>💸</Text>
              <Text style={styles.emptyText}>No expenses logged yet</Text>
            </View>
          ) : (
            expenses.map((e) => (
              <ExpenseItem
                key={e.id}
                expense={e}
                memberNames={trip.memberNames}
                onDelete={() => handleDelete(e.id)}
              />
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
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
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 16, color: '#fff', fontWeight: '600', opacity: 0.85 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#fff' },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
  scroll: { flex: 1 },
  summaryCard: {
    backgroundColor: '#fff', margin: 20, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { fontSize: 24, fontWeight: '900', color: Colors.text, marginTop: 4 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  progressBar: { height: 12, backgroundColor: Colors.border, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  progressLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 6, textAlign: 'right' },
  section: { paddingHorizontal: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 12 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', minWidth: 80,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  categoryEmoji: { fontSize: 20 },
  categoryName: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  categoryAmt: { fontSize: 14, fontWeight: '800', color: Colors.text },
  expenseItem: {
    backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', alignItems: 'center',
    padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  expenseEmoji: { fontSize: 24, marginRight: 12 },
  expenseBody: { flex: 1 },
  expenseTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  expenseMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  expenseRight: { alignItems: 'flex-end' },
  expenseAmount: { fontSize: 16, fontWeight: '900', color: Colors.text },
  empty: { alignItems: 'center', padding: 32 },
  emptyText: { color: Colors.textSecondary, marginTop: 8, fontSize: 14 },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: Colors.green,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: Colors.green, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 32, fontWeight: '300', lineHeight: 36 },
});
