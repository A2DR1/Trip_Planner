import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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
      {/* Sheet handle */}
      <View style={styles.handle} />

      <View style={styles.header}>
        <Text style={styles.title}>Add Activity</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Emoji + title row */}
          <View style={styles.emojiTitleRow}>
            <View style={styles.emojiDisplay}>
              <Text style={{ fontSize: 28 }}>{emoji}</Text>
            </View>
            <TextInput
              style={[styles.input, styles.titleInput]}
              placeholder="Activity name"
              placeholderTextColor={Colors.ink2}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Emoji picker */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
            {ACTIVITY_EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]}
                onPress={() => setEmoji(e)}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Date & time row */}
          <View style={styles.twoCol}>
            <View style={styles.colField}>
              <Text style={styles.label}>DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.ink2}
                value={day}
                onChangeText={setDay}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.colField}>
              <Text style={styles.label}>TIME</Text>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={Colors.ink2}
                value={time}
                onChangeText={setTime}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>LOCATION</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. South Beach"
            placeholderTextColor={Colors.ink2}
            value={location}
            onChangeText={setLocation}
          />

          <Text style={styles.label}>NOTES (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any details, tips, or reminders..."
            placeholderTextColor={Colors.ink2}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, loading && { opacity: 0.6 }]}
              onPress={handleAdd}
              disabled={loading}
            >
              <Text style={styles.addBtnText}>{loading ? 'Adding...' : 'Add ✅'}</Text>
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
  form: { paddingHorizontal: 20 },
  emojiTitleRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  emojiDisplay: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: Colors.butter + '60', borderWidth: 1.5, borderColor: Colors.butter,
    justifyContent: 'center', alignItems: 'center',
  },
  titleInput: { flex: 1, borderColor: Colors.coral },
  emojiScroll: { marginBottom: 16 },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 12, marginRight: 8,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: Colors.butter, backgroundColor: Colors.butter + '40' },
  twoCol: { flexDirection: 'row', gap: 10 },
  colField: { flex: 1 },
  label: { fontSize: 10, fontWeight: '800', color: Colors.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: Colors.card, borderRadius: 14, padding: 14,
    fontSize: 15, fontWeight: '600', color: Colors.ink,
    borderWidth: 1.5, borderColor: Colors.line, marginBottom: 14,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  cancelBtn: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.line,
  },
  cancelBtnText: { color: Colors.ink2, fontWeight: '700', fontSize: 14 },
  addBtn: { flex: 2, backgroundColor: Colors.teal, borderRadius: 16, padding: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
