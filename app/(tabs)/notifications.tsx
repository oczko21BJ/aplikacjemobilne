import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Text,
  IconButton,
  Button,
  Card,
  Surface,
  useTheme
} from 'react-native-paper';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Heart,
  Settings,
  CheckCircle,
} from 'lucide-react-native';
import { api } from '@/services/api';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

interface Notification {
  id: string;
  type: 'alert' | 'event' | 'social' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
}



export default function NotificationsScreen() {
const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [accelerometerData, setAccelerometerData] = useState({ x: 0, y: 0, z: 0 });
  const [isShakeEnabled, setIsShakeEnabled] = useState(true);
  const theme = useTheme();


  useEffect(() => {
  loadNotifications();
}, []);

const loadNotifications = async () => {
  const response = await api.getNotifications();
  if (response.success) {
    setNotifications(response.data);
  } else {
    console.error('Błąd ładowania powiadomień:', response.message);
  }
};

  const onRefresh = async () => {
  setRefreshing(true);
  await loadNotifications();
  setRefreshing(false);
};

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle size={20} color="#EA580C" />;
      case 'event':
        return <Calendar size={20} color="#059669" />;
      case 'social':
        return <Heart size={20} color="#EC4899" />;
      default:
        return <Bell size={20} color="#2563EB" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FEF2F2';
      case 'medium':
        return '#FEFCE8';
      default:
        return '#F8FAFC';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#FCA5A5';
      case 'medium':
        return '#FDE047';
      default:
        return 'transparent';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
     <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={['#EA580C', '#DC2626']} style={styles.header}>
        <Surface style={styles.headerContent} elevation={0}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Community Alerts
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <IconButton icon={() => <Settings size={24} color="#fff" />} onPress={() => {}} />
        </Surface>
      </LinearGradient>

       <Surface style={styles.actionsBar} elevation={1}>
        <Button
          mode="contained-tonal"
          icon={() => <CheckCircle size={16} color="#059669" />}
          onPress={markAllAsRead}
          style={{ backgroundColor: '#F0FDF4' }}
          labelStyle={{ color: '#059669' }}
        >
          Mark All Read
        </Button>
        <Text variant="bodySmall" style={{ color: '#64748B' }}>
          Shake to clear all
        </Text>
      </Surface>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.map(notification => (
          <Card
            key={notification.id}
            style={[
              styles.notificationCard,
              { backgroundColor: getPriorityColor(notification.priority) },
              !notification.isRead && {
                borderLeftWidth: 4,
                borderLeftColor: getPriorityBorder(notification.priority) || '#2563EB'
              }
            ]}
            onPress={() => markAsRead(notification.id)}
          >
            <Card.Content style={styles.notificationHeader}>
              <Surface style={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
               </Surface>
              <Surface style={styles.notificationContent}>
                <Text style={[
                  styles.notificationTitle,
                  !notification.isRead && styles.unreadTitle
                ]}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTimestamp}>
                  {notification.timestamp}
                </Text>
              </Surface>
              {!notification.isRead && (
              <Surface style={styles.unreadIndicator}>
                      <Text> </Text>
                </Surface>
              )}
              </Card.Content>
          </Card>
        ))}

        {notifications.length === 0 && (
           <Surface style={styles.emptyState}>
            <Bell size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptyMessage}>
              You're all caught up! Check back later for community updates.
            </Text>
           </Surface>
        )}
      </ScrollView>
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
    paddingTop: 10
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FEF2F2',
  },
  settingsButton: {
    padding: 8,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  shakeIndicator: {
    alignItems: 'flex-end',
  },
  shakeText: {
    fontSize: 12,
    color: '#64748B',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '600',
    
  },
  notificationMessage: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
});