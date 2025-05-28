import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '../app/(auth)/login.tsx'; // Zmień ścieżkę jeśli inna
import { useUser } from '../context/UserContext';

jest.mock('lucide-react-native', () => ({
  User: () => null,
  Mail: () => null,
  Lock: () => null,
}));

jest.mock('react-native-paper', () => {
  const real = jest.requireActual('react-native-paper');
  const React = require('react'); // 👈 załaduj React wewnątrz mocka
  const { Text } = require('react-native'); // 👈 załaduj Text wewnątrz mocka

  return {
    ...real,
    Snackbar: ({ visible, children }) =>
      visible ? <Text>{children}</Text> : null,
  };
});

console.log('LoginScreen:', LoginScreen);

// Mock router and useUser
jest.mock('expo-router', () => ({
  Link: ({ children }) => children,
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('../context/UserContext.tsx', () => ({
  useUser: () => ({
    setUser: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle login successfully', async () => {
    console.log('➡️ Test: Login flow starts');

    const mockUser = { email: 'test@example.com', password: '123456' };
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [mockUser],
    });

    const { getByTestId, getByText } = render(<LoginScreen />);

    console.log('✅ LoginScreen rendered');

    const emailInput = getByTestId('email-input');
    const passwordInput = getByTestId('password-input');
    const signinButton = getByTestId('signin-button');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, '123456');
    console.log('📝 Email and password entered');

    fireEvent.press(signinButton);
    console.log('🔐 Sign in button pressed');

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://192.168.56.1:3000/users?email=test%40example.com'
      );
      console.log('🌐 Fetch called correctly');
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      console.log('✅ Fetch completed');
    });

    console.log('🎉 Login flow completed');
  });

  it('shows error if fields are empty', async () => {
    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.press(getByTestId('signin-button'));
    console.log('⚠️ Tried to submit empty form');

    await waitFor(() => {
      expect(getByText('Please fill in all fields')).toBeTruthy();
      console.log('❗ Snackbar for empty fields is visible');
    });
  });

  it('shows error on invalid password', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [{ email: 'test@example.com', password: 'wrongpassword' }],
    });

    const { getByTestId, getByText } = render(<LoginScreen />);
    fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
    fireEvent.changeText(getByTestId('password-input'), '123456');
    fireEvent.press(getByTestId('signin-button'));

    console.log('🔐 Tried to log in with incorrect password');

    await waitFor(() => {
      expect(getByText('Login Failed: Invalid credentials or server error')).toBeTruthy();
      console.log('❌ Snackbar for invalid password is visible');
    });
  });
});
