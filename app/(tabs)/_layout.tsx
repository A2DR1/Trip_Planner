import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 4,
          height: 64,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips/index"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="ai-suggest"
        options={{
          title: 'AI Suggest',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✨" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      {/* Hidden screens - accessible via navigation but not shown in tabs */}
      <Tabs.Screen name="trips/[id]" options={{ href: null }} />
      <Tabs.Screen name="trips/create" options={{ href: null }} />
      <Tabs.Screen name="trips/budget" options={{ href: null }} />
      <Tabs.Screen name="trips/group" options={{ href: null }} />
      <Tabs.Screen name="trips/add-activity" options={{ href: null }} />
      <Tabs.Screen name="trips/add-expense" options={{ href: null }} />
    </Tabs>
  );
}
