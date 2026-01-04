import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import {
  MapPin,
  Bell,
  Star,
  Heart,
  ChevronRight,
  BrainCircuit,
} from 'lucide-react-native';
import { useWalletStore } from '@/store/walletStore';
import { useMissionStore } from '@/store/missionStore';
import { theme as staticTheme } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useAppTheme } from '@/store/themeStore';
import { usePersonaStore } from '@/store/personaStore';
import { XPBar } from '@/components/gamification/XPBar';
import { DailyCheckInCard } from '@/components/gamification/DailyCheckInCard';
import { dealsService, Deal } from '@/services/api';
import { useExternalLoyaltyStore } from '@/store/externalLoyaltyStore';
import { useAuth } from '../_layout';
import { DEMO_DEALS } from '@/constants/demoData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 20;

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
  const [likedDeals, setLikedDeals] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'distance' | 'discount' | 'rating'>('distance');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingLike, setTogglingLike] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>(['All']);
  const { reminders } = useExternalLoyaltyStore();
  const unreadCount = reminders.filter(r => !r.isRead).length;

  const { user } = useAuth();
  const setUser = useUserStore((state) => state.setUser);
  const theme = useAppTheme();
  // --- AI Context ---
  const { context, currentMood, predictions } = usePersonaStore();
  const styles = getStyles(theme);

  React.useEffect(() => {
    loadDeals();
    if (user) {
      loadFavorites();
    } else {
      setLikedDeals([]);
    }
  }, [user]);

  const loadDeals = async () => {
    try {
      const response = await dealsService.getDeals();
      if (response.data && response.data.length > 0) {
        setDeals(response.data);
        const uniqueCategories = Array.from(new Set(response.data.map(d => d.category))).filter(Boolean);
        setCategories(['All', ...uniqueCategories]);
      } else {
        // Use demo data as fallback
        setDeals(DEMO_DEALS as any);
        const uniqueCategories = Array.from(new Set(DEMO_DEALS.map(d => d.category))).filter(Boolean);
        setCategories(['All', ...uniqueCategories]);
      }
    } catch (error) {
      console.error('Failed to load deals', error);
      // Use demo data on error
      setDeals(DEMO_DEALS as any);
      const uniqueCategories = Array.from(new Set(DEMO_DEALS.map(d => d.category))).filter(Boolean);
      setCategories(['All', ...uniqueCategories]);
    } finally {
      setLoading(false);
    }
  };

  // Reorder Categories based on AI Context
  React.useEffect(() => {
    if (categories.length <= 1) return; // Only 'All' or empty

    const sorted = [...categories];
    // Remove 'All' temporarily
    const all = sorted.shift();

    sorted.sort((a, b) => {
      const getScore = (cat: string) => {
        const c = cat.toLowerCase();
        // Morning priorities
        if (context.timeOfDay === 'morning') {
          if (c.includes('coffee') || c.includes('cafe') || c.includes('breakfast')) return 10;
          if (c.includes('bar') || c.includes('pub')) return -5;
        }
        // Evening priorities
        if (context.timeOfDay === 'evening') {
          if (c.includes('dinner') || c.includes('bar') || c.includes('night') || c.includes('club')) return 10;
          if (c.includes('coffee')) return -2;
        }
        // Mood priorities
        if (currentMood === 'stressed' && (c.includes('spa') || c.includes('massage') || c.includes('wellness'))) return 15;
        if (currentMood === 'energetic' && (c.includes('gym') || c.includes('sport'))) return 15;

        return 0;
      };
      return getScore(b) - getScore(a);
    });

    if (all) sorted.unshift(all);
    // Only update if different to avoid unused cycle (simple check)
    setCategories(sorted);
  }, [context, currentMood, deals]); // Re-run when context changes

  const loadFavorites = async () => {
    try {
      const response = await dealsService.getFavorites();
      if (response.data) {
        const favoriteIds = response.data.map(deal => deal._id);
        setLikedDeals(favoriteIds);
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    }
  };

  // --- Logic Preserved ---
  const filterAndSortDeals = (dealsList: Deal[]) => {
    let filtered = dealsList;
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(deal => deal.category === selectedCategory);
    }
    // Mock sort for now as API doesn't return distance/rating yet
    return filtered;
  };

  const filteredFeaturedDeals = filterAndSortDeals(deals);
  const nearbyDeals = deals.slice(0, 3); // Just take first 3 for nearby for now

  const toggleLike = async (dealId: string) => {
    if (togglingLike === dealId) return; // Prevent multiple clicks

    // Optimistic update
    const wasLiked = likedDeals.includes(dealId);
    setLikedDeals(prev =>
      wasLiked ? prev.filter(id => id !== dealId) : [...prev, dealId]
    );

    setTogglingLike(dealId);
    try {
      const response = await dealsService.toggleFavorite(dealId);
      if (response.data) {
        // Update with server response to ensure consistency
        setLikedDeals(prev =>
          response.data?.isFavorited
            ? [...prev.filter(id => id !== dealId), dealId]
            : prev.filter(id => id !== dealId)
        );
      } else if (response.error) {
        // Revert on error
        setLikedDeals(prev =>
          wasLiked ? [...prev, dealId] : prev.filter(id => id !== dealId)
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite', error);
      // Revert on error
      setLikedDeals(prev =>
        wasLiked ? [...prev, dealId] : prev.filter(id => id !== dealId)
      );
    } finally {
      setTogglingLike(null);
    }
  };


  // ... (in HomeScreen)

  const handleUpdateLocation = async () => {
    Alert.alert(
      "Update Location",
      "Do you want to use your current location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Get Current Location",
          onPress: async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') return;

              const location = await Location.getCurrentPositionAsync({});
              const { latitude, longitude } = location.coords;
              const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

              if (geocode.length > 0) {
                const address = `${geocode[0].city}, ${geocode[0].region}`;
                if (user) {
                  setUser({
                    ...user,
                    profile: {
                      ...user.profile,
                      location: {
                        address: address,
                        coordinates: [longitude, latitude]
                      }
                    } as any
                  });
                }
              }
            } catch (error) {
              console.log('Location error', error);
            }
          }
        }
      ]
    );
  };

  // --- AI Context ---


  const getDynamicGreeting = () => {
    const hour = new Date().getHours();
    const userName = user?.profile?.name || 'User';

    if (currentMood === 'stressed') return `Relax & Unwind, ${userName}`;
    if (currentMood === 'celebratory') return `Let's Party, ${userName}!`;

    // Time-based greetings using actual current time
    if (hour >= 5 && hour < 12) return `Good Morning, ${userName}`;
    if (hour >= 12 && hour < 17) return `Good Afternoon, ${userName}`;
    if (hour >= 17 && hour < 21) return `Good Evening, ${userName}`;
    return `Good Night, ${userName}`;
  };

  const Header = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTopRow}>
        <TouchableOpacity style={styles.locationPill} onPress={handleUpdateLocation}>
          <MapPin size={14} color={theme.colors.primary} />
          <Text style={styles.locationText}>{user?.profile?.location?.address || 'Set Location'}</Text>
          <ChevronRight size={12} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          {/* AI Badge */}


          <XPBar compact />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/loyalty-notifications')}
          >
            <Bell size={20} color={theme.colors.text} />
            {unreadCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingMain}>{getDynamicGreeting()}</Text>
        <Text style={{ color: theme.colors.textSecondary, marginTop: 4 }}>
          {predictions.nextLikelyActivity ? `Suggested: ${predictions.nextLikelyActivity}` : 'Explore the best around you'}
        </Text>
      </View>
    </View>
  );


  const FeaturedCard = ({ deal }: { deal: Deal }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.featuredCard}
      onPress={() => {
        console.log('Navigating to deal:', deal._id);
        router.push(`/deal/${deal._id}` as any);
      }}
    >
      <Image source={{ uri: deal.images[0] || 'https://via.placeholder.com/300' }} style={styles.featuredImage} resizeMode="cover" />
      <View style={styles.featuredOverlay} />

      {/* Top Tags */}
      <View style={styles.cardTopRow}>
        <View style={styles.discountTag}>
          <Text style={styles.discountTagText}>{deal.discountPercentage}% OFF</Text>
        </View>
        <TouchableOpacity style={styles.likeButtonBlur} onPress={() => toggleLike(deal._id)}>
          <Heart
            size={18}
            color={likedDeals.includes(deal._id) ? theme.colors.primary : '#FFF'}
            fill={likedDeals.includes(deal._id) ? theme.colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.cardBottomContent}>
        <View>
          <Text style={styles.cardBusiness}>{deal.merchantId?.name || 'Merchant'}</Text>
          <Text style={styles.cardTitle} numberOfLines={1}>{deal.title}</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.ratingPill}>
            <Star size={12} color={theme.colors.warning} fill={theme.colors.warning} />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
          <Text style={styles.cardDistance}>• 1.2 km</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.priceContainer}>
            <Text style={styles.oldPrice}>₹{deal.originalPrice}</Text>
            <Text style={styles.newPrice}>₹{deal.discountedPrice}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const NearbyRow = ({ deal }: { deal: Deal }) => (
    <TouchableOpacity
      style={styles.nearbyRow}
      activeOpacity={0.7}
      onPress={() => {
        console.log('Navigating to deal:', deal._id);
        router.push(`/deal/${deal._id}` as any);
      }}
    >
      <Image source={{ uri: deal.images[0] || 'https://via.placeholder.com/100' }} style={styles.nearbyImage} />
      <View style={styles.nearbyInfo}>
        <View style={styles.nearbyHeader}>
          <Text style={styles.nearbyBusiness}>{deal.merchantId?.name || 'Merchant'}</Text>
          <View style={styles.nearbyRating}>
            <Star size={10} color={theme.colors.warning} fill={theme.colors.warning} />
            <Text style={styles.nearbyRatingText}>4.5</Text>
          </View>
        </View>
        <Text style={styles.nearbyTitle}>{deal.title}</Text>
        <Text style={styles.nearbyMeta}>1.5 km • {deal.discountPercentage}% Discount</Text>
      </View>
      <View style={styles.chevronContainer}>
        <ChevronRight size={16} color={theme.colors.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle={theme.isDark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>

        <Header />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

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

          {/* Daily Check-in Card */}
          <View style={{ paddingHorizontal: SPACING }}>
            <DailyCheckInCard />
          </View>

          {/* Featured Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Deals</Text>
            <TouchableOpacity onPress={() => router.push('/category/all')}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
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
              <View key={deal._id} style={{ marginRight: SPACING }}>
                <FeaturedCard deal={deal} />
              </View>
            ))}
          </ScrollView>


          {/* Nearby Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Near You</Text>
          </View>

          <View style={{ paddingHorizontal: SPACING }}>
            {nearbyDeals.map(deal => <NearbyRow key={deal._id} deal={deal} />)}
          </View>

        </ScrollView>

        {/* Floating Utopia AI Button */}
        <TouchableOpacity
          style={styles.floatingAIButton}
          onPress={() => router.push('/utopia-ai' as any)}
          activeOpacity={0.9}
        >
          <View style={styles.floatingAIGradient}>
            <BrainCircuit size={24} color="#FFF" />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header Styles
  headerContainer: {
    paddingHorizontal: SPACING,
    paddingVertical: 10,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  locationText: {
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    height: 40,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
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
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  greetingContainer: {
    marginBottom: 16,
  },
  greetingMain: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.text,
    fontSize: 15,
  },
  searchDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.colors.surfaceLight,
    marginHorizontal: 12,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchClose: {
    color: theme.colors.text,
    fontSize: 18,
    paddingHorizontal: 8,
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
    backgroundColor: theme.colors.primary,
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
  ridePulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: theme.colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    gap: 12,
  },
  aiIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: {
    color: theme.colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  aiSub: {
    color: theme.colors.textSecondary,
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
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginRight: 10,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.text,
    borderColor: theme.colors.text,
  },
  categoryText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: theme.colors.background,
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
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  sectionLink: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Featured Card
  featuredCard: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
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
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.isDark ? 'rgba(15, 17, 21, 0.85)' : 'rgba(255, 255, 255, 0.85)', // Simulating blurred glass footer
  },
  cardBusiness: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: {
    color: theme.colors.text,
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
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  cardDistance: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  oldPrice: {
    color: theme.colors.textTertiary,
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  newPrice: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: SPACING,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginVertical: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.surfaceLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '40%',
  },
  statVal: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textSecondary,
    fontSize: 11,
  },

  // Nearby Row
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
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
    color: theme.colors.textSecondary,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  nearbyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  nearbyRatingText: {
    color: theme.colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  nearbyTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 2,
  },
  nearbyMeta: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  chevronContainer: {
    padding: 8,
  },
  // Floating AI Button
  floatingAIButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingAIGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
