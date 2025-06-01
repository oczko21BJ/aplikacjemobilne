// tests/context/UserContext.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider, useUser, User } from '../context/UserContext';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Testowy komponent wykorzystujący hook useUser
const TestComponent = () => {
  const { user, setUser, logout } = useUser();
  return (
    <>
      <Text testID="userText">
        {user ? user.name : 'No user'}
      </Text>
      <TouchableOpacity 
        testID="setUserButton" 
        onPress={() => setUser({ 
          id: 1, 
          name: 'Jan Kowalski', 
          email: 'jan@example.com' 
        })}
      >
        <Text>Set User</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logoutButton" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </>
  );
};

describe('UserProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('prawidłowo ładuje użytkownika z AsyncStorage', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
    
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('userText').props.children).toBe('Test User');
    });
  });

  test('wyświetla "No user" gdy brak danych w AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('userText').props.children).toBe('No user');
    });
  });

  test('zapisuje użytkownika do AsyncStorage przy setUser', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    fireEvent.press(getByTestId('setUserButton'));

    await waitFor(() => {
      expect(getByTestId('userText').props.children).toBe('Jan Kowalski');
    });
    
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'user',
      JSON.stringify({
        id: 1,
        name: 'Jan Kowalski',
        email: 'jan@example.com'
      })
    );
  });

  test('czyści dane przy logout', async () => {
    const mockUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com'
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockUser));
    
    const { getByTestId } = render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    );

    await waitFor(() => {
      expect(getByTestId('userText').props.children).toBe('Test User');
    });

    fireEvent.press(getByTestId('logoutButton'));

    await waitFor(() => {
      expect(getByTestId('userText').props.children).toBe('No user');
    });
    
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
  });
});

describe('useUser', () => {
  test('rzuca błąd przy użyciu poza UserProvider', () => {
    // Ukryj błędy konsoli dla czystego wyjścia testów
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => render(<TestComponent />)).toThrow(
      'useUser must be used within UserProvider'
    );

    console.error = originalError;
  });
});