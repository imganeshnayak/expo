import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import {
  User,
  Store,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Clock,
  CreditCard,
  HelpCircle,
  Shield,
  Globe,
  Moon,
  Smartphone,
  Mail,
  LucideIcon,
  Sun,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import BusinessProfileEditModal from './business-profile-edit-modal';

type MenuItem = {
  icon: LucideIcon;
  label: string;
  action: () => void;
  badge?: string | null;
  hasSwitch?: boolean;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
};

import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const theme = useAppTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const merchant = {
    name: user?.businessName || '',
    businessType: user?.businessType || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    businessHours: {
      weekdays: user?.businessHours?.weekdays || '9:00 AM - 6:00 PM',
      weekends: user?.businessHours?.weekends || '10:00 AM - 4:00 PM',
    },
    paymentMethods: user?.paymentMethods || ['Cash', 'UPI'],
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Business',
      items: [
        { icon: Store, label: 'Business Information', action: () => setIsEditModalVisible(true), badge: null },
        { icon: CreditCard, label: 'Redeem Deal', action: () => router.push('/qr-scanner' as any), badge: null },
      ],
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Details', action: () => Alert.alert('Coming Soon', 'This feature is under development.'), badge: null },
        { icon: Shield, label: 'Privacy & Security', action: () => Alert.alert('Coming Soon', 'This feature is under development.'), badge: null },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', action: () => { }, badge: null, hasSwitch: true, value: notificationsEnabled, onValueChange: setNotificationsEnabled },
        { icon: Mail, label: 'Email Notifications', action: () => { }, badge: null, hasSwitch: true, value: emailNotifications, onValueChange: setEmailNotifications },
        {
          icon: theme.isDark ? Moon : Sun,
          label: theme.isDark ? 'Dark Mode' : 'Light Mode',
          action: () => theme.toggleMode(),
          badge: null,
          hasSwitch: true,
          value: theme.isDark,
          onValueChange: () => theme.toggleMode()
        },
        {
          icon: Globe, label: 'Language', action: () => Alert.alert(
            'Select Language',
            'Choose your preferred language for Nova AI and the app.',
            [
              { text: 'English', onPress: () => Alert.alert('Language Set', 'English selected. Nova AI will now respond in English.') },
              { text: 'हिन्दी (Hindi)', onPress: () => Alert.alert('भाषा सेट', 'हिंदी चुनी गई। नोवा AI अब हिंदी में जवाब देगा।') },
              { text: 'தமிழ் (Tamil)', onPress: () => Alert.alert('மொழி அமை', 'தமிழ் தேர்ந்தெடுக்கப்பட்டது।') },
              { text: 'తెలుగు (Telugu)', onPress: () => Alert.alert('భాష సెట్', 'తెలుగు ఎంపిక చేయబడింది।') },
              { text: 'More Languages...', onPress: () => Alert.alert('Available Languages', '• English\n• हिन्दी (Hindi)\n• தமிழ் (Tamil)\n• తెలుగు (Telugu)\n• বাংলা (Bengali)\n• मराठी (Marathi)\n• ગુજરાતી (Gujarati)\n• ಕನ್ನಡ (Kannada)\n• മലയാളം (Malayalam)\n• ਪੰਜਾਬੀ (Punjabi)\n\nTip: Use Nova AI tab to chat in any of these languages!') },
              { text: 'Cancel', style: 'cancel' },
            ]
          ), badge: 'English'
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', action: () => Alert.alert('Coming Soon', 'This feature is under development.'), badge: null },
        { icon: Smartphone, label: 'App Version', action: () => Alert.alert('App Version', 'v1.0.0'), badge: 'v1.0.0' },
      ],
    },
  ];

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Contact Information</Text>
          <View style={styles.infoRow}>
            <Mail size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{merchant.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Smartphone size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{merchant.phone}</Text>
          </View>
          <View style={styles.infoRow}>
            <Store size={16} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{merchant.address}</Text>
          </View>
        </View>

        {/* Business Hours */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Business Hours</Text>
          <View style={styles.infoRow}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoText}>Mon-Fri: {merchant.businessHours.weekdays}</Text>
              <Text style={[styles.infoText, { marginTop: 4 }]}>Sat-Sun: {merchant.businessHours.weekends}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Accepted Payment Methods</Text>
          <View style={styles.paymentMethods}>
            {merchant.paymentMethods.map((method, index) => (
              <View key={index} style={styles.paymentBadge}>
                <CreditCard size={14} color={theme.colors.primary} />
                <Text style={styles.paymentText}>{method}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={item.action}
                    style={[
                      styles.menuItem,
                      itemIndex < section.items.length - 1 && styles.menuItemBorder,
                    ]}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={styles.iconContainer}>
                        <Icon color={theme.colors.primary} size={20} />
                      </View>
                      <Text style={styles.menuItemLabel}>{item.label}</Text>
                    </View>
                    <View style={styles.menuItemRight}>
                      {item.hasSwitch ? (
                        <Switch
                          value={item.value}
                          onValueChange={item.onValueChange}
                          trackColor={{ false: theme.colors.surfaceLight, true: `${theme.colors.primary}60` }}
                          thumbColor={item.value ? theme.colors.primary : theme.colors.textTertiary}
                        />
                      ) : (
                        <>
                          {item.badge && (
                            <Text style={styles.badge}>{item.badge}</Text>
                          )}
                          <ChevronRight color={theme.colors.textTertiary} size={20} />
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#E74C3C" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Modal */}
      <BusinessProfileEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginHorizontal: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E74C3C',
  },
});
