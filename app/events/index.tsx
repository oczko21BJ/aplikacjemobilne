import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Star,
  Plus
} from 'lucide-react-native';
import { router } from 'expo-router';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees: number;
  image: string;
  isAttending: boolean;
  category: 'community' | 'sports' | 'social' | 'educational';
}

const SAMPLE_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Community BBQ & Games',
    description: 'Join us for a fun-filled afternoon with food, games, and great company! Perfect for families and all ages.',
    date: '2024-04-15',
    time: '2:00 PM - 6:00 PM',
    location: 'Central Park Pavilion',
    organizer: 'Community Association',
    attendees: 47,
    maxAttendees: 100,
    image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    isAttending: true,
    category: 'community'
  },
  {
    id: '2',
    title: 'Neighborhood Cleanup Day',
    description: 'Help make our community beautiful! Bring gloves and enthusiasm. Supplies provided.',
    date: '2024-04-20',
    time: '9:00 AM - 12:00 PM',
    location: 'Various locations',
    organizer: 'Green Initiative Group',
    attendees: 23,
    maxAttendees: 50,
    image: 'https://images.pexels.com/photos/6196616/pexels-photo-6196616.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    isAttending: false,
    category: 'community'
  },
  {
    id: '3',
    title: 'Book Club Meeting',
    description: 'This month we\'re discussing "The Seven Husbands of Evelyn Hugo". New members welcome!',
    date: '2024-04-18',
    time: '7:00 PM - 9:00 PM',
    location: 'Community Library',
    organizer: 'Sarah Johnson',
    attendees: 12,
    maxAttendees: 20,
    image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1',
    isAttending: false,
    category: 'educational'
  }
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const toggleAttendance = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              isAttending: !event.isAttending,
              attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
            }
          : event
      )
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'community': return '#059669';
      case 'sports': return '#EA580C';
      case 'social': return '#EC4899';
      case 'educational': return '#2563EB';
      default: return '#64748B';
    }
  };

  const renderEvent = (event: Event) => (
    <TouchableOpacity key={event.id} style={styles.eventCard}>
      <Image source={{ uri: event.image }} style={styles.eventImage} />
      
      <View style={styles.eventContent}>
        <View style={styles.eventHeader}>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: `${getCategoryColor(event.category)}15` }
          ]}>
            <Text style={[
              styles.categoryText,
              { color: getCategoryColor(event.category) }
            ]}>
              {event.category.toUpperCase()}
            </Text>
          </View>
          
          {event.isAttending && (
            <View style={styles.attendingBadge}>
              <Star size={12} color="#059669" fill="#059669" />
              <Text style={styles.attendingText}>Attending</Text>
            </View>
          )}
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventDescription}>{event.description}</Text>

        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Calendar size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {new Date(event.date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              })}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Clock size={16} color="#64748B" />
            <Text style={styles.detailText}>{event.time}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MapPin size={16} color="#64748B" />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Users size={16} color="#64748B" />
            <Text style={styles.detailText}>
              {event.attendees}/{event.maxAttendees} attending
            </Text>
          </View>
        </View>

        <View style={styles.eventFooter}>
          <Text style={styles.organizerText}>
            Organized by {event.organizer}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.attendButton,
              event.isAttending && styles.attendButtonActive
            ]}
            onPress={() => toggleAttendance(event.id)}
          >
            <Text style={[
              styles.attendButtonText,
              event.isAttending && styles.attendButtonTextActive
            ]}>
              {event.isAttending ? 'Attending' : 'Attend'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#059669', '#047857']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Community Events</Text>
            <Text style={styles.headerSubtitle}>
              {events.filter(e => e.isAttending).length} events you're attending
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        
        {events.map(renderEvent)}

        {events.length === 0 && (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Events Scheduled</Text>
            <Text style={styles.emptyMessage}>
              Check back later for community events and activities.
            </Text>
          </View>
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
    color: '#E2E8F0',
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventContent: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  attendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  attendingText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  eventDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  organizerText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  attendButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  attendButtonActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#059669',
  },
  attendButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  attendButtonTextActive: {
    color: '#059669',
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