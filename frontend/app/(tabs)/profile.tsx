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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Heart, Bell, MapPin, Settings, Circle as HelpCircle, Shield, Star, ChevronRight, CreditCard as Edit3, CreditCard, Gift, Bookmark, Share2, TrendingUp, TrendingDown, ArrowDownToLine, Award, Users, Trophy, Zap, Brain, Sparkles, Car } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWalletStore, TransactionType } from '@/store/walletStore';
import { useRideStore } from '@/store/rideStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';

// --- Mock Data ---
const userData = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  location: 'Downtown, City Center',
  memberSince: 'January 2024',
  savedDeals: 12,
  totalSavings: 324,
  favoriteBusinesses: 8,
};

const recentActivity = [
  { id: '1', type: 'deal_used', title: 'Used 50% Off Pizza Deal', business: "Mario's Pizza Palace", date: '2 days ago', savings: 12.5 },
  { id: '2', type: 'deal_saved', title: 'Saved Spa Service Deal', business: 'Serenity Wellness Spa', date: '1 week ago', savings: 0 },
  { id: '3', type: 'business_followed', title: 'Followed Urban Brew Cafe', business: 'Urban Brew Cafe', date: '2 weeks ago', savings: 0 },
];

// --- Micro-Animation Components ---

// 1. Scale Button for Press Feedback
const ScaleButton = ({ children, onPress, style, activeOpacity = 0.9 }) => {
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
const FadeInView = ({ children, delay = 0 }) => {
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [favoriteMerchants, setFavoriteMerchants] = useState(['Mario\'s Pizza Palace', 'Urban Brew Cafe']);

  const { rideHistory } = useRideStore();
  const { stampCards, totalStampsEarned } = useLoyaltyStore();

  const toggleFavoriteMerchant = (merchant) => {
    setFavoriteMerchants(prev =>
      prev.includes(merchant) ? prev.filter(m => m !== merchant) : [...prev, merchant]
    );
  };

  const MenuSection = ({ title, items }) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <ScaleButton key={index} onPress={item.onPress}>
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

  const ActivityItem = ({ activity }) => {
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
            <Text style={styles.savingsText}>+${activity.savings}</Text>
          </View>
        )}
      </View>
    );
  };

  const menuSections = [
    {
      title: 'AI & Personalization',
      items: [
        { icon: Brain, iconBg: 'rgba(139, 92, 246, 0.1)', iconColor: '#8B5CF6', title: 'AI Profile', subtitle: 'Your personality & insights', onPress: () => router.push('/ai-profile') },
        { icon: Sparkles, iconBg: 'rgba(139, 92, 246, 0.1)', iconColor: '#8B5CF6', title: 'AI Recommendations', subtitle: 'Personalized for you', onPress: () => router.push('/ai-recommendations') },
      ],
    },
    {
      title: 'Coupons & Savings',
      items: [
        { icon: Gift, iconBg: 'rgba(245, 158, 11, 0.1)', iconColor: '#F59C0B', title: 'Coupon Discovery', subtitle: 'Find viral deals', onPress: () => router.push('/coupon-discovery') },
        { icon: Trophy, iconBg: 'rgba(16, 185, 129, 0.1)', iconColor: '#10B981', title: 'Savings Dashboard', subtitle: 'Track achievements', onPress: () => router.push('/savings-dashboard') },
      ],
    },
    {
      title: 'My Activity',
      items: [
        { icon: Award, iconBg: 'rgba(243, 156, 18, 0.1)', iconColor: '#F39C12', title: 'Loyalty Cards', subtitle: `${stampCards.length} active cards`, onPress: () => router.push('/loyalty') },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, iconBg: 'rgba(0, 217, 163, 0.1)', iconColor: theme.colors.primary, title: 'Push Notifications', subtitle: 'Get deal alerts', toggle: notificationsEnabled, onToggle: setNotificationsEnabled },
        { icon: MapPin, iconBg: 'rgba(0, 217, 163, 0.1)', iconColor: theme.colors.primary, title: 'Location Services', subtitle: 'Find nearby deals', toggle: locationEnabled, onToggle: setLocationEnabled },
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
                  <User size={32} color={theme.colors.text} strokeWidth={1.5} />
                </View>
                <TouchableOpacity style={styles.editButton} activeOpacity={0.8}>
                  <Edit3 size={12} color={theme.colors.background} />
                </TouchableOpacity>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{userData.name}</Text>
                <Text style={styles.userEmail}>{userData.email}</Text>
                <View style={styles.locationContainer}>
                  <MapPin size={12} color={theme.colors.primary} />
                  <Text style={styles.userLocation}>{userData.location}</Text>
                </View>
              </View>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              {[
                { num: userData.savedDeals, label: 'Deals' },
                { num: rideHistory.length, label: 'Rides' },
                { num: `₹${userData.totalSavings}`, label: 'Saved' },
                { num: favoriteMerchants.length, label: 'Favs' }
              ].map((stat, i) => (
                <View key={i} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stat.num}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* Ride History */}
        <FadeInView delay={100}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ride History</Text>
              <TouchableOpacity hitSlop={10}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rideHistoryScroll}>
              {rideHistory.length > 0 ? (
                rideHistory.slice(-5).reverse().map(ride => (
                  <ScaleButton key={ride.id} style={{ marginRight: 12 }}>
                    <View style={styles.rideCard}>
                      <View style={styles.rideHeader}>
                        <View style={styles.rideIconBg}>
                          <Text style={{ fontSize: 20 }}>{ride.type === 'auto' ? '🛺' : ride.type === 'bus' ? '🚌' : '🚗'}</Text>
                        </View>
                        <View style={styles.rideInfo}>
                          <Text style={styles.rideProvider}>{ride.providerName}</Text>
                          <Text style={styles.rideStatus}>{ride.status}</Text>
                        </View>
                      </View>
                      <View style={styles.rideDetails}>
                        <View style={styles.rideLocation}>
                          <View style={styles.dot} />
                          <Text style={styles.rideAddress} numberOfLines={1}>{ride.pickup.address}</Text>
                        </View>
                        <View style={styles.rideLine} />
                        <View style={styles.rideLocation}>
                          <MapPin size={10} color={theme.colors.primary} />
                          <Text style={styles.rideAddress} numberOfLines={1}>{ride.destination.address}</Text>
                        </View>
                      </View>
                      <View style={styles.rideFooter}>
                        <Text style={styles.ridePrice}>₹{ride.price}</Text>
                        <Text style={styles.rideDate}>{new Date(ride.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                      </View>
                    </View>
                  </ScaleButton>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Car size={28} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyText}>No rides yet</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Favorite Merchants */}
        <FadeInView delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Favorite Merchants</Text>
              <TouchableOpacity hitSlop={10}>
                <Text style={styles.seeAllText}>Manage</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.merchantsList}>
              {favoriteMerchants.map((merchant, index) => (
                <View key={index} style={styles.merchantCard}>
                  <View style={styles.merchantIcon}>
                    <Text style={styles.merchantEmoji}>🏪</Text>
                  </View>
                  <Text style={styles.merchantName} numberOfLines={1}>{merchant}</Text>
                  <TouchableOpacity
                    onPress={() => toggleFavoriteMerchant(merchant)}
                    style={styles.favoriteButton}
                    hitSlop={10}
                  >
                    <Heart size={18} color={theme.colors.error} fill={theme.colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </FadeInView>

        {/* Recent Activity */}
        <FadeInView delay={300}>
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
            </View>
          </View>
        </FadeInView>

        {/* Menu Sections */}
        <FadeInView delay={400}>
          {menuSections.map((section, index) => (
            <MenuSection key={index} title={section.title} items={section.items} />
          ))}
        </FadeInView>

        {/* Sign Out */}
        <FadeInView delay={500}>
          <ScaleButton onPress={() => { }}>
            <View style={styles.signOutButton}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </View>
          </ScaleButton>
        </FadeInView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    borderColor: 'rgba(255,255,255,0.05)',
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
});