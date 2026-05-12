import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
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
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      await addExpense(id!, {
        title: title.trim(),
        amount: parsedAmount,
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>What did you spend on?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dinner at the beach bar"
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Amount (USD)</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0.00"
            placeholderTextColor={Colors.textSecondary}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={{ fontSize: 20 }}>{CategoryEmojis[cat]}</Text>
                <Text style={[styles.categoryLabel, category === cat && styles.categoryLabelActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.paidByCard}>
            <Text style={styles.paidByLabel}>💳 Paid by</Text>
            <Text style={styles.paidByValue}>{user?.displayName} (you)</Text>
            <Text style={styles.paidByNote}>Split equally among all group members</Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, loading && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={loading}
          >
            <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Log Expense 💸'}</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderBottomWidth: 1, borderColor: Colors.border,
  },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  scroll: { flex: 1 },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15,
    color: Colors.text, marginBottom: 16, borderWidth: 1, borderColor: Colors.border,
  },
  amountInput: { fontSize: 28, fontWeight: '900', textAlign: 'center', color: Colors.primary },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  categoryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 2, borderColor: 'transparent',
  },
  categoryBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'capitalize' },
  categoryLabelActive: { color: Colors.primary, fontWeight: '800' },
  paidByCard: {
    backgroundColor: Colors.accent + '40', borderRadius: 14, padding: 14, marginBottom: 24,
  },
  paidByLabel: { fontSize: 13, fontWeight: '700', color: Colors.text },
  paidByValue: { fontSize: 16, fontWeight: '800', color: Colors.text, marginTop: 4 },
  paidByNote: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  addBtn: { backgroundColor: Colors.green, borderRadius: 16, padding: 18, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
