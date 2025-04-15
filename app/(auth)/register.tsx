import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, User, Mail, MapPin, Lock } from 'lucide-react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, address } = formData;

    if (!name || !email || !password || !confirmPassword || !address) {
      setSnackbarMessage('Please fill in all fields');
      setSnackbarVisible(true);      return;
    }

    if (password !== confirmPassword) {
      setSnackbarMessage('Passwords do not match');
      setSnackbarVisible(true);      return;
    }

    if (password.length < 6) {
      setSnackbarMessage('Password must be at least 6 characters');
      setSnackbarVisible(true);      return;
    }

    setIsLoading(true);
    try {
    const response = await fetch('http://192.168.56.1:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        address,
        avatar: `https://i.pravatar.cc/150?u=${email}`,
      }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    setSnackbarMessage('Account created successfully!');
      setSnackbarVisible(true);
      setTimeout(() => router.replace('/(tabs)'), 1000);
    } catch (error) {
      setSnackbarMessage('Registration Failed. Please try again.');
      setSnackbarVisible(true);
    } finally {
    setIsLoading(false);
  }
};

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
     <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#059669', '#047857']} style={styles.gradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <UserPlus size={60} color="#FFFFFF" />
              <Text variant="headlineMedium" style={styles.title}>Join Community</Text>
              <Text variant="bodyMedium" style={styles.subtitle}>Create your account to get started</Text>
            </View>

            <TextInput
              label="Full Name"
              value={formData.name}
              onChangeText={value => updateFormData('name', value)}
              style={styles.input}
            />
            <TextInput
              label="Email address"
              value={formData.email}
              onChangeText={value => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              label="Street Address"
              value={formData.address}
              onChangeText={value => updateFormData('address', value)}
              style={styles.input}
            />
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={value => updateFormData('password', value)}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              label="Confirm Password"
              value={formData.confirmPassword}
              onChangeText={value => updateFormData('confirmPassword', value)}
              secureTextEntry
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
            >
              Create Account
            </Button>
            <View style={styles.footer}>
              <Text>Already have an account?</Text>
              <Button onPress={() => router.push('/(auth)/login')}>Sign In</Button>

            </View>
          </View>
        </ScrollView>
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
  scrollView: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { color: '#FFFFFF', marginTop: 16, marginBottom: 8 },
  subtitle: { color: '#E2E8F0' },
  input: { marginBottom: 16 },
  button: { marginTop: 8 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, gap: 8 },
});
