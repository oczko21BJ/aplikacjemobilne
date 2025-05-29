import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../app/(tabs)/index';
import { api } from '../services/api';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mock kontekstu bezpiecznej strefy
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  }),
  SafeAreaView: ({ children }: any) => <>{children}</>,
}));

// Mock expo-router
jest.mock('expo-router', () => {
  return {
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    useLocalSearchParams: () => ({}),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
    router: {
      push: jest.fn(),
    },
    Link: ({ children }: any) => children,
    Stack: ({ children }: any) => children,
    Slot: ({ children }: any) => children,
    Tabs: ({ children }: any) => children,
  };
});

// Mock ikon Lucide
jest.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Heart: () => null,
  MessageCircle: () => null,
  Share: () => null,
  AlertTriangle: () => null,
  Calendar: () => null,
  Users: () => null,
  TrendingUp: () => null,
}));

// Mock API
jest.mock('../services/api', () => ({
  api: {
    getPosts: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());

describe('HomeScreen', () => {
  const mockPosts = [
    {
      id: '1',
      author: 'John Doe',
      avatar: 'https://example.com/avatar1.jpg',
      content: 'To jest testowy post',
      timestamp: '2 godziny temu',
      likes: 10,
      comments: 5,
      location: 'Nowy Jork',
      type: 'general',
    },
    {
      id: '2',
      author: 'Jane Smith',
      content: 'Ważny alert!',
      timestamp: '1 godzina temu',
      likes: 25,
      comments: 8,
      location: 'Boston',
      type: 'alert',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithNavigation = () => {
    return render(
      <NavigationContainer>
        <HomeScreen />
      </NavigationContainer>
    );
  };

  test('początkowo wyświetla wskaźnik ładowania', async () => {
    (api.getPosts as jest.Mock).mockImplementation(() => new Promise(() => {}));

    renderWithNavigation();

    expect(screen.getByTestId('loading-indicator')).toBeTruthy();
  });

  test('poprawnie wyświetla posty', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: mockPosts });

    renderWithNavigation();

    await waitFor(() => {
      // Sprawdź, czy elementy postów są widoczne
      expect(screen.getByText('John Doe')).toBeTruthy();
      expect(screen.getByText('To jest testowy post')).toBeTruthy();
      expect(screen.getByText('Jane Smith')).toBeTruthy();
      expect(screen.getByText('Ważny alert!')).toBeTruthy();
    });
  });

  test('obsługuje błąd API', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({
      success: false,
      message: 'Błąd sieci',
    });

    renderWithNavigation();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Błąd', 'Błąd sieci');
      expect(screen.getByText('Brak postów do wyświetlenia')).toBeTruthy();
    });
  });

  test('kontrolka odświeżania wywołuje ponowne pobranie', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: mockPosts });

    const { getByTestId } = renderWithNavigation();

    // Początkowe pobranie
    await waitFor(() => expect(api.getPosts).toHaveBeenCalled());

    // Symulacja odświeżenia
    fireEvent(getByTestId('scroll-view'), 'refresh');

    // Czekaj na ponowne wywołanie pobrania
    await waitFor(() => expect(api.getPosts).toHaveBeenCalledTimes(2));
  });

  // Test interakcji z przyciskami postu
  test('działanie przycisków postu działa poprawnie', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: [mockPosts[0]] });

    renderWithNavigation();

    await waitFor(() => {
      const mockEvent = { stopPropagation: jest.fn() };

      // Przycisk Lubię to
      fireEvent.press(screen.getByTestId('like-button-1'), mockEvent);
      expect(screen.getByText('11')).toBeTruthy();

      // Przycisk Komentarze
      fireEvent.press(screen.getByTestId('comment-button-1'), mockEvent);
      expect(Alert.alert).toHaveBeenCalledWith('Komentarze', 'Wyświetl komentarze dla posta 1');

      // Przycisk Udostępnij
      fireEvent.press(screen.getByTestId('share-button-1'), mockEvent);
      expect(screen.getByText('Funkcja udostępniania w trakcie implementacji')).toBeTruthy();
    });
  });

  test('nawigacja do szczegółów posta działa poprawnie', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: [mockPosts[0]] });
    const mockPush = jest.fn();
    // Podmiana funkcji push routera
    jest.mock('expo-router', () => ({
      router: {
        push: mockPush,
      },
    }));

    renderWithNavigation();

    await waitFor(() => {
      fireEvent.press(screen.getByText('To jest testowy post'));
      expect(router.push).toHaveBeenCalledWith('/post/1');
    });
  });

  test('poprawne wyświetlanie wskaźników typu posta', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: mockPosts });

    renderWithNavigation();

    await waitFor(() => {
      expect(screen.getByTestId('post-type-1')).toBeTruthy();
      expect(screen.getByTestId('post-type-2')).toBeTruthy();
    });
  });

  test('snackbar pojawia się i znika', async () => {
    (api.getPosts as jest.Mock).mockResolvedValue({ success: true, data: [mockPosts[0]] });

    renderWithNavigation();

    // Utwórz mockowy obiekt zdarzenia z funkcją stopPropagation
    const mockEvent = { stopPropagation: jest.fn() };

    await waitFor(() => {
      fireEvent.press(screen.getByTestId('share-button-1'), mockEvent);
    });
    // Sprawdzenie czy pojawił się snackbar
    expect(screen.getByText('Funkcja udostępniania w trakcie implementacji')).toBeTruthy();

    // Zamknięcie snackbar
    fireEvent.press(screen.getByText('Zamknij'));

    // Po zamknięciu snackbar nie powinien być widoczny
    await waitFor(() => {
      expect(screen.queryByText('Funkcja udostępniania w trakcie implementacji')).toBeNull();
    }, { timeout: 3000 });
  });
});
