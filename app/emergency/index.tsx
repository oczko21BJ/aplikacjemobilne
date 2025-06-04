import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Phone, 
  Shield, 
  AlertTriangle, 
  MapPin,
  Clock,
  Users,
  Heart,
  Flame,
  Car,
  Zap
} from 'lucide-react-native';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  type: 'emergency' | 'medical' | 'fire' | 'police' | 'utility' | 'community';
  description: string;
  available24h: boolean;
  icon: any;
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    id: '1',
    name: 'Emergency Services',
    phone: '911',
    type: 'emergency',
    description: 'Police, Fire, Medical Emergency',
    available24h: true,
    icon: AlertTriangle
  },
  {
    id: '2',
    name: 'Police Department',
    phone: '(555) 123-4567',
    type: 'police',
    description: 'Non-emergency police line',
    available24h: true,
    icon: Shield
  },
  {
    id: '3',
    name: 'Fire Department',
    phone: '(555) 234-5678',
    type: 'fire',
    description: 'Fire prevention and safety',
    available24h: true,
    icon: Flame
  },
  {
    id: '4',
    name: 'Medical Center',
    phone: '(555) 345-6789',
    type: 'medical',
    description: 'Green Valley Medical Center',
    available24h: true,
    icon: Heart
  },
  {
    id: '5',
    name: 'Power Company',
    phone: '(555) 456-7890',
    type: 'utility',
    description: 'Power outage reporting',
    available24h: true,
    icon: Zap
  },
  {
    id: '6',
    name: 'Road Services',
    phone: '(555) 567-8901',
    type: 'utility',
    description: 'Road maintenance and issues',
    available24h: false,
    icon: Car
  },
  {
    id: '7',
    name: 'Community Watch',
    phone: '(555) 678-9012',
    type: 'community',
    description: 'Neighborhood safety coordinator',
    available24h: false,
    icon: Users
  }
];

export default function EmergencyScreen() {
  const [activeAlerts] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'Severe Weather Alert',
      message: 'Thunderstorm warning in effect until 8 PM',
      timestamp: '2 hours ago'
    }
  ]);

  const makeCall = (phone: string, name: string) => {
    Alert.alert(
      'Call ' + name,
      `Are you sure you want to call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return '#DC2626';
      case 'police': return '#2563EB';
      case 'fire': return '#EA580C';
      case 'medical': return '#EC4899';
      case 'utility': return '#7C3AED';
      case 'community': return '#059669';
      default: return '#64748B';
    }
  };

  const renderContact = (contact: EmergencyContact) => {
    const IconComponent = contact.icon;
    const typeColor = getContactTypeColor(contact.type);
    
    return (
      <TouchableOpacity
        key={contact.id}
        style={[
          styles.contactCard,
          contact.type === 'emergency' && styles.emergencyCard
        ]}
        onPress={() => makeCall(contact.phone, contact.name)}
      >
        <View style={styles.contactHeader}>
          <View style={[styles.contactIcon, { backgroundColor: `${typeColor}15` }]}>
            <IconComponent size={24} color={typeColor} />
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={[
              styles.contactName,
              contact.type === 'emergency' && styles.emergencyText
            ]}>
              {contact.name}
            </Text>
            <Text style={styles.contactDescription}>
              {contact.description}
            </Text>
            
            <View style={styles.contactMeta}>
              <Text style={styles.contactPhone}>{contact.phone}</Text>
              {contact.available24h && (
                <View style={styles.availabilityBadge}>
                  <Clock size={12} color="#059669" />
                  <Text style={styles.availabilityText}>24/7</Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={[styles.callButton, { backgroundColor: typeColor }]}>
            <Phone size={20} color="#FFFFFF" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#DC2626', '#B91C1C']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
        <Text style={styles.headerSubtitle}>Quick access to important numbers</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {activeAlerts.map(alert => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color="#EA580C" />
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Emergency Contacts */}
        <View style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <Text style={styles.sectionSubtitle}>
            Tap any contact to call immediately
          </Text>
          
          {EMERGENCY_CONTACTS.map(renderContact)}
        </View>

        {/* Safety Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Safety Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>In Case of Emergency</Text>
            <Text style={styles.tipText}>
              • Stay calm and assess the situation{'\n'}
              • Call 911 for immediate life-threatening emergencies{'\n'}
              • Provide clear location and nature of emergency{'\n'}
              • Follow dispatcher instructions{'\n'}
              • Stay on the line until help arrives
            </Text>
          </View>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Power Outages</Text>
            <Text style={styles.tipText}>
              • Report outages to the power company{'\n'}
              • Use flashlights instead of candles{'\n'}
              • Keep refrigerator and freezer doors closed{'\n'}
              • Never use generators indoors
            </Text>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: '#FEF3F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EA580C',
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EA580C',
  },
  alertMessage: {
    fontSize: 14,
    color: '#7C2D12',
    lineHeight: 20,
    marginBottom: 8,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#A16207',
  },
  contactsSection: {
    marginBottom: 24,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emergencyCard: {
    borderWidth: 2,
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  emergencyText: {
    color: '#DC2626',
  },
  contactDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactPhone: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  availabilityText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsSection: {
    marginBottom: 32,
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});