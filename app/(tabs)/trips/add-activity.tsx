import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTripStore } from '../../../store/tripStore';
import { Colors } from '../../../constants/colors';

const ACTIVITY_EMOJIS = ['🏖️','🍕','🎡','🏛️','🛍️','🍺','🎵','🏊','🚴','🎭','🌅','🏞️','🍽️','☕','🎮'];

export default function AddActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addActivity } = useTripStore();

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [emoji, setEmoji] = useState('🎡');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!title || !day || !time) {
      Alert.alert('Missing info', 'Please add a title, date, and time.');
      return;
    }
    setLoading(true);
    try {
      await addActivity(id!, { title: title.trim(), location: location.trim(), day, time, notes: notes.trim(), emoji });
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
        <Text style={styles.headerTitle}>Add Activity</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <Text style={styles.label}>Activity Name</Text>
          <TextInput style={styles.input} placeholder="e.g. Beach time 🌊" placeholderTextColor={Colors.textSecondary} value={title} onChangeText={setTitle} />

          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} placeholder="e.g. South Beach" placeholderTextColor={Colors.textSecondary} value={location} onChangeText={setLocation} />

          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} placeholder="2025-03-15" placeholderTextColor={Colors.textSecondary} value={day} onChangeText={setDay} keyboardType="numbers-and-punctuation" />

          <Text style={styles.label}>Time (HH:MM)</Text>
          <TextInput style={styles.input} placeholder="09:00" placeholderTextColor={Colors.textSecondary} value={time} onChangeText={setTime} keyboardType="numbers-and-punctuation" />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any details, reminders, or tips..."
            placeholderTextColor={Colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Pick an Emoji</Text>
          <View style={styles.emojiGrid}>
            {ACTIVITY_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnSelected]}
                onPress={() => setEmoji(e)}
              >
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.addBtn, loading && { opacity: 0.6 }]}
            onPress={handleAdd}
            disabled={loading}
          >
            <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Add to Itinerary ✅'}</Text>
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
  textArea: { height: 80, textAlignVertical: 'top' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  emojiBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  addBtn: { backgroundColor: Colors.secondary, borderRadius: 16, padding: 18, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
