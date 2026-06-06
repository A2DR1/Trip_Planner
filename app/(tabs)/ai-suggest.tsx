import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { suggestDestinations, generateItinerary, generatePackingList } from '../../lib/claude';
import { Colors } from '../../constants/colors';

type Mode = 'destinations' | 'itinerary' | 'packing';

const MODES: { key: Mode; emoji: string; label: string; desc: string }[] = [
  { key: 'destinations', emoji: '🌍', label: 'Destination Ideas', desc: 'Find your perfect spot' },
  { key: 'itinerary', emoji: '📅', label: 'Build Itinerary', desc: 'Day-by-day plan' },
  { key: 'packing', emoji: '🧳', label: 'Packing List', desc: 'Never forget anything' },
];

export default function AISuggestScreen() {
  const [mode, setMode] = useState<Mode>('destinations');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  // Destination fields
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [vibe, setVibe] = useState('');
  const [startingFrom, setStartingFrom] = useState('');

  // Itinerary fields
  const [destination, setDestination] = useState('');
  const [iDuration, setIDuration] = useState('');
  const [iBudget, setIBudget] = useState('');
  const [interests, setInterests] = useState('');

  // Packing fields
  const [pDest, setPDest] = useState('');
  const [pDuration, setPDuration] = useState('');
  const [activities, setActivities] = useState('');

  const handleGenerate = async () => {
    setResult('');
    setLoading(true);
    try {
      let response = '';
      if (mode === 'destinations') {
        if (!budget || !duration || !vibe) {
          Alert.alert('Fill in the details', 'Please complete all fields.');
          setLoading(false);
          return;
        }
        response = await suggestDestinations({
          budget: parseFloat(budget),
          duration: parseInt(duration),
          vibe,
          startingFrom: startingFrom || 'anywhere',
        });
      } else if (mode === 'itinerary') {
        if (!destination || !iDuration) {
          Alert.alert('Fill in the details', 'Destination and duration are required.');
          setLoading(false);
          return;
        }
        response = await generateItinerary({
          destination,
          duration: parseInt(iDuration),
          budget: parseFloat(iBudget) || 500,
          interests: interests || 'food, culture, adventure',
        });
      } else {
        if (!pDest || !pDuration) {
          Alert.alert('Fill in the details', 'Destination and duration are required.');
          setLoading(false);
          return;
        }
        response = await generatePackingList({
          destination: pDest,
          duration: parseInt(pDuration),
          activities: activities || 'sightseeing, dining, relaxing',
        });
      }
      setResult(response);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to get AI suggestions. Check your API key.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sparkleBox}>
          <Text style={{ fontSize: 22 }}>✨</Text>
        </View>
        <Text style={styles.headerTitle}>AI Trip Planner</Text>
        <Text style={styles.headerSub}>Powered by Claude</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mode selector */}
        <View style={styles.modeSelector}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeBtn, mode === m.key && styles.modeBtnActive]}
              onPress={() => { setMode(m.key); setResult(''); }}
            >
              <Text style={styles.modeEmoji}>{m.emoji}</Text>
              <Text style={[styles.modeLabel, mode === m.key && styles.modeLabelActive]}>{m.label}</Text>
              <Text style={styles.modeDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {mode === 'destinations' && (
            <>
              <Text style={styles.label}>Total Budget ($)</Text>
              <TextInput style={styles.input} placeholder="e.g. 600" placeholderTextColor={Colors.textSecondary} value={budget} onChangeText={setBudget} keyboardType="numeric" />
              <Text style={styles.label}>Trip Duration (days)</Text>
              <TextInput style={styles.input} placeholder="e.g. 7" placeholderTextColor={Colors.textSecondary} value={duration} onChangeText={setDuration} keyboardType="numeric" />
              <Text style={styles.label}>Vibe / Interests</Text>
              <TextInput style={styles.input} placeholder="e.g. beach, nightlife, culture" placeholderTextColor={Colors.textSecondary} value={vibe} onChangeText={setVibe} />
              <Text style={styles.label}>Starting From (optional)</Text>
              <TextInput style={styles.input} placeholder="e.g. New York" placeholderTextColor={Colors.textSecondary} value={startingFrom} onChangeText={setStartingFrom} />
            </>
          )}

          {mode === 'itinerary' && (
            <>
              <Text style={styles.label}>Destination</Text>
              <TextInput style={styles.input} placeholder="e.g. Barcelona, Spain" placeholderTextColor={Colors.textSecondary} value={destination} onChangeText={setDestination} />
              <Text style={styles.label}>Number of Days</Text>
              <TextInput style={styles.input} placeholder="e.g. 5" placeholderTextColor={Colors.textSecondary} value={iDuration} onChangeText={setIDuration} keyboardType="numeric" />
              <Text style={styles.label}>Total Budget ($)</Text>
              <TextInput style={styles.input} placeholder="e.g. 800" placeholderTextColor={Colors.textSecondary} value={iBudget} onChangeText={setIBudget} keyboardType="numeric" />
              <Text style={styles.label}>Interests</Text>
              <TextInput style={styles.input} placeholder="e.g. history, food, hiking" placeholderTextColor={Colors.textSecondary} value={interests} onChangeText={setInterests} />
            </>
          )}

          {mode === 'packing' && (
            <>
              <Text style={styles.label}>Destination</Text>
              <TextInput style={styles.input} placeholder="e.g. Thailand" placeholderTextColor={Colors.textSecondary} value={pDest} onChangeText={setPDest} />
              <Text style={styles.label}>Trip Duration (days)</Text>
              <TextInput style={styles.input} placeholder="e.g. 10" placeholderTextColor={Colors.textSecondary} value={pDuration} onChangeText={setPDuration} keyboardType="numeric" />
              <Text style={styles.label}>Planned Activities</Text>
              <TextInput style={styles.input} placeholder="e.g. beach, temples, hiking" placeholderTextColor={Colors.textSecondary} value={activities} onChangeText={setActivities} />
            </>
          )}

          <TouchableOpacity
            style={[styles.generateBtn, loading && { opacity: 0.7 }]}
            onPress={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateBtnText}>✨ Generate with AI</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {mode === 'destinations' ? '🌍 Destination Suggestions' : mode === 'itinerary' ? '📅 Your Itinerary' : '🧳 Packing List'}
            </Text>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        ) : null}

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.purple} />
            <Text style={styles.loadingText}>Claude is crafting your perfect trip... ✨</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24 },
  sparkleBox: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: Colors.ink, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: Colors.ink, letterSpacing: -0.5 },
  headerSub: { color: Colors.ink2, fontSize: 14, marginTop: 4 },
  scroll: { flex: 1 },
  modeSelector: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  modeBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.line,
  },
  modeBtnActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  modeEmoji: { fontSize: 22, marginBottom: 6 },
  modeLabel: { fontSize: 11, fontWeight: '800', color: Colors.ink2, textAlign: 'center' },
  modeLabelActive: { color: Colors.cream },
  modeDesc: { fontSize: 9, color: Colors.ink2, textAlign: 'center', marginTop: 2 },
  form: { paddingHorizontal: 20 },
  label: {
    fontSize: 11, fontWeight: '800', color: Colors.ink2,
    marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6,
  },
  input: {
    backgroundColor: Colors.card, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 16,
    fontSize: 15, color: Colors.ink, marginBottom: 16,
    borderWidth: 1.5, borderColor: Colors.line,
    fontWeight: '600',
  },
  generateBtn: {
    backgroundColor: Colors.coral, borderRadius: 16,
    padding: 16, alignItems: 'center', marginTop: 4, marginBottom: 20,
  },
  generateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resultCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 0,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#281408',
    shadowOpacity: 0.10,
    shadowRadius: 15,
    elevation: 5,
  },
  resultTitle: { fontSize: 18, fontWeight: '800', color: Colors.ink, marginBottom: 12 },
  resultText: { fontSize: 14, color: Colors.ink, lineHeight: 22 },
  loadingCard: { alignItems: 'center', padding: 32 },
  loadingText: { color: Colors.ink2, marginTop: 12, fontSize: 14, textAlign: 'center' },
});
