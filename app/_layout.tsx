import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { User } from '../types';

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Traveler',
          photoURL: firebaseUser.photoURL ?? undefined,
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
