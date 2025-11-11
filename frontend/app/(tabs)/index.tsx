import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Bell,
  Search,
  Star,
  Clock,
  Heart,
  TrendingUp,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const featuredDeals = [
  {
    id: '1',
    title: '50% Off All Pizzas',
    business: "Mario's Pizza Palace",
    category: 'Food',
    originalPrice: 25,
    discountedPrice: 12.5,
    discount: 50,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    rating: 4.8,
    distance: '0.3 km',
    expiresIn: '2d',
  },
  {
    id: '2',
    title: 'Buy 2 Get 1 Free Coffee',
    business: 'Urban Brew Cafe',
    category: 'Cafe',
    originalPrice: 15,
    discountedPrice: 10,
    discount: 33,
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    rating: 4.6,
    distance: '0.8 km',
    expiresIn: '5d',
  },
  {
    id: '3',
    title: '30% Off Spa Services',
    business: 'Serenity Wellness Spa',
    category: 'Wellness',
    originalPrice: 120,
    discountedPrice: 84,
    discount: 30,
    image: 'https://images.pexels.com/photos/3757942/pexels-photo-3757942.jpeg',
    rating: 4.9,
    distance: '1.2 km',
    expiresIn: '7d',
  },
];

const nearbyDeals = [
  {
    id: '4',
    title: '20% Off Electronics',
    business: 'TechZone Store',
    discount: 20,
    image: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg',
    rating: 4.4,
    distance: '0.5 km',
  },
  {
    id: '5',
    title: 'Free Delivery',
    business: 'Fresh Grocery',
    discount: 15,
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg',
    rating: 4.7,
    distance: '0.9 km',
  },
  {
    id: '6',
    title: '15% Off Classes',
    business: 'FitLife Gym',
    discount: 15,
    image: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg',
    rating: 4.5,
    distance: '1.1 km',
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [likedDeals, setLikedDeals] = useState<string[]>([]);

  const toggleLike = (dealId: string) => {
    setLikedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const FeaturedDealCard = ({ deal }: { deal: typeof featuredDeals[0] }) => (
    <TouchableOpacity style={styles.featuredCard} activeOpacity={0.9}>
      <Image source={{ uri: deal.image }} style={styles.featuredImage} />
      <View style={styles.imageOverlay} />
      
      <View style={styles.cardHeader}>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{deal.discount}%</Text>
        </View>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => toggleLike(deal.id)}>
          <Heart
            size={18}
            color={likedDeals.includes(deal.id) ? '#00D9A3' : '#FFFFFF'}
            fill={likedDeals.includes(deal.id) ? '#00D9A3' : 'none'}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.dealTitle}>{deal.title}</Text>
        <Text style={styles.businessName}>{deal.business}</Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.priceRow}>
            <Text style={styles.oldPrice}>${deal.originalPrice}</Text>
            <Text style={styles.newPrice}>${deal.discountedPrice}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Star size={12} color="#00D9A3" fill="#00D9A3" />
            <Text style={styles.metaText}>{deal.rating}</Text>
            <View style={styles.dot} />
            <MapPin size={12} color="#666666" />
            <Text style={styles.metaText}>{deal.distance}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const NearbyDealCard = ({ deal }: { deal: typeof nearbyDeals[0] }) => (
    <TouchableOpacity style={styles.nearbyCard} activeOpacity={0.9}>
      <Image source={{ uri: deal.image }} style={styles.nearbyImage} />
      <View style={styles.nearbyContent}>
        <Text style={styles.nearbyTitle}>{deal.title}</Text>
        <Text style={styles.nearbyBusiness}>{deal.business}</Text>
        <View style={styles.nearbyFooter}>
          <View style={styles.metaRow}>
            <Star size={11} color="#00D9A3" fill="#00D9A3" />
            <Text style={styles.nearbyMetaText}>{deal.rating}</Text>
          </View>
          <Text style={styles.nearbyDiscount}>{deal.discount}% off</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#00D9A3" />
                <Text style={styles.location}>Downtown</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell size={22} color="#FFFFFF" strokeWidth={1.5} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#666666" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search deals..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666666"
            />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={18} color="#00D9A3" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.statNumber}>150+</Text>
              <Text style={styles.statLabel}>Active Deals</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={18} color="#00D9A3" strokeWidth={2} />
            </View>
            <View>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
          </View>
        </View>

        {/* Featured Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}>
            {featuredDeals.map(deal => (
              <FeaturedDealCard key={deal.id} deal={deal} />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Deals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.nearbyGrid}>
            {nearbyDeals.map(deal => (
              <NearbyDealCard key={deal.id} deal={deal} />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    backgroundColor: '#00D9A3',
    borderRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    color: '#00D9A3',
    fontWeight: '400',
  },
  featuredScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  featuredCard: {
    width: width * 0.75,
    height: 320,
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 180,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardHeader: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountBadge: {
    backgroundColor: '#00D9A3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: 0.5,
  },
  likeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  businessName: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  cardFooter: {
    gap: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  oldPrice: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  newPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#00D9A3',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666666',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#333333',
    marginHorizontal: 6,
  },
  nearbyGrid: {
    paddingHorizontal: 20,
    gap: 12,
  },
  nearbyCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  nearbyImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  nearbyContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nearbyTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  nearbyBusiness: {
    fontSize: 13,
    color: '#666666',
  },
  nearbyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyMetaText: {
    fontSize: 12,
    color: '#666666',
  },
  nearbyDiscount: {
    fontSize: 13,
    color: '#00D9A3',
    fontWeight: '500',
  },
});