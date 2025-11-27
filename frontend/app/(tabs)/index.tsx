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
  Platform,
  StatusBar,
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
  ChevronRight,
  Zap,
  Tag
} from 'lucide-react-native';
import { useWalletStore } from '@/store/walletStore';
import { useRideStore } from '@/store/rideStore';
import { useMissionStore } from '@/store/missionStore';
import { useAIPersonalizationStore, getMoodEmoji } from '@/store/aiPersonalizationStore';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 20;

// --- Mock Data (Preserved) ---
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

// --- Designer Colors ---
const COLORS = {
  background: '#0F1115',
  surface: '#181A20',
  surfaceHighlight: '#22252D',
  primary: '#2DD4BF', // Teal-400
  primaryGlow: 'rgba(45, 212, 191, 0.2)',
  secondary: '#818CF8', // Indigo-400
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: 'rgba(255,255,255,0.08)',
  success: '#34D399',
  warning: '#FBBF24',
};

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
  } = useAIPersonalizationStore();

  const archetypeInfo = getArchetypeInfo();
  const personalizedGreeting = getContextualGreeting();

  const categories = ['All', 'Food', 'Cafe', 'Wellness', 'Shopping', 'Fitness'];

  // --- Logic Preserved ---
  const filterAndSortDeals = (deals: typeof featuredDeals) => {
    let filtered = deals;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(deal =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.business.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'distance') return parseFloat(a.distance) - parseFloat(b.distance);
      if (sortBy === 'discount') return b.discount - a.discount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
    return sorted;
  };

  const filteredFeaturedDeals = filterAndSortDeals(featuredDeals);

  const toggleLike = (dealId: string) => {
    setLikedDeals(prev => prev.includes(dealId) ? prev.filter(id => id !== dealId) : [...prev, dealId]);
  };

  // --- Components ---

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.locationPill}>
          <MapPin size={14} color={COLORS.primary} />
          <Text style={styles.locationText}>Downtown Area</Text>
          <ChevronRight size={12} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.aiBadge} onPress={() => router.push('/ai-profile')}>
            <Text style={{ fontSize: 12 }}>{archetypeInfo.icon}</Text>
            <Text style={styles.aiBadgeText}>{getMoodEmoji(userProfile.currentContext.mood)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Bell size={20} color={COLORS.text} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingSub}>Good Morning,</Text>
        <Text style={styles.greetingMain}>Alex</Text>
      </View>

      <View style={styles.searchWrapper}>
        <Search size={18} color={COLORS.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search deals, places..."
          placeholderTextColor={COLORS.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.searchDivider} />
        <TouchableOpacity>
          <Filter size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const ActiveRideWidget = () => (
    <TouchableOpacity style={styles.rideWidget} activeOpacity={0.9} onPress={() => router.push('/ride-status')}>
      <View style={styles.rideWidgetLeft}>
        <View style={styles.rideIconContainer}>
          <Car size={20} color="#000" fill="#000" />
        </View>
        <View>
          <Text style={styles.rideTitle}>
            {activeRide?.status === 'arriving' ? 'Driver Arriving' : 'Ride Active'}
          </Text>
          <Text style={styles.rideSubtitle}>{activeRide?.providerName} • 4 min away</Text>
        </View>
      </View>
      <View style={styles.ridePulseContainer}>
        <View style={styles.ridePulse} />
      </View>
    </TouchableOpacity>
  );

  const FeaturedCard = ({ deal }: { deal: typeof featuredDeals[0] }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.featuredCard}>
      <Image source={{ uri: deal.image }} style={styles.featuredImage} resizeMode="cover" />
      <View style={styles.featuredOverlay} />

      {/* Top Tags */}
      <View style={styles.cardTopRow}>
        <View style={styles.discountTag}>
          <Text style={styles.discountTagText}>{deal.discount}% OFF</Text>
        </View>
        <TouchableOpacity style={styles.likeButtonBlur} onPress={() => toggleLike(deal.id)}>
          <Heart
            size={18}
            color={likedDeals.includes(deal.id) ? COLORS.primary : '#FFF'}
            fill={likedDeals.includes(deal.id) ? COLORS.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.cardBottomContent}>
        <View>
          <Text style={styles.cardBusiness}>{deal.business}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{deal.title}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingPill}>
            <Star size={12} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.ratingText}>{deal.rating}</Text>
          </View>
          <Text style={styles.cardDistance}>• {deal.distance}</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.priceContainer}>
            <Text style={styles.oldPrice}>${deal.originalPrice}</Text>
            <Text style={styles.newPrice}>${deal.discountedPrice}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const NearbyRow = ({ deal }: { deal: typeof nearbyDeals[0] }) => (
    <TouchableOpacity style={styles.nearbyRow} activeOpacity={0.7}>
      <Image source={{ uri: deal.image }} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <View style={styles.nearbyHeader}>
          <Text style={styles.nearbyBusiness}>{deal.business}</Text>
          <View style={styles.nearbyRating}>
            <Star size={10} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.nearbyRatingText}>{deal.rating}</Text>
          </View>
        </View>
        <Text style={styles.nearbyTitle}>{deal.title}</Text>
        <Text style={styles.nearbyMeta}>{deal.distance} • {deal.discount}% Discount</Text>
      </View>
      <View style={styles.chevronContainer}>
        <ChevronRight size={16} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>

        <Header />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Dynamic Widgets Area */}
          <View style={styles.widgetsArea}>
            {activeRide && <ActiveRideWidget />}

            {/* AI Recommendation - Sleek Version */}
            <TouchableOpacity style={styles.aiBanner} onPress={() => router.push('/ai-recommendations')}>
              <View style={styles.aiIconCircle}>
                <Sparkles size={18} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.aiTitle}>Curated for {archetypeInfo.name}</Text>
                <Text style={styles.aiSub}>Based on your recent activity</Text>
              </View>
              <ChevronRight size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SPACING }}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryPill,
                    selectedCategory === cat && styles.categoryPillActive,
                    index === 0 && { marginLeft: 0 }
                  ]}>
                  <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Deals</Text>
            <Text style={styles.sectionLink}>View All</Text>
          </View>

          <ScrollView
            horizontal
            pagingEnabled
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + SPACING}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: SPACING }}
          >
            {filteredFeaturedDeals.map((deal) => (
              <View key={deal.id} style={{ marginRight: SPACING }}>
                <FeaturedCard deal={deal} />
              </View>
            ))}
          </ScrollView>

          {/* Stats Dashboard */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <TrendingUp size={20} color={COLORS.success} />
              <View>
                <Text style={styles.statVal}>150+</Text>
                <Text style={styles.statLabel}>Live Deals</Text>
              </View>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <Zap size={20} color={COLORS.warning} />
              <View>
                <Text style={styles.statVal}>Fast</Text>
                <Text style={styles.statLabel}>Booking</Text>
              </View>
            </View>
          </View>

          {/* Nearby Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near You</Text>
          </View>

          <View style={{ paddingHorizontal: SPACING }}>
            {nearbyDeals.map(deal => <NearbyRow key={deal.id} deal={deal} />)}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Header Styles
  headerContainer: {
    paddingHorizontal: SPACING,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.3)',
  },
  aiBadgeText: {
    fontSize: 14,
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  greetingContainer: {
    marginBottom: 20,
  },
  greetingSub: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  greetingMain: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -0.5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: COLORS.text,
    fontSize: 15,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },

  // Widgets
  widgetsArea: {
    paddingHorizontal: SPACING,
    gap: 12,
    marginBottom: 24,
  },
  rideWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 16,
  },
  rideWidgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rideIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rideTitle: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  rideSubtitle: {
    color: 'rgba(0,0,0,0.7)',
    fontSize: 12,
  },
  ridePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  aiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 13,
  },
  aiSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  // Categories
  categoryContainer: {
    marginBottom: 30,
  },
  categoryPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: COLORS.text,
    borderColor: COLORS.text,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: COLORS.background,
    fontWeight: '700',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  sectionLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Featured Card
  featuredCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)', // Darken image slightly
    // In a real app, use LinearGradient here: transparent -> black
  },
  cardTopRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountTagText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 11,
  },
  likeButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardBottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(15, 17, 21, 0.85)', // Simulating blurred glass footer
  },
  cardBusiness: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
  cardDistance: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldPrice: {
    color: COLORS.textTertiary,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  newPrice: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '40%',
  },
  statVal: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },

  // Nearby Row
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nearbyImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  nearbyInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nearbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nearbyBusiness: {
    color: COLORS.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  nearbyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  nearbyRatingText: {
    color: COLORS.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  nearbyTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 2,
  },
  nearbyMeta: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  chevronContainer: {
    padding: 8,
  }
});