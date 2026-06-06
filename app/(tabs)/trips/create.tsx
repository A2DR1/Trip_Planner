import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
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
          <Text style={styles.backBtnText}>‹ Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Trip</Text>
        <Text style={styles.stepIndicator}>1 / 3</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero preview */}
        <View style={[styles.heroPreview, { backgroundColor: selectedColor }]}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroLabel}>PREVIEW</Text>
          <Text style={styles.heroEmoji}>{selectedEmoji}</Text>
          <Text style={styles.heroTitle}>{title || 'Trip Name'}</Text>
          <Text style={styles.heroDest}>{destination || 'Destination'}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>TRIP NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spring Break Miami"
            placeholderTextColor={Colors.ink2}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>DESTINATION</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Miami, Florida"
            placeholderTextColor={Colors.ink2}
            value={destination}
            onChangeText={setDestination}
          />

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.label}>START DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.ink2}
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.label}>END DATE</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.ink2}
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Text style={styles.label}>TOTAL BUDGET (USD)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 800"
            placeholderTextColor={Colors.ink2}
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
          />

          <Text style={styles.label}>COVER EMOJI</Text>
          <View style={styles.emojiGrid}>
            {EMOJIS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
                onPress={() => setSelectedEmoji(e)}
              >
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>COVER COLOR</Text>
          <View style={styles.colorRow}>
            {TripColors.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, selectedColor === c && styles.colorDotActive]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelBtnText}>Save draft</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.createBtn, loading && { opacity: 0.6 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Continue →'}</Text>
            </TouchableOpacity>
          </View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            <View style={styles.dotActive} />
            <View style={styles.dotInactive} />
            <View style={styles.dotInactive} />
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: {
    paddingTop: 56, paddingHorizontal: 22, paddingBottom: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  backBtn: {},
  backBtnText: { fontSize: 15, color: Colors.coral, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink },
  stepIndicator: { fontSize: 13, color: Colors.ink2, fontWeight: '600' },
  scroll: { flex: 1 },
  heroPreview: {
    marginHorizontal: 20, borderRadius: 24, padding: 24,
    alignItems: 'center', overflow: 'hidden', marginBottom: 8,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  heroLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.8, marginBottom: 8 },
  heroEmoji: { fontSize: 52, marginBottom: 10 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },
  heroDest: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  form: { paddingHorizontal: 20, paddingTop: 16 },
  label: { fontSize: 11, fontWeight: '800', color: Colors.ink2, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 },
  input: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 14,
    fontSize: 15, fontWeight: '600', color: Colors.ink,
    borderWidth: 1.5, borderColor: Colors.line, marginBottom: 16,
  },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: { flex: 1 },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  emojiBtn: {
    width: 46, height: 46, borderRadius: 12,
    backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: { borderColor: Colors.coral, backgroundColor: Colors.coral + '15' },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  colorDot: { width: 32, height: 32, borderRadius: 32, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderWidth: 3, borderColor: Colors.ink },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderRadius: 16, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.line,
  },
  cancelBtnText: { color: Colors.ink2, fontWeight: '700', fontSize: 14 },
  createBtn: { flex: 2, backgroundColor: Colors.coral, borderRadius: 16, padding: 16, alignItems: 'center' },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 },
  dotActive: { width: 26, height: 6, borderRadius: 3, backgroundColor: Colors.coral },
  dotInactive: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.line },
});
