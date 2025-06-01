import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Settings,
  MapPin,
  Edit,
  Heart,
  MessageCircle,
  Share,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  Award,
  Users,
} from 'lucide-react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '../../context/UserContext';
import {
  Avatar,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Text as PaperText,
} from 'react-native-paper';

interface UserStats {
  posts: number;
  likes: number;
  comments: number;
  neighbors: number;
}

interface MenuItem {
  icon: any;
  title: string;
  subtitle?: string;
  action: () => void;
  color?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useUser();

 if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <PaperText>Ładowanie profilu...</PaperText>
      </View>
    );
  }
  const [stats] = useState<UserStats>({
    posts: 24,
    likes: 156,
    comments: 89,
    neighbors: 47
  });

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here');
  };

  const handleChangeAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert('Success', 'Profile picture updated!');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const menuItems: MenuItem[] = [
    {
      icon: Edit,
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      action: handleEditProfile
    },
    {
      icon: Bell,
      title: 'Notification Settings',
      subtitle: 'Manage alerts and preferences',
      action: () => Alert.alert('Settings', 'Notification settings would be implemented here')
    },
    {
      icon: Shield,
      title: 'Privacy & Security',
      subtitle: 'Control your privacy settings',
      action: () => Alert.alert('Privacy', 'Privacy settings would be implemented here')
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get help or contact support',
      action: () => router.push('/emergency')
    },
    {
      icon: LogOut,
      title: 'Logout',
      subtitle: 'Sign out of your account',
      action: handleLogout,
      color: '#DC2626'
    }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <PaperText variant="titleLarge" style={{ color: '#FFF' }}>
            Profile
          </PaperText>
          <IconButton icon="cog" iconColor="#FFF" onPress={() => {}} />
        </View>
      </LinearGradient>

      <ScrollView style={{ padding: 20 }}>
        {/* Profile Card */}
        <Card style={{ marginBottom: 20 }}>
          <Card.Title
            title={user.name}
            subtitle={user.email}
            left={() => (
              <Avatar.Image size={48} source={{ uri: user.avatar }} />
            )}
            right={() => (
              <IconButton icon="camera" onPress={handleChangeAvatar} />
            )}
          />
          <Card.Content style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {user.isVerified && <Award size={16} color="#059669" />}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <MapPin size={14} color="#64748B" />
              <PaperText style={{ color: '#64748B', marginLeft: 4 }}>{user.address}</PaperText>
            </View>
            <PaperText variant="labelSmall" style={{ marginTop: 4 }}>
              Member since {user.joinDate}
            </PaperText>
          </Card.Content>
          <Card.Actions>
            <Button onPress={handleEditProfile}>Edit Profile</Button>
          </Card.Actions>
        </Card>

        {/* Stats */}
        <Card style={{ marginBottom: 20 }}>
          <Card.Title title="Your Activity" />
          <Card.Content>
            <List.Item title={`Posts: ${stats.posts}`} left={() => <MessageCircle color="#2563EB" />} />
            <List.Item title={`Likes: ${stats.likes}`} left={() => <Heart color="#2563EB" />} />
            <List.Item title={`Comments: ${stats.comments}`} left={() => <Share color="#2563EB" />} />
            <List.Item title={`Neighbors: ${stats.neighbors}`} left={() => <Users color="#2563EB" />} />
          </Card.Content>
        </Card>

        {/* Menu */}
        <Card style={{ marginBottom: 20 }}>
          <Card.Title title="Settings" />
          <Card.Content>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.title}>
                <List.Item
                  title={item.title}
                  description={item.subtitle}
                  onPress={item.action}
                  titleStyle={item.color ? { color: item.color } : undefined}
                  left={() => (
                    <View style={{ justifyContent: 'center' }}>
                      <item.icon size={24} color={item.color || '#2563EB'} />
                    </View>
                  )}
                />
                {index < menuItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        {/* App Info */}
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <PaperText variant="bodySmall">Neighbourhood Chatter v1.0.0</PaperText>
          <PaperText variant="bodySmall">© 2024 Community Connect</PaperText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});