import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/authStore';
import { useTripStore } from '../../../store/tripStore';
import { Colors, TripColors } from '../../../constants/colors';

const EMOJIS = ['✈️','🏖️','🏔️','🌴','🗺️','🎡','🏕️','🚢','🎭','🍜','🌊','🎿'];

export default function CreateTripScreen() {
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('✈️');
  const [selectedColor, setSelectedColor] = useState(TripColors[0]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuthStore();
  const { addTrip } = useTripStore();
  const router = useRouter();

  const handleCreate = async () => {
    if (!title || !destination || !startDate || !endDate) {
      Alert.alert('Missing info', 'Please fill in trip name, destination, and dates.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      Alert.alert('Invalid dates', 'End date must be after start date.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const tripId = await addTrip({
        title: title.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        coverEmoji: selectedEmoji,
        coverColor: selectedColor,
        members: [user.uid],
        memberNames: { [user.uid]: user.displayName },
        budget: {
          total: parseFloat(budget) || 0,
          currency: 'USD',
          categories: { food: 0, transport: 0, accommodation: 0, activities: 0, shopping: 0, other: 0 },
        },
        createdBy: user.uid,
      });
      router.replace({ pathname: '/(tabs)/trips/[id]', params: { id: tripId } });
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Trip 🌍</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Preview card */}
        <View style={[styles.preview, { backgroundColor: selectedColor }]}>
          <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
          <Text style={styles.previewTitle}>{title || 'Trip Name'}</Text>
          <Text style={styles.previewDest}>{destination || 'Destination'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Trip Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spring Break Miami 🌊"
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Destination</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Miami, Florida"
            placeholderTextColor={Colors.textSecondary}
            value={destination}
            onChangeText={setDestination}
          />

          <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2025-03-15"
            placeholderTextColor={Colors.textSecondary}
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>End Date (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            placeholder="2025-03-22"
            placeholderTextColor={Colors.textSecondary}
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.label}>Total Budget (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 800"
            placeholderTextColor={Colors.textSecondary}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Pick an Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnSelected]}
                onPress={() => setSelectedEmoji(e)}
              >
                <Text style={{ fontSize: 24 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Pick a Color</Text>
          <View style={styles.colorRow}>
            {TripColors.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotSelected]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Create Trip 🚀'}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 17, color: Colors.primary, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: '900', color: Colors.text },
  preview: { margin: 20, borderRadius: 20, padding: 28, alignItems: 'center' },
  previewEmoji: { fontSize: 52, marginBottom: 8 },
  previewTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  previewDest: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flex: 1 },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  emojiBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  emojiBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  colorDot: { width: 36, height: 36, borderRadius: 18, borderWidth: 3, borderColor: 'transparent' },
  colorDotSelected: { borderColor: Colors.text, transform: [{ scale: 1.2 }] },
  createBtn: { backgroundColor: Colors.primary, borderRadius: 16, padding: 18, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: '900', fontSize: 17 },
});
