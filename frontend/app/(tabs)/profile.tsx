import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  Platform,
  Easing,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Heart, Bell, MapPin, Settings, Circle as HelpCircle, Shield, Star, ChevronRight, CreditCard as Edit3, CreditCard, Gift, Bookmark, Share2, TrendingUp, TrendingDown, ArrowDownToLine, Award, Users, Zap, Moon, Sun, QrCode, BrainCircuit } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { useAppTheme, useThemeStore } from '@/store/themeStore';
import { useAuth } from '../_layout';
import { authService, loyaltyService, LoyaltyProfile } from '@/services/api';
import { useUserStore } from '@/store/userStore';
import { useSocialStore } from '@/store/socialStore';
import { canAccessFeature } from '@/constants/gamification';
import { Sparkles } from 'lucide-react-native';

const ARCHETYPES = [
  { id: 'deal_hunter', title: 'The Deal Hunter' },
  { id: 'socialite', title: 'The Socialite' },
  { id: 'explorer', title: 'The Explorer' },
  { id: 'saver', title: 'The Saver' },
];

// --- Micro-Animation Components ---

// 1. Scale Button for Press Feedback
const ScaleButton = ({ children, onPress, style, activeOpacity = 0.9 }: { children: React.ReactNode; onPress: () => void; style?: any; activeOpacity?: number }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={{ flex: 1 }} // Ensure it fills container if needed
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// 2. Fade In View for Entry Animations
const FadeInView = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 600,
        delay: delay,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.profile?.preferences?.notifications ?? true);
  const [locationEnabled, setLocationEnabled] = useState(user?.profile?.preferences?.locationServices ?? true);
  const [loyaltyProfile, setLoyaltyProfile] = useState<LoyaltyProfile | null>(null);
  const [claimedDeals, setClaimedDeals] = useState<any[]>([]);
  const [favoritedDeals, setFavoritedDeals] = useState<any[]>([]);
  const [loadingClaimed, setLoadingClaimed] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const { myArchetype, fetchArchetype } = useSocialStore();

  useEffect(() => {
    if (user) {
      loadLoyaltyProfile();
      loadClaimedDeals();
      loadFavorites();
      fetchArchetype();
    }
  }, [user]);

  useEffect(() => {
    // Update local state when user profile changes
    if (user?.profile?.preferences) {
      setNotificationsEnabled(user.profile.preferences.notifications ?? true);
      setLocationEnabled(user.profile.preferences.locationServices ?? true);
    }
  }, [user]);

  // ... inside ProfileScreen component

  const loadLoyaltyProfile = async () => {
    try {
      const response = await loyaltyService.getProfile();
      if (response.data) {
        setLoyaltyProfile(response.data);
      }
    } catch (error) {
      console.error('Failed to load loyalty profile', error);
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need access to your photos to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        // Optimistic update
        const updatedUser = { ...user };
        if (updatedUser.profile) {
          updatedUser.profile.avatar = base64Image;
          // @ts-ignore
          useUserStore.getState().setUser(updatedUser);
        }

        Alert.alert('Success', 'Profile picture updated!');

        // TODO: Send to backend
        // await userService.updateAvatar(base64Image); 
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture.');
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need location permission to set your location.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geocode.length > 0) {
        const address = `${geocode[0].city}, ${geocode[0].region}`;

        // Optimistic update
        const updatedUser = { ...user };
        if (updatedUser.profile) {
          updatedUser.profile.location = {
            address,
            coordinates: { latitude, longitude }
          };
          // @ts-ignore
          useUserStore.getState().setUser(updatedUser);
        }

        Alert.alert('Location Updated', `Set to: ${address}`);

        // TODO: Send to backend
        // await userService.updateProfile({ location: { address, coordinates: { latitude, longitude } } });
      }
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to fetch location.');
    }
  };

  const loadClaimedDeals = async () => {
    try {
      setLoadingClaimed(true);
      const { userService } = await import('@/services/api');
      const response = await userService.getClaimedDeals();
      if (response.data) {
        setClaimedDeals(response.data);
      }
    } catch (error) {
      console.error('Failed to load claimed deals', error);
    } finally {
      setLoadingClaimed(false);
    }
  };

  const loadFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const { dealsService } = await import('@/services/api');
      const response = await dealsService.getFavorites();
      if (response.data) {
        setFavoritedDeals(response.data);
      }
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    // TODO: Add API call to update user preferences when backend endpoint is available
    // await authService.updatePreferences({ notifications: value });
  };

  const handleLocationToggle = async (value: boolean) => {
    setLocationEnabled(value);
    // TODO: Add API call to update user preferences when backend endpoint is available
    // await authService.updatePreferences({ locationServices: value });
  };

  const theme = useAppTheme();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const styles = getStyles(theme);
  const { gamification } = useUserStore();

  const { stampCards } = useLoyaltyStore();
  const canAccessLoyaltyCards = canAccessFeature(gamification.xp.current, 'LOYALTY_CARDS');

  const recentActivity = loyaltyProfile?.history.map(h => ({
    id: h._id,
    type: h.type === 'earn' ? 'deal_saved' : 'deal_used',
    title: h.description,
    business: h.source || 'UMA Platform',
    date: new Date(h.createdAt).toLocaleDateString(),
    savings: h.type === 'earn' ? h.amount : 0
  })) || [];

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <ScaleButton key={index} onPress={item.onPress} style={undefined}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
                <item.icon size={20} color={item.iconColor} />
              </View>
              <View>
                <Text style={styles.menuItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <View style={styles.menuItemRight}>
              {item.toggle !== undefined ? (
                <Switch
                  value={item.toggle}
                  onValueChange={item.onToggle}
                  trackColor={{ false: theme.colors.surfaceLight, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              )}
            </View>
          </View>
        </ScaleButton>
      ))}
    </View>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'deal_used': return <Gift size={16} color={theme.colors.primary} />;
        case 'deal_saved': return <Bookmark size={16} color={theme.colors.primary} />;
        case 'business_followed': return <Heart size={16} color={theme.colors.primary} />;
        default: return <Star size={16} color={theme.colors.primary} />;
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>{getActivityIcon()}</View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <View style={styles.activityMetaRow}>
            <Text style={styles.activityBusiness}>{activity.business}</Text>
            <Text style={styles.dotSeparator}>•</Text>
            <Text style={styles.activityDate}>{activity.date}</Text>
          </View>
        </View>
        {activity.savings > 0 && (
          <View style={styles.savingsTag}>
            <Text style={styles.savingsText}>+{activity.savings} pts</Text>
          </View>
        )}
      </View>
    );
  };

  const handleLoyaltyCardsPress = () => {
    if (canAccessLoyaltyCards) {
      router.push('/loyalty');
    } else {
      Alert.alert(
        'Feature Locked',
        'Unlock Loyalty Cards at Silver I rank (750 XP). Complete missions to earn XP!',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'View Missions', onPress: () => router.push('/(tabs)/missions') },
        ]
      );
    }
  };

  const menuSections = [
    {
      title: 'My Activity',
      items: [
        {
          icon: Award,
          iconBg: 'rgba(243, 156, 18, 0.1)',
          iconColor: '#F39C12',
          title: 'Loyalty Cards',
          subtitle: canAccessLoyaltyCards ? `${stampCards.length} active cards` : '🔒 Unlock at Silver I',
          onPress: handleLoyaltyCardsPress
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, iconBg: 'rgba(0, 217, 163, 0.1)', iconColor: theme.colors.primary, title: 'Push Notifications', subtitle: 'Get deal alerts', toggle: notificationsEnabled, onToggle: handleNotificationToggle },
        { icon: MapPin, iconBg: 'rgba(0, 217, 163, 0.1)', iconColor: theme.colors.primary, title: 'Location Services', subtitle: 'Find nearby deals', toggle: locationEnabled, onToggle: handleLocationToggle },
        { icon: isDarkMode ? Moon : Sun, iconBg: 'rgba(0, 217, 163, 0.1)', iconColor: theme.colors.primary, title: 'Dark Mode', subtitle: 'Toggle app theme', toggle: isDarkMode, onToggle: toggleTheme },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header Section */}
        <FadeInView delay={0}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {user?.profile?.avatar ? (
                    <Image
                      source={{ uri: user.profile.avatar }}
                      style={{ width: '100%', height: '100%', borderRadius: 36 }}
                    />
                  ) : (
                    <User size={32} color={theme.colors.text} strokeWidth={1.5} />
                  )}
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.8}
                  onPress={handleUpdateAvatar}
                >
                  <Edit3 size={12} color={theme.colors.background} />
                </TouchableOpacity>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user?.profile?.name || 'User'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                <TouchableOpacity
                  style={styles.locationContainer}
                  onPress={handleUpdateLocation}
                >
                  <MapPin size={12} color={theme.colors.primary} />
                  <Text style={styles.userLocation}>{user?.profile?.location?.address || 'Set Location'}</Text>
                </TouchableOpacity>

                {/* QR Code Button */}
                <TouchableOpacity
                  style={[styles.locationContainer, { marginTop: 8, backgroundColor: 'rgba(0, 217, 163, 0.15)' }]}
                  onPress={() => router.push('/my-code' as any)}
                >
                  <QrCode size={14} color={theme.colors.primary} />
                  <Text style={[styles.userLocation, { fontSize: 13 }]}>My Code</Text>
                </TouchableOpacity>

                {myArchetype && (
                  <TouchableOpacity
                    style={[styles.locationContainer, { marginTop: 4, backgroundColor: theme.colors.primaryLight }]}
                    onPress={() => router.push('/my-persona')}
                  >
                    <BrainCircuit size={12} color={theme.colors.primary} />
                    <Text style={[styles.userLocation, { color: theme.colors.primary }]}>
                      {ARCHETYPES.find(a => a.id === myArchetype)?.title || 'Explorer'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              {[
                { num: claimedDeals.length, label: 'Claimed' },
                { num: favoritedDeals.length, label: 'Favorites' },
                { num: loyaltyProfile?.points || user?.loyaltyPoints || 0, label: 'Points' }
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stat.num}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>


        {/* Recent Activity */}
        <FadeInView delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity hitSlop={10}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.activityList}>
              {recentActivity.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              {recentActivity.length === 0 && (
                <Text style={{ textAlign: 'center', color: theme.colors.textSecondary }}>No recent activity</Text>
              )}
            </View>
          </View>
        </FadeInView>

        {/* Claimed Deals Section */}
        <FadeInView delay={250}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Claimed Deals</Text>
              <Text style={styles.seeAllText}>{claimedDeals.length} total</Text>
            </View>
            {loadingClaimed ? (
              <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: 20 }}>Loading...</Text>
            ) : claimedDeals.length > 0 ? (
              <View style={styles.dealsGrid}>
                {claimedDeals.slice(0, 4).map((claim: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.claimedDealCard}
                    onPress={() => router.push(`/deal/${claim.deal._id}` as any)}
                  >
                    <View style={styles.dealCardContent}>
                      <Text style={styles.dealCardTitle} numberOfLines={2}>{claim.deal.title}</Text>
                      <Text style={styles.dealCardMerchant} numberOfLines={1}>{claim.deal.merchantId?.name}</Text>
                      <View style={styles.dealCardFooter}>
                        <Text style={styles.dealCardSavings}>Saved ₹{claim.savings}</Text>
                        <View style={[styles.dealCardStatus, claim.status === 'redeemed' ? styles.statusRedeemed : styles.statusPending]}>
                          <Text style={styles.dealCardStatusText}>{claim.status === 'redeemed' ? 'Redeemed' : 'Pending'}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Gift size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No claimed deals yet</Text>
                <Text style={styles.emptyStateSubtext}>Start claiming deals to see them here</Text>
              </View>
            )}
            {claimedDeals.length > 0 && (
              <View style={styles.savingsSummary}>
                <Text style={styles.savingsSummaryLabel}>Total Savings</Text>
                <Text style={styles.savingsSummaryValue}>
                  ₹{claimedDeals.reduce((sum: number, claim: any) => sum + (claim.savings || 0), 0).toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </FadeInView>

        {/* Favorite Deals Section */}
        <FadeInView delay={275}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favorite Deals</Text>
              <Text style={styles.seeAllText}>{favoritedDeals.length} saved</Text>
            </View>
            {loadingFavorites ? (
              <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: 20 }}>Loading...</Text>
            ) : favoritedDeals.length > 0 ? (
              <View style={styles.dealsGrid}>
                {favoritedDeals.slice(0, 4).map((deal: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.favoriteDealCard}
                    onPress={() => router.push(`/deal/${deal._id}` as any)}
                  >
                    <View style={styles.favoriteCardContent}>
                      <View style={styles.favoriteCardHeader}>
                        <View style={styles.discountBadgeSmall}>
                          <Text style={styles.discountBadgeText}>{deal.discountPercentage}% OFF</Text>
                        </View>
                        <Heart size={16} color={theme.colors.primary} fill={theme.colors.primary} />
                      </View>
                      <Text style={styles.dealCardTitle} numberOfLines={2}>{deal.title}</Text>
                      <Text style={styles.dealCardMerchant} numberOfLines={1}>{deal.merchantId?.name}</Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>₹{deal.discountedPrice}</Text>
                        <Text style={styles.originalPriceSmall}>₹{deal.originalPrice}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Heart size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No favorite deals yet</Text>
                <Text style={styles.emptyStateSubtext}>Tap the heart icon on deals to save them</Text>
              </View>
            )}
          </View>
        </FadeInView>

        {/* Menu Sections */}
        <FadeInView delay={300}>
          {menuSections.map((section, index) => (
            <MenuSection key={index} title={section.title} items={section.items} />
          ))}
        </FadeInView>

        {/* Sign Out */}
        <FadeInView delay={400}>
          <ScaleButton onPress={handleLogout} style={undefined}>
            <View style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </ScaleButton>
        </FadeInView>

      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  // ... (keep styles exactly as they were)
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header Styles
  profileHeader: {
    padding: 24,
    paddingTop: 10,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 32, // Softer curve
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.background,
    borderWidth: 3,
    borderColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 163, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  userLocation: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    elevation: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },

  // Ride History Styles
  rideHistoryScroll: {
    paddingHorizontal: 24,
    paddingBottom: 10,
  },
  rideCard: {
    width: 220,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    // Subtle Border for depth
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rideIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideProvider: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  rideStatus: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rideDetails: {
    gap: 0,
    marginBottom: 16,
  },
  rideLine: {
    height: 16,
    width: 1,
    backgroundColor: theme.colors.surfaceLight,
    marginLeft: 5, // Align with icon center
    marginVertical: 2,
  },
  rideLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.textTertiary,
    marginLeft: 2,
  },
  rideAddress: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
  },
  ridePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  rideDate: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    fontWeight: '500',
  },
  emptyState: {
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginTop: 8,
  },

  // List Items (Merchants & Activity)
  merchantsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  merchantIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  merchantEmoji: {
    fontSize: 20,
  },
  merchantName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: 'rgba(255,0,0,0.05)',
    borderRadius: 20,
  },

  // Activity
  activityList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  activityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityBusiness: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dotSeparator: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginHorizontal: 6,
  },
  activityDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  savingsTag: {
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
  },

  // Menus
  menuSection: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  menuSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textTertiary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  menuItemRight: {
    marginLeft: 12,
  },

  // Sign Out
  signOutButton: {
    margin: 24,
    marginTop: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 100, 100, 0.2)',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.error,
  },

  // Deals Grid
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
  },
  claimedDealCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  favoriteDealCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  dealCardContent: {
    gap: 8,
  },
  favoriteCardContent: {
    gap: 8,
  },
  favoriteCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discountBadgeSmall: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeText: {
    color: theme.colors.background,
    fontSize: 10,
    fontWeight: '700',
  },
  dealCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  dealCardMerchant: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dealCardSavings: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.success,
  },
  dealCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  statusRedeemed: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  dealCardStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  originalPriceSmall: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  savingsSummary: {
    marginTop: 16,
    marginHorizontal: 24,
    padding: 16,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  savingsSummaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  savingsSummaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
  },
});
