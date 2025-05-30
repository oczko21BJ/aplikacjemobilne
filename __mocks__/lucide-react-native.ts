jest.mock('lucide-react-native', () => {
  const Mock = ({ name }: any) => name || null;
  return {
    Camera: Mock,
    MapPin: Mock,
    AlertTriangle: Mock,
    Calendar: Mock,
    Users: Mock,
    X: Mock,
    Send: Mock,
  };
});
