import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Modal,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Heart, Bell, MapPin, Settings, Circle as HelpCircle, Shield, Star, ChevronRight, CreditCard as Edit3, CreditCard, Gift, Bookmark, Share2, Wallet, Plus, ArrowDownToLine, TrendingUp, TrendingDown, X, Award, Users, Trophy, Zap, Brain, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWalletStore, TransactionType } from '@/store/walletStore';
import { useRideStore } from '@/store/rideStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';

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
  {
    id: '1',
    type: 'deal_used',
    title: 'Used 50% Off Pizza Deal',
    business: "Mario's Pizza Palace",
    date: '2 days ago',
    savings: 12.5,
  },
  {
    id: '2',
    type: 'deal_saved',
    title: 'Saved Spa Service Deal',
    business: 'Serenity Wellness Spa',
    date: '1 week ago',
    savings: 0,
  },
  {
    id: '3',
    type: 'business_followed',
    title: 'Followed Urban Brew Cafe',
    business: 'Urban Brew Cafe',
    date: '2 weeks ago',
    savings: 0,
  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [favoriteMerchants, setFavoriteMerchants] = useState<string[]>(['Mario\'s Pizza Palace', 'Urban Brew Cafe']);
  
  const { balance, transactions, addMoney, withdraw } = useWalletStore();
  const { rideHistory } = useRideStore();
  const { stampCards, totalStampsEarned, totalRewardsRedeemed } = useLoyaltyStore();

  const handleAddMoney = () => {
    const value = parseFloat(amount);
    if (value && value > 0) {
      addMoney(value);
      setAmount('');
      setShowAddMoney(false);
      Alert.alert('Success', `₹${value} added to your wallet!`);
    }
  };

  const handleWithdraw = () => {
    const value = parseFloat(amount);
    if (value && value > 0) {
      if (value <= balance) {
        withdraw(value);
        setAmount('');
        setShowWithdraw(false);
        Alert.alert('Success', `₹${value} withdrawn to your bank!`);
      } else {
        Alert.alert('Error', 'Insufficient balance');
      }
    }
  };

  const toggleFavoriteMerchant = (merchant: string) => {
    setFavoriteMerchants(prev =>
      prev.includes(merchant)
        ? prev.filter(m => m !== merchant)
        : [...prev, merchant]
    );
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'CASHBACK':
        return theme.colors.success;
      case 'RIDE_PAYMENT':
        return theme.colors.error;
      case 'WALLET_TOPUP':
        return '#45B7D1';
      case 'WITHDRAWAL':
        return '#F7B731';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'CASHBACK':
        return Gift;
      case 'RIDE_PAYMENT':
        return TrendingDown;
      case 'WALLET_TOPUP':
        return TrendingUp;
      case 'WITHDRAWAL':
        return ArrowDownToLine;
      default:
        return Gift;
    }
  };

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity 
          key={index} 
          style={styles.menuItem}
          onPress={item.onPress}
          activeOpacity={item.onPress ? 0.7 : 1}>
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
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const ActivityItem = ({ activity }: { activity: typeof recentActivity[0] }) => {
    const getActivityIcon = () => {
      switch (activity.type) {
        case 'deal_used':
          return <Gift size={16} color={theme.colors.primary} />;
        case 'deal_saved':
          return <Bookmark size={16} color={theme.colors.primary} />;
        case 'business_followed':
          return <Heart size={16} color={theme.colors.primary} />;
        default:
          return <Star size={16} color={theme.colors.primary} />;
      }
    };

    return (
      <View style={styles.activityItem}>
        <View style={styles.activityIcon}>
          {getActivityIcon()}
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityBusiness}>{activity.business}</Text>
          <Text style={styles.activityDate}>{activity.date}</Text>
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
        {
          icon: Brain,
          iconBg: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8B5CF6',
          title: 'AI Profile',
          subtitle: 'Your personality & insights',
          onPress: () => router.push('/ai-profile'),
        },
        {
          icon: Sparkles,
          iconBg: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8B5CF6',
          title: 'AI Recommendations',
          subtitle: 'Personalized for you',
          onPress: () => router.push('/ai-recommendations'),
        },
      ],
    },
    {
      title: 'Coupons & Savings',
      items: [
        {
          icon: Gift,
          iconBg: 'rgba(245, 158, 11, 0.1)',
          iconColor: '#F59C0B',
          title: 'Coupon Discovery',
          subtitle: 'Find viral deals & stack coupons',
          onPress: () => router.push('/coupon-discovery'),
        },
        {
          icon: Trophy,
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10B981',
          title: 'Savings Dashboard',
          subtitle: 'Track your savings & achievements',
          onPress: () => router.push('/savings-dashboard'),
        },
      ],
    },
    {
      title: 'Social & Friends',
      items: [
        {
          icon: Users,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Social Hub',
          subtitle: 'Friends, feed, and groups',
          onPress: () => router.push('/social'),
        },
        {
          icon: Trophy,
          iconBg: 'rgba(245, 158, 11, 0.1)',
          iconColor: '#F59C0B',
          title: 'Leaderboard',
          subtitle: 'Compete with friends',
          onPress: () => router.push('/leaderboard'),
        },
        {
          icon: Gift,
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10B981',
          title: 'Refer & Earn',
          subtitle: 'Invite friends, earn ₹100 each',
          onPress: () => router.push('/referral'),
        },
        {
          icon: Zap,
          iconBg: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8B5CF6',
          title: 'Groups',
          subtitle: 'Plan together, save more',
          onPress: () => router.push('/groups'),
        },
      ],
    },
    {
      title: 'My Activity',
      items: [
        {
          icon: Award,
          iconBg: 'rgba(243, 156, 18, 0.1)',
          iconColor: '#F39C12',
          title: 'Loyalty Cards',
          subtitle: `${stampCards.length} active cards, ${totalStampsEarned} stamps earned`,
          onPress: () => router.push('/loyalty'),
        },
        {
          icon: CreditCard,
          iconBg: 'rgba(139, 92, 246, 0.1)',
          iconColor: '#8B5CF6',
          title: 'Universal Loyalty',
          subtitle: 'Manage all your loyalty programs',
          onPress: () => router.push('/universal-loyalty'),
        },
        {
          icon: Heart,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Saved Deals',
          subtitle: `${userData.savedDeals} deals saved`,
        },
        {
          icon: Bookmark,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Favorite Businesses',
          subtitle: `${favoriteMerchants.length} businesses`,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Push Notifications',
          subtitle: 'Get deal alerts',
          toggle: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: MapPin,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Location Services',
          subtitle: 'Find nearby deals',
          toggle: locationEnabled,
          onToggle: setLocationEnabled,
        },
        {
          icon: Settings,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'App Settings',
          subtitle: 'Customize your experience',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Help & Support',
          subtitle: 'FAQs and contact',
        },
        {
          icon: Shield,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Privacy & Security',
          subtitle: 'Manage your data',
        },
        {
          icon: Share2,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Share App',
          subtitle: 'Invite friends',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color={theme.colors.text} />
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Edit3 size={14} color={theme.colors.background} />
              </TouchableOpacity>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userEmail}>{userData.email}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color={theme.colors.primary} />
                <Text style={styles.userLocation}>{userData.location}</Text>
              </View>
              <Text style={styles.memberSince}>
                Member since {userData.memberSince}
              </Text>
            </View>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.savedDeals}</Text>
              <Text style={styles.statLabel}>Deals</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{rideHistory.length}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>₹{userData.totalSavings}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{favoriteMerchants.length}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
          </View>
        </View>

        {/* Ride History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ride History</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rideHistoryScroll}>
            {rideHistory.length > 0 ? (
              rideHistory.slice(-5).reverse().map(ride => (
                <View key={ride.id} style={styles.rideCard}>
                  <View style={styles.rideHeader}>
                    <Text style={styles.rideLogo}>{ride.type === 'auto' ? '🛺' : ride.type === 'bus' ? '🚌' : '🚗'}</Text>
                    <View style={styles.rideInfo}>
                      <Text style={styles.rideProvider}>{ride.providerName}</Text>
                      <Text style={styles.rideStatus}>{ride.status}</Text>
                    </View>
                  </View>
                  <View style={styles.rideDetails}>
                    <View style={styles.rideLocation}>
                      <MapPin size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.rideAddress} numberOfLines={1}>{ride.pickup.address}</Text>
                    </View>
                    <View style={styles.rideLocation}>
                      <MapPin size={12} color={theme.colors.primary} />
                      <Text style={styles.rideAddress} numberOfLines={1}>{ride.destination.address}</Text>
                    </View>
                  </View>
                  <View style={styles.rideFooter}>
                    <Text style={styles.ridePrice}>₹{ride.price}</Text>
                    <Text style={styles.rideDate}>
                      {new Date(ride.bookedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Car size={32} color={theme.colors.textTertiary} />
                <Text style={styles.emptyText}>No rides yet</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Favorite Merchants */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Merchants</Text>
            <TouchableOpacity>
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
                  style={styles.favoriteButton}>
                  <Heart 
                    size={16} 
                    color={theme.colors.error} 
                    fill={theme.colors.error}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityList}>
            {recentActivity.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, index) => (
          <MenuSection
            key={index}
            title={section.title}
            items={section.items}
          />
        ))}

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    padding: 20,
    paddingBottom: 24,
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  userLocation: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  memberSince: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '400',
    color: theme.colors.primary,
  },
  activityList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  activityBusiness: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  activityDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  savingsTag: {
    backgroundColor: 'rgba(0, 217, 163, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  menuSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  menuItemRight: {
    marginLeft: 12,
  },
  signOutButton: {
    margin: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.error,
  },
  rideHistoryScroll: {
    paddingHorizontal: 20,
  },
  rideCard: {
    width: 200,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rideLogo: {
    fontSize: 24,
    marginRight: 8,
  },
  rideInfo: {
    flex: 1,
  },
  rideProvider: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  rideStatus: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  rideDetails: {
    gap: 6,
    marginBottom: 12,
  },
  rideLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    fontWeight: '600',
    color: theme.colors.primary,
  },
  rideDate: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 60,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    marginTop: 8,
  },
  merchantsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  merchantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  merchantIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantEmoji: {
    fontSize: 20,
  },
  merchantName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  favoriteButton: {
    padding: 8,
  },
});