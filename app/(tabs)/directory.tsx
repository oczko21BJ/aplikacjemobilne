// Refaktoryzowany directory.tsx z użyciem react-native-paper
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Building,
  Search,
  Star,
  Phone,
  MapPin,
  Clock,
  Filter,
  Heart,
  ExternalLink,
} from 'lucide-react-native';
import {
  Text,
  TextInput,
  Button,
  IconButton,
  useTheme,
  Chip,
  Card,
  TouchableRipple,
} from 'react-native-paper';

interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string;
  hours: string;
  image: string;
  isOpen: boolean;
  isFavorite: boolean;
  description: string;
}


const CATEGORIES = ['All', 'Restaurant', 'Healthcare', 'Automotive', 'Education', 'Grocery', 'Fitness'];

export default function DirectoryScreen() {
 const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setBusinesses(prev => 
      prev.map(business => 
        business.id === id ? { ...business, isFavorite: !business.isFavorite } : business
      )
    );
  };

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('http://192.168.56.1:3000/businesses');
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  };

  // Pobierz dane po załadowaniu komponentu
  useEffect(() => {
    fetchBusinesses();
  }, []);

  // Odświeżanie przez pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBusinesses();
    setRefreshing(false);
  };


  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          color={i <= rating ? '#F59E0B' : '#E5E7EB'}
          fill={i <= rating ? '#F59E0B' : 'transparent'}
        />
      );
    }
    return stars;
  };

  const renderBusiness = (business: Business) => (
    <Card key={business.id} style={styles.businessCard}>
      <Image source={{ uri: business.image }} style={styles.businessImage} />
      
      <View style={styles.businessContent}>
        <View style={styles.businessHeader}>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{business.name}</Text>
            <Text style={styles.businessCategory}>{business.category}</Text>
          </View>
          <IconButton
            icon={() => (
              <Heart
                size={20}
                color={business.isFavorite ? '#EC4899' : '#64748B'}
                fill={business.isFavorite ? '#EC4899' : 'transparent'}
              />
            )}
            onPress={() => toggleFavorite(business.id)}
          />
        </View>

        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(business.rating)}
          </View>
          <Text style={styles.ratingText}>
            {business.rating} ({business.reviewCount} reviews)
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: business.isOpen ? '#DCFCE7' : '#FEF2F2' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: business.isOpen ? '#059669' : '#DC2626' }
            ]}>
              {business.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <Text style={styles.businessDescription}>{business.description}</Text>

        <View style={styles.businessDetails}>
          <View style={styles.detailRow}>
            <MapPin size={14} color="#64748B" />
            <Text style={styles.detailText}>{business.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={14} color="#64748B" />
            <Text style={styles.detailText}>{business.phone}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.detailText}>{business.hours}</Text>
          </View>
        </View>

         <TouchableRipple
          onPress={() => {}}
          style={styles.visitButton}
          borderless
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <ExternalLink size={16} color="#2563EB" />
            <Text style={styles.visitButtonText}>View Details</Text>
          </View>
        </TouchableRipple>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#2563EB', '#1D4ED8']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Local Directory</Text>
        <Text style={styles.headerSubtitle}>Discover neighborhood businesses</Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search businesses..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#64748B"
          />
        </View>
        <IconButton icon={() => <Filter size={20} color="#2563EB" />} onPress={() => {}} />

      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {CATEGORIES.map(category => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.categoryButtonTextActive
            ]}>
              {category}
            </Text>
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.resultsText}>
          {filteredBusinesses.length} business{filteredBusinesses.length !== 1 ? 'es' : ''} found
        </Text>
        
        {filteredBusinesses.map(renderBusiness)}

        {filteredBusinesses.length === 0 && (
          <View style={styles.emptyState}>
            <Building size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No Businesses Found</Text>
            <Text style={styles.emptyMessage}>
              Try adjusting your search or browse different categories.
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
    paddingTop: 10
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1E293B',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriesContainer: {
    marginBottom: 6,
    minHeight: 45,
    maxHeight:45
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',

  },
  categoryButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
  },
  resultsText: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '500',
  },
  businessCard: {
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
  businessImage: {
    width: '100%',
    height: 160,
  },
  businessContent: {
    padding: 16,
  },
  businessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  favoriteButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  businessDescription: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  businessDetails: {
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
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    gap: 6,
  },
  visitButtonText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
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