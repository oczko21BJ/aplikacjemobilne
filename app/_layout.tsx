import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { UserProvider } from '../context/UserContext';
import { Provider as PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  useFrameworkReady();

  return (
      <UserProvider>
        <PaperProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
          </PaperProvider>

      </UserProvider>
  );
}