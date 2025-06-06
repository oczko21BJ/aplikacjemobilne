import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  MapPin,
  AlertTriangle,
  Calendar,
  Users,
  X,
  Send,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import {
  Text,
  TextInput,
  Button,
  Snackbar,
  useTheme,
} from 'react-native-paper';

type PostType = 'general' | 'alert' | 'event';

interface PostData {
  content: string;
  location: string;
  type: PostType;
  image?: string;
}

export default function CreateScreen() {
  const [postData, setPostData] = useState<PostData>({
    content: '',
    location: '',
    type: 'general',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const theme = useTheme();


  const postTypes = [
    { id: 'general', label: 'General Post', icon: Users, color: '#2563EB' },
    { id: 'alert', label: 'Community Alert', icon: AlertTriangle, color: '#EA580C' },
    { id: 'event', label: 'Event', icon: Calendar, color: '#059669' },
  ];
   const showSnackbar = (msg: string) => {
    setSnackbarMessage(msg);
    setSnackbarVisible(true);
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') return showSnackbar('Permission needed. Please grant permission to access photos');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPostData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleCameraLaunch = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
       if (status !== 'granted') return showSnackbar('Permission needed. Please grant permission to access photos');


    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPostData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const removeImage = () => {
    setPostData(prev => ({ ...prev, image: undefined }));
  };

const fetchCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  
    if (status !== 'granted') return showSnackbar('Permission needed. Please grant location permission to access photos');


  const location = await Location.getCurrentPositionAsync({});
  const coords = location.coords;

  // Możesz też użyć Location.reverseGeocodeAsync aby uzyskać adres
  const address = await Location.reverseGeocodeAsync({
    latitude: coords.latitude,
    longitude: coords.longitude,
  });

  if (address.length > 0) {
    const { street, city, region, country } = address[0];
    const fullAddress = `${street ?? ''}, ${city ?? ''}, ${region ?? ''}, ${country ?? ''}`;
    updatePostData('location', fullAddress);
  } else {
    updatePostData('location', `${coords.latitude}, ${coords.longitude}`);
  }
};

 const handleSubmit = async () => {
  if (!postData.content.trim()) return showSnackbar('Error. Please enter some content for your post');

  if (!postData.location.trim()) return showSnackbar('Error. Please specify a location');

  setIsSubmitting(true);

  try {
    // 1. Pobierz wszystkie posty
    const postsRes = await fetch('http://192.168.56.1:3000/posts');
    const existingPosts = await postsRes.json();

    // 2. Wyznacz nowe ID
    const maxId = existingPosts.reduce((max: number, post: any) => {
      const id = parseInt(post.id || post.id, 10);
      return isNaN(id) ? max : Math.max(max, id);
    }, 0);

    const newId = (maxId + 1).toString();
    // 3. Tworzymy post
    const postResponse = await fetch('http://192.168.56.1:3000/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newId,
        ...postData,
        timestamp: new Date().toISOString(), // timestamp zamiast createdAt, żeby zgodne z typem Post
      }),
    });

    if (!postResponse.ok) throw new Error('Failed to create post');

    const createdPost = await postResponse.json();

    // 4. Wysyłamy powiązaną notyfikację / biznes, zależnie od typu postu
    if (postData.type === 'alert') {
      // wysyłamy do /notifications
      await fetch('http://192.168.56.1:3000/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newId,
          type: 'alert',
          title: 'New Community Alert',
          message: postData.content,
          timestamp: new Date().toISOString(),
          isRead: false,
          priority: 'high',
        }),
      });
    } else if (postData.type === 'event') {
      await fetch('http://192.168.56.1:3000/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: newId,
          name: postData.content, // albo inna logika nazwy eventu
          category: 'event',
          rating: 0,
          reviewCount: 0,
          address: postData.location,
          phone: '',
          hours: '',
          image: postData.image || '',
          isOpen: true,
          description: postData.content,
        }),
      });
    }

    showSnackbar('Post shared successfully!');
      setTimeout(() => {
        setPostData({ content: '', location: '', type: 'general' });
        router.push('/(tabs)');
      }, 1000);
    } catch (error) {
      showSnackbar('Failed to create post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePostData = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#059669', '#047857']} style={styles.header}>
        <Text style={styles.headerTitle}>Share with Community</Text>
        <Text style={styles.headerSubtitle}>What's happening in your neighborhood?</Text>
      </LinearGradient>

      <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Post Type</Text>
            <View style={styles.postTypeContainer}>
              {postTypes.map(({ id, label, icon: Icon, color }) => {
                const selected = postData.type === id;
                return (
                  <Button
                    key={id}
                    testID={`${id}-button`}
                    mode={selected ? 'contained' : 'outlined'}
                    icon={Icon} 
                    onPress={() => updatePostData('type', id)}
                    style={{ flex: 1, margin: 4 }}
                    contentStyle={{ flexDirection: 'row-reverse' }}
                  >
                    {label}
                  </Button>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <TextInput
            testID="content-input"
              label="What's on your mind?"
              value={postData.content}
              onChangeText={text => updatePostData('content', text)}
              multiline
              numberOfLines={4}
              mode="outlined"
              style={{ marginBottom: 16 }}
            />
          </View>

          <View style={styles.section}>
            <TextInput
              testID="location-input"
              label="Location"
              value={postData.location}
              onChangeText={text => updatePostData('location', text)}
              right={<TextInput.Icon icon="map-marker" onPress={fetchCurrentLocation} testID="location-icon"  />}
              mode="outlined"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Photo</Text>
            {postData.image ? (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: postData.image }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
                <Button icon="close" mode="contained-tonal" style={{ position: 'absolute', top: 8, right: 8 }} onPress={() => updatePostData('image', undefined)}>
                  Remove
                </Button>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button icon="camera" mode="outlined" onPress={handleCameraLaunch}>
                  Take Photo
                </Button>
                <Button mode="outlined" onPress={handleImagePicker}>
                  Choose from Library
                </Button>
              </View>
            )}
          </View>

          <Button
            testID="share-button"
            mode="contained"
            icon="send"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={{ marginTop: 16, marginBottom: 32 }}
          >
            {isSubmitting ? 'Sharing...' : 'Share Post'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar
         testID="snackbar"
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 15 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#E2E8F0' },
  content: { flex: 1 },
  form: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 12 },
  postTypeContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});