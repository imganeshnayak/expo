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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  MapPin,
  Bell,
  Search,
  Star,
  Clock,
  Heart,
  TrendingUp,
  Car,
  Filter,
  Sparkles,
} from 'lucide-react-native';
import { useWalletStore } from '@/store/walletStore';
import { useRideStore } from '@/store/rideStore';
import { useMissionStore } from '@/store/missionStore';
import { useAIPersonalizationStore, getMoodEmoji } from '@/store/aiPersonalizationStore';
import { theme } from '@/constants/theme';

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [likedDeals, setLikedDeals] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'discount' | 'rating'>('distance');
  const { createBooking } = useWalletStore();
  const { setDestination, activeRide } = useRideStore();
  const { 
    userProfile, 
    getContextualGreeting, 
    getArchetypeInfo,
    trackAction,
    rankDeals,
  } = useAIPersonalizationStore();
  
  const archetypeInfo = getArchetypeInfo();
  const personalizedGreeting = getContextualGreeting();

  const categories = ['All', 'Food', 'Cafe', 'Wellness', 'Shopping', 'Fitness'];

  const filterAndSortDeals = (deals: typeof featuredDeals) => {
    let filtered = deals;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.business.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'distance') {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else if (sortBy === 'discount') {
        return b.discount - a.discount;
      } else if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });

    return sorted;
  };

  const filteredFeaturedDeals = filterAndSortDeals(featuredDeals);
  const filteredNearbyDeals = filterAndSortDeals(nearbyDeals.map(d => ({
    ...d,
    category: d.title.includes('Electronics') ? 'Shopping' : d.title.includes('Grocery') ? 'Food' : 'Fitness',
    originalPrice: 100,
    discountedPrice: 100 - d.discount,
    expiresIn: '3d',
  })));

  const toggleLike = (dealId: string) => {
    setLikedDeals(prev =>
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };

  const handleBookRide = (deal: typeof featuredDeals[0]) => {
    // Set destination for the ride
    setDestination({
      latitude: 12.9716,
      longitude: 77.5946,
      address: `${deal.business}, ${deal.distance} away`,
    });

    // Navigate to ride booking with deal info
    router.push({
      pathname: '/ride-booking',
      params: {
        dealId: deal.id,
        dealLocation: `${deal.business}, ${deal.distance} away`,
        dealTitle: deal.title,
      },
    });
  };

  const handleBookDeal = (deal: typeof featuredDeals[0]) => {
    // Track AI action
    trackAction({
      type: 'deal_claimed',
      timestamp: new Date(),
      metadata: { 
        dealId: deal.id,
        category: deal.category,
        price: deal.discountedPrice,
      },
      context: userProfile.currentContext,
    });

    // Create booking
    const bookingData = {
      userId: 'user_12345', // Replace with actual user ID
      dealId: deal.id,
      dealTitle: deal.title,
      dealDiscount: deal.discount,
      merchant: deal.business,
      qrData: JSON.stringify({
        bookingId: '', // Will be set by createBooking
        userId: 'user_12345',
        dealId: deal.id,
        merchant: deal.business,
        discount: deal.discount,
        timestamp: Date.now(),
        type: 'booking',
      }),
      cashbackAmount: deal.discountedPrice * 0.1, // 10% cashback
    };

    const booking = createBooking(bookingData);
    
    // Track mission progress for deal booking
    useMissionStore.getState().trackDealBooking(deal.id);
    
    // Update QR data with actual booking ID
    const updatedQrData = JSON.stringify({
      ...JSON.parse(bookingData.qrData),
      bookingId: booking.id,
    });
    
    // Navigate to confirmation screen
    router.push({
      pathname: '/booking-confirmation',
      params: { bookingId: booking.id },
    });
  };

  const FeaturedDealCard = ({ deal }: { deal: typeof featuredDeals[0] }) => (
    <View style={styles.featuredCard}>
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
            <Text style={styles.oldPrice}>₹{deal.originalPrice}</Text>
            <Text style={styles.newPrice}>₹{deal.discountedPrice}</Text>
          </View>
          
          <View style={styles.metaRow}>
            <Star size={12} color="#00D9A3" fill="#00D9A3" />
            <Text style={styles.metaText}>{deal.rating}</Text>
            <View style={styles.dot} />
            <MapPin size={12} color="#666666" />
            <Text style={styles.metaText}>{deal.distance}</Text>
          </View>
        </View>

        {/* Book Deal Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handleBookDeal(deal)}
            activeOpacity={0.8}>
            <Text style={styles.bookButtonText}>Book Deal</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.rideButton}
            onPress={() => handleBookRide(deal)}
            activeOpacity={0.8}>
            <Car size={16} color="#00D9A3" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
        {/* Active Ride Widget */}
        {activeRide && (
          <TouchableOpacity
            style={styles.activeRideWidget}
            onPress={() => router.push('/ride-status')}
            activeOpacity={0.9}>
            <View style={styles.rideWidgetIcon}>
              <Car size={20} color="#00D9A3" />
            </View>
            <View style={styles.rideWidgetContent}>
              <Text style={styles.rideWidgetTitle}>
                {activeRide.status === 'arriving' ? 'Driver Arriving' : 
                 activeRide.status === 'ongoing' ? 'Ride in Progress' : 'Ride Confirmed'}
              </Text>
              <Text style={styles.rideWidgetSubtitle}>
                {activeRide.providerName} • Tap to view details
              </Text>
            </View>
            <View style={styles.ridePulse} />
          </TouchableOpacity>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{personalizedGreeting}</Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color="#00D9A3" />
                <Text style={styles.location}>Downtown</Text>
              </View>
              {/* AI Profile Badge */}
              <TouchableOpacity 
                style={styles.aiProfileBadge}
                onPress={() => router.push('/ai-profile')}
                activeOpacity={0.8}>
                <Text style={styles.aiProfileIcon}>{archetypeInfo.icon}</Text>
                <Text style={styles.aiProfileText}>{archetypeInfo.name}</Text>
                <Text style={styles.aiProfileMood}>{getMoodEmoji(userProfile.currentContext.mood)}</Text>
              </TouchableOpacity>
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

        {/* Category Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive,
              ]}
              onPress={() => setSelectedCategory(category)}
              activeOpacity={0.7}>
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive,
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Filter size={16} color={theme.colors.textSecondary} />
          <Text style={styles.sortLabel}>Sort by:</Text>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'distance' && styles.sortOptionActive]}
            onPress={() => setSortBy('distance')}>
            <Text style={[styles.sortText, sortBy === 'distance' && styles.sortTextActive]}>
              Distance
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'discount' && styles.sortOptionActive]}
            onPress={() => setSortBy('discount')}>
            <Text style={[styles.sortText, sortBy === 'discount' && styles.sortTextActive]}>
              Discount
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortOption, sortBy === 'rating' && styles.sortOptionActive]}
            onPress={() => setSortBy('rating')}>
            <Text style={[styles.sortText, sortBy === 'rating' && styles.sortTextActive]}>
              Rating
            </Text>
          </TouchableOpacity>
        </View>

        {/* Coupon Discovery Banner */}
        <TouchableOpacity 
          style={styles.couponDiscoveryBanner}
          onPress={() => router.push('/coupon-discovery')}
          activeOpacity={0.9}>
          <View style={styles.bannerGradient}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconWrapper}>
                <Text style={styles.bannerIcon}>💎</Text>
              </View>
              <View style={styles.bannerTextWrapper}>
                <Text style={styles.bannerTitle}>Magic Deals 🔥</Text>
                <Text style={styles.bannerSubtitle}>Stack coupons, save more</Text>
              </View>
            </View>
            <View style={styles.bannerRight}>
              <Text style={styles.bannerCTA}>Discover</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* AI Recommendations Quick Access */}
        <TouchableOpacity 
          style={styles.aiRecommendationBanner}
          onPress={() => router.push('/ai-recommendations')}
          activeOpacity={0.9}>
          <View style={styles.aiRecommendationContent}>
            <View style={styles.aiRecommendationIcon}>
              <Sparkles size={20} color="#8b5cf6" />
            </View>
            <View style={styles.aiRecommendationText}>
              <Text style={styles.aiRecommendationTitle}>AI Picks for You</Text>
              <Text style={styles.aiRecommendationSubtitle}>
                Based on your {archetypeInfo.name.toLowerCase()} personality
              </Text>
            </View>
          </View>
          <View style={styles.aiRecommendationArrow}>
            <Text style={styles.aiRecommendationArrowText}>→</Text>
          </View>
        </TouchableOpacity>

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
            <Text style={styles.sectionTitle}>Featured {selectedCategory !== 'All' && `• ${selectedCategory}`}</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>View all</Text>
            </TouchableOpacity>
          </View>
          {filteredFeaturedDeals.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredScroll}>
              {filteredFeaturedDeals.map(deal => (
                <FeaturedDealCard key={deal.id} deal={deal} />
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyResults}>
              <Search size={32} color={theme.colors.textTertiary} />
              <Text style={styles.emptyText}>No deals found</Text>
            </View>
          )}
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
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
    height: 380,
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
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#00D9A3',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0A0A',
    letterSpacing: -0.2,
  },
  rideButton: {
    width: 48,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D9A3',
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
  activeRideWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00D9A3',
    gap: 12,
  },
  rideWidgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00D9A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rideWidgetContent: {
    flex: 1,
  },
  rideWidgetTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rideWidgetSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  ridePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D9A3',
  },
  categoryContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
    maxHeight: 40,
  },
  categoryContent: {
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  categoryPillActive: {
    backgroundColor: '#00D9A3',
    borderColor: '#00D9A3',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  categoryTextActive: {
    color: '#0A0A0A',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sortLabel: {
    fontSize: 13,
    color: '#666666',
    marginRight: 4,
  },
  sortOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
  },
  sortTextActive: {
    color: '#00D9A3',
  },
  emptyResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  aiProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  aiProfileIcon: {
    fontSize: 14,
  },
  aiProfileText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa',
  },
  aiProfileMood: {
    fontSize: 12,
  },
  couponDiscoveryBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    backgroundColor: '#f59e0b',
    padding: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bannerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerIcon: {
    fontSize: 24,
  },
  bannerTextWrapper: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  bannerRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bannerCTA: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  aiRecommendationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  aiRecommendationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  aiRecommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRecommendationText: {
    flex: 1,
  },
  aiRecommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  aiRecommendationSubtitle: {
    fontSize: 12,
    color: '#a78bfa',
  },
  aiRecommendationArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiRecommendationArrowText: {
    fontSize: 18,
    color: '#8b5cf6',
  },
});