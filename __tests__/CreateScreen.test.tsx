import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { UserProvider } from '../context/UserContext';
import CreateScreen from '../app/(tabs)/create';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
// Mock Lucid icons
jest.mock('lucide-react-native', () => ({
  Camera: 'CameraIcon',
  MapPin: 'MapPinIcon',
  AlertTriangle: 'AlertTriangleIcon',
  Calendar: 'CalendarIcon',
  Users: 'UsersIcon',
  X: 'XIcon',
  Send: 'SendIcon',
}));

// Mock expo modules
jest.mock('expo-image-picker');
jest.mock('expo-location');
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useNavigation: () => ({}),
  router: {
    push: jest.fn(), // <-- DODAJ TO
  },
}));

// Mock fetch API
global.fetch = jest.fn();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <PaperProvider>{children}</PaperProvider>
  </UserProvider>
);

describe('CreateScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockReset();
  });

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(<CreateScreen />, {
      wrapper: Wrapper,
    });

    expect(getByText('Share with Community')).toBeTruthy();
    expect(getByTestId('content-input')).toBeTruthy();
    expect(getByTestId('location-input')).toBeTruthy();
    expect(getByTestId('share-button')).toBeTruthy();
  });

  it('handles post type selection', () => {
    const { getByTestId } = render(<CreateScreen />, { wrapper: Wrapper });

    fireEvent.press(getByTestId('alert-button'));
    fireEvent.press(getByTestId('event-button'));
    fireEvent.press(getByTestId('general-button'));
  });

  it('validates form submission', async () => {
    const { getByTestId, getByText } = render(<CreateScreen />, {
      wrapper: Wrapper,
    });

    fireEvent.press(getByTestId('share-button'));
    await waitFor(() => {
      expect(getByText('Error. Please enter some content for your post')).toBeTruthy();
    });

    fireEvent.changeText(getByTestId('content-input'), 'Test content');
    fireEvent.press(getByTestId('share-button'));
    await waitFor(() => {
      expect(getByText('Error. Please specify a location')).toBeTruthy();
    });
  });

  it('handles location fetching', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 50, longitude: 20 },
    });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
      { street: 'Main St', city: 'City', region: 'Region', country: 'Country' },
    ]);

    const { getByTestId } = render(<CreateScreen />, { wrapper: Wrapper });
    fireEvent.press(getByTestId('location-icon'));
    
    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(getByTestId('location-input').props.value).toContain('Main St');
    });
  });

  it('handles image selection', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'test-image-uri' }],
    });

    const { getByText } = render(<CreateScreen />, { wrapper: Wrapper });
    fireEvent.press(getByText('Choose from Library'));
    
    await waitFor(() => {
      expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
    });
  });

  it('submits form successfully', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ json: () => Promise.resolve([]) }) // Initial posts fetch
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: '1' }) }); // Post creation

    const { getByTestId } = render(<CreateScreen />, { wrapper: Wrapper });

    fireEvent.changeText(getByTestId('content-input'), 'Test content');
    fireEvent.changeText(getByTestId('location-input'), 'Test location');
    fireEvent.press(getByTestId('share-button'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://192.168.56.1:3000/posts', expect.any(Object));
    });
  });

  it('shows error snackbars', async () => {
    (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    const { getByText } = render(<CreateScreen />, { wrapper: Wrapper });
    fireEvent.press(getByText('Choose from Library'));
    
    await waitFor(() => {
      expect(getByText('Permission needed. Please grant permission to access photos')).toBeTruthy();
    });
  });
});