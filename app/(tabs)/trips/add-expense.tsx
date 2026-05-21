import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../store/tripStore';
import { useAuthStore } from '../../../store/authStore';
import { Colors, CategoryEmojis } from '../../../constants/colors';

const CATEGORIES = ['food', 'transport', 'accommodation', 'activities', 'shopping', 'other'];

export default function AddExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addExpense, trips } = useTripStore();
  const { user } = useAuthStore();

  const trip = trips.find((t) => t.id === id);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !amount) {
      Alert.alert('Missing info', 'Please add a title and amount.');
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      await addExpense(id!, {
        title: title.trim(),
        amount: parsed,
        category,
        paidBy: user!.uid,
        splitAmong: trip?.members ?? [user!.uid],
        date: new Date().toISOString(),
        emoji: CategoryEmojis[category] || '💸',
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Sheet handle */}
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.title}>Add Expense</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Amount display (ink card) */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>WHAT DID YOU SPEND ON?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner at the beach bar"
            placeholderTextColor={Colors.ink2}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>CATEGORY</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, category === cat && styles.catChipActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={{ fontSize: 16 }}>{CategoryEmojis[cat]}</Text>
                <Text style={[styles.catLabel, category === cat && styles.catLabelActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.paidByCard}>
            <Text style={styles.paidByLabel}>💳 Paid by</Text>
            <Text style={styles.paidByValue}>{user?.displayName} (you)</Text>
            <Text style={styles.paidByNote}>Split equally among all group members</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, loading && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Log Expense 💸'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: Colors.line, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingBottom: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.ink, letterSpacing: -0.3 },
  cancelText: { fontSize: 15, color: Colors.coral, fontWeight: '600' },
  scroll: { flex: 1 },
  amountCard: {
    backgroundColor: Colors.ink, marginHorizontal: 20, borderRadius: 22, padding: 22,
    alignItems: 'center', marginBottom: 8,
  },
  amountLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.8, marginBottom: 10 },
  amountRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: 28, color: 'rgba(255,255,255,0.5)', fontWeight: '700', marginRight: 4 },
  amountInput: { fontSize: 52, fontWeight: '800', color: '#fff', letterSpacing: -2, minWidth: 120, textAlign: 'center' },
  form: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 10, fontWeight: '800', color: Colors.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    fontSize: 15, fontWeight: '600', color: Colors.ink,
    borderWidth: 1.5, borderColor: Colors.line, marginBottom: 16,
  },
  catScroll: { marginBottom: 16 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.card, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: Colors.line,
  },
  catChipActive: { backgroundColor: Colors.coral, borderColor: Colors.coral },
  catLabel: { fontSize: 12, fontWeight: '700', color: Colors.ink2 },
  catLabelActive: { color: '#fff', fontWeight: '800' },
  paidByCard: {
    backgroundColor: Colors.butter + '40', borderRadius: 14, padding: 14, marginBottom: 24,
  },
  paidByLabel: { fontSize: 13, fontWeight: '700', color: Colors.ink },
  paidByValue: { fontSize: 16, fontWeight: '800', color: Colors.ink, marginTop: 4 },
  paidByNote: { fontSize: 12, color: Colors.ink2, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.line,
  },
  cancelBtnText: { color: Colors.ink2, fontWeight: '700', fontSize: 14 },
  addBtn: { flex: 2, backgroundColor: Colors.coral, borderRadius: 16, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
