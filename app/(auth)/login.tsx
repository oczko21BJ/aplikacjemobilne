import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Lock } from 'lucide-react-native';
import { TextInput, Button, Text, useTheme, Snackbar } from 'react-native-paper';
;import { useUser } from '@/context/UserContext'; 

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { setUser } = useUser();

 const handleLogin = async () => {
  if (!email || !password) {
    setSnackbarMessage('Please fill in all fields');
    setSnackbarVisible(true);
    return;
  }

  setIsLoading(true);
  console.log('Logging in with', email);
  try {
    console.log('Starting fetch...');
  const response = await fetch(`http://192.168.56.1:3000/users?email=${encodeURIComponent(email)}`);
  console.log('Fetch done, status:', response.status);
  console.log('Fetch response status:', response.status);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const users = await response.json();
    console.log('Users fetched:', users);
    

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];
    if (user.password !== password) {
      throw new Error('Invalid password');
    }

    console.log('Login successful, redirecting...');
    await setUser(user); //zapisywanie uzytkownika do kontekstu
    router.replace('/(tabs)');

  } catch (error) {
    console.error('Login error:', error);
      setSnackbarMessage('Login Failed: Invalid credentials or server error');
      setSnackbarVisible(true);
      } finally {
    setIsLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.gradient}>
        <View style={styles.content}>
          <View style={styles.header}>
            <User size={60} color="#FFFFFF" />
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            <Text variant="bodyMedium" style={styles.subtitle}>Sign in to your community</Text>
          </View>

          <TextInput
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            testID="email-input"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
              testID="password-input"

          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}
              testID="signin-button"

          >
            Sign In
          </Button>

          <View style={styles.footer}>
            <Text>Don't have an account?</Text>
           <Button onPress={() => router.push('/(auth)/register')}>Sign Up</Button>

          </View>
        </View>
      </LinearGradient>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 48 },
  title: { color: '#FFFFFF', marginTop: 16, marginBottom: 8 },
  subtitle: { color: '#E2E8F0' },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 8 },
});