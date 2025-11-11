import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Heart, Bell, MapPin, Settings, Circle as HelpCircle, Shield, Star, ChevronRight, CreditCard as Edit3, Gift, Bookmark, Share2 } from 'lucide-react-native';
import { theme } from '@/constants/theme';

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
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const MenuSection = ({ title, items }: { title: string; items: any[] }) => (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem}>
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
      title: 'My Activity',
      items: [
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
          subtitle: `${userData.favoriteBusinesses} businesses`,
        },
        {
          icon: Gift,
          iconBg: 'rgba(0, 217, 163, 0.1)',
          iconColor: theme.colors.primary,
          title: 'Total Savings',
          subtitle: `$${userData.totalSavings} saved`,
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
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>${userData.totalSavings}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userData.favoriteBusinesses}</Text>
              <Text style={styles.statLabel}>Favorites</Text>
            </View>
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
});