import React, { useState, useEffect, useCallback  } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MapPin, 
  Heart, 
  MessageCircle, 
  Share, 
  AlertTriangle,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react-native';
import { router } from 'expo-router';
import { api } from '@/services/api';
import { Text, Button, Card, Avatar, Snackbar, ActivityIndicator } from 'react-native-paper';


import { useFocusEffect } from '@react-navigation/native';

interface Post {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  location: string;
  type: 'general' | 'alert' | 'event';
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const fetchPosts = useCallback(async () => {
    setRefreshing(true);
    const response = await api.getPosts();
    if (response.success) {
      setPosts(response.data);
    } else {
      Alert.alert('Błąd', response.message || 'Nie udało się pobrać postów');
      setPosts([]);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  useFocusEffect(
  useCallback(() => {
    fetchPosts();
  }, [fetchPosts])
);
  const onRefresh = () => {
    fetchPosts();
  };
  // Przekierowanie do szczegółów posta
  const onPostPress = (postId: string) => {
    router.push(`/post/${postId}`); // Zakładam, że masz /post/[id].tsx jako ekran szczegółów
  };

  // Obsługa lajków (lokalnie)
  const onLikePress = (postId: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  // Obsługa komentarzy - tu można rozwinąć, na razie alert
  const onCommentsPress = (postId: string) => {
    Alert.alert('Komentarze', `Wyświetl komentarze dla posta ${postId}`);
    // Możesz tutaj przekierować do ekranu komentarzy
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={16} color="#EA580C" />;
      case 'event':
        return <Calendar size={16} color="#059669" />;
      default:
        return <Users size={16} color="#2563EB" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'alert':
        return '#FEF3F2';
      case 'event':
        return '#F0FDF4';
      default:
        return '#F8FAFC';
    }
  };

  const renderPost = (post: Post) => (
    <Card
      key={post.id}
      style={[styles.postCard, { backgroundColor: getPostTypeColor(post.type) }]}
      onPress={() => onPostPress(post.id)}
    >
      <Card.Title
        title={post.author}
        subtitle={`${post.location} • ${post.timestamp}`}
        left={props => <Avatar.Image {...props} source={{ uri: post.avatar }} />}
        right={() => (
      <View testID={`post-type-${post.id}`}>
        {getPostTypeIcon(post.type)}
      </View>
    )}
      />
      <Card.Content>
        <Text style={styles.postContent}>{post.content}</Text>
      </Card.Content>
      {post.image && (
        <Card.Cover source={{ uri: post.image }} style={{ marginVertical: 8 }} />
      )}
      <Card.Actions style={{ justifyContent: 'space-around' }}>
        <Button
          testID={`like-button-${post.id}`}
          icon="heart-outline"
          onPress={e => {
            e.stopPropagation();
            onLikePress(post.id);
          }}
        >
          {post.likes}
        </Button>
        <Button
          testID={`comment-button-${post.id}`}
          icon="message-reply-outline"
          onPress={e => {
            e.stopPropagation();
            onCommentsPress(post.id);
          }}
        >
          {post.comments}
        </Button>
        <Button
          testID={`share-button-${post.id}`}
          icon="share-variant"
          onPress={e => {
            e.stopPropagation();
            setSnackbarMessage('Funkcja udostępniania w trakcie implementacji');
            setSnackbarVisible(true);
          }}
        >
          Share
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="headlineMedium" style={styles.headerTitle}>
              Neighbourhood Chatter
            </Text>
            <Text variant="bodyMedium" style={styles.headerSubtitle}>
              Stay connected with your community
            </Text>
          </View>
          <Button
            mode="text"
            onPress={() => {}}
            icon={() => <TrendingUp size={24} color="#FFFFFF" />}
            contentStyle={{ padding: 8 }}
            labelStyle={{ color: '#FFFFFF' }}>
              test
            </Button>
          
        </View>
      </LinearGradient>

      <ScrollView
        testID="scroll-view"
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.quickActions}>
          <Button
            mode="contained"
            buttonColor="#059669"
            contentStyle={{ paddingVertical: 8 }}
            style={{ borderRadius: 12 }}
            onPress={() => router.push('/(tabs)/create')}
          >
            Share Update
          </Button>
        </View>

        <View style={styles.postsContainer}>
          <Text variant="headlineSmall" style={styles.sectionTitle}>
            Community Feed
          </Text>
          {refreshing ? (
            <ActivityIndicator   testID="loading-indicator"
 animating={true} size="large" style={{ marginTop: 50 }} />
          ) : posts.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#64748B', marginTop: 50 }}>
              Brak postów do wyświetlenia
            </Text>
          ) : (
            posts.map(renderPost)
          )}
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Zamknij',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
  },
  quickActions: {
    padding: 20,
    paddingBottom: 10,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#1E293B',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  postCard: {
    borderRadius: 16,
    marginBottom: 16,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
});