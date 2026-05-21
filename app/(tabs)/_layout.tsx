import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  if (focused) {
    return (
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: Colors.coral, borderRadius: 999,
        paddingHorizontal: 14, paddingVertical: 8,
      }}>
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{label}</Text>
      </View>
    );
  }
  return <Text style={{ fontSize: 20, opacity: 0.6 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 18,
          left: 18,
          right: 18,
          backgroundColor: Colors.ink,
          borderRadius: 28,
          height: 68,
          borderTopWidth: 0,
          paddingBottom: 0,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 20,
          elevation: 10,
        },
        tabBarItemStyle: {
          paddingVertical: 12,
        },
      }}
    >
      <Tabs.Screen name="home" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} /> }} />
      <Tabs.Screen name="trips/index" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" label="Trips" focused={focused} /> }} />
      <Tabs.Screen name="ai-suggest" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="✨" label="AI" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Me" focused={focused} /> }} />
      <Tabs.Screen name="trips/[id]" options={{ href: null }} />
      <Tabs.Screen name="trips/create" options={{ href: null }} />
      <Tabs.Screen name="trips/budget" options={{ href: null }} />
      <Tabs.Screen name="trips/group" options={{ href: null }} />
      <Tabs.Screen name="trips/add-activity" options={{ href: null }} />
      <Tabs.Screen name="trips/add-expense" options={{ href: null }} />
    </Tabs>
  );
}
