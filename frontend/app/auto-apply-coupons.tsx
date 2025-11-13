import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useAutoApplyCouponStore,
  AutoApplyAttempt,
  MerchantIntegration,
  MerchantCategory,
} from '../store/autoApplyCouponStore';
import { theme } from '../constants/theme';

const primaryColor = theme.colors.primary;

export default function AutoApplyCouponsScreen() {
  const router = useRouter();
  const {
    preferences,
    merchantIntegrations,
    attemptHistory,
    successMetrics,
    updatePreferences,
    toggleAutoApply,
    blockMerchant,
    unblockMerchant,
    getTotalSavings,
    getSuccessRateOverall,
    getMostSuccessfulMerchants,
    getRecentAttempts,
    getSupportedMerchants,
    autoApplyCoupon,
    tryMultipleCoupons,
  } = useAutoApplyCouponStore();

  const [selectedCategory, setSelectedCategory] = useState<MerchantCategory | 'all'>('all');
  const [isApplying, setIsApplying] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const totalSavings = getTotalSavings();
  const successRate = getSuccessRateOverall();
  const recentAttempts = getRecentAttempts(10);
  const topMerchants = getMostSuccessfulMerchants(5);

  const categories: { value: MerchantCategory | 'all'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'grid-outline' },
    { value: 'food_delivery', label: 'Food', icon: 'fast-food-outline' },
    { value: 'ecommerce', label: 'Shopping', icon: 'cart-outline' },
    { value: 'travel', label: 'Travel', icon: 'airplane-outline' },
    { value: 'entertainment', label: 'Entertainment', icon: 'film-outline' },
    { value: 'grocery', label: 'Grocery', icon: 'basket-outline' },
  ];

  const filteredMerchants = selectedCategory === 'all'
    ? getSupportedMerchants()
    : getSupportedMerchants(selectedCategory);

  const handleTestAutoApply = async (merchantId: string) => {
    setIsApplying(true);
    try {
      const attempt = await autoApplyCoupon(merchantId, 500);
      
      if (attempt.status === 'success') {
        Alert.alert(
          'Success! 🎉',
          `Coupon auto-applied!\nSaved ₹${attempt.savings.toFixed(2)}`,
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Auto-Apply Failed',
          attempt.errorMessage || 'Could not apply coupon automatically',
          [{ text: 'OK', style: 'cancel' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsApplying(false);
    }
  };

  const handleTryMultiple = async (merchantId: string) => {
    setIsApplying(true);
    try {
      const attempts = await tryMultipleCoupons(merchantId, 500);
      const bestAttempt = attempts.reduce((best, current) => 
        current.savings > best.savings ? current : best
      );
      
      if (bestAttempt.status === 'success') {
        Alert.alert(
          'Best Coupon Applied! 🎉',
          `Tried ${attempts.length} coupons\nBest savings: ₹${bestAttempt.savings.toFixed(2)}\nCode: ${bestAttempt.couponCode}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to test multiple coupons');
    } finally {
      setIsApplying(false);
    }
  };

  const getStatusColor = (status: AutoApplyAttempt['status']) => {
    switch (status) {
      case 'success': return theme.colors.success;
      case 'failed': return theme.colors.error;
      case 'applying': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: AutoApplyAttempt['status']) => {
    switch (status) {
      case 'success': return 'checkmark-circle';
      case 'failed': return 'close-circle';
      case 'applying': return 'time';
      default: return 'help-circle';
    }
  };

  const getCategoryIcon = (category: MerchantCategory): string => {
    const icons: Record<MerchantCategory, string> = {
      food_delivery: 'fast-food',
      ecommerce: 'cart',
      travel: 'airplane',
      entertainment: 'film',
      services: 'construct',
      grocery: 'basket',
    };
    return icons[category];
  };

  if (showSettings) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowSettings(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Auto-Apply Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Master Toggle */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Enable Auto-Apply</Text>
                <Text style={styles.settingDescription}>
                  Automatically apply best coupons at checkout
                </Text>
              </View>
              <Switch
                value={preferences.enabled}
                onValueChange={toggleAutoApply}
                trackColor={{ false: '#ccc', true: primaryColor }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.settingCard}>
            <Text style={styles.settingHeader}>Preferences</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Require Confirmation</Text>
                <Text style={styles.settingDescription}>
                  Ask before applying coupons
                </Text>
              </View>
              <Switch
                value={preferences.requireConfirmation}
                onValueChange={(value) => updatePreferences({ requireConfirmation: value })}
                trackColor={{ false: '#ccc', true: primaryColor }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Try Multiple Coupons</Text>
                <Text style={styles.settingDescription}>
                  Test multiple coupons to find best savings
                </Text>
              </View>
              <Switch
                value={preferences.autoTryMultipleCoupons}
                onValueChange={(value) => updatePreferences({ autoTryMultipleCoupons: value })}
                trackColor={{ false: '#ccc', true: primaryColor }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>Success Notifications</Text>
                <Text style={styles.settingDescription}>
                  Notify when coupons are applied
                </Text>
              </View>
              <Switch
                value={preferences.notifyOnSuccess}
                onValueChange={(value) => updatePreferences({ notifyOnSuccess: value })}
                trackColor={{ false: '#ccc', true: primaryColor }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Limits */}
          <View style={styles.settingCard}>
            <Text style={styles.settingHeader}>Limits</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Max Attempts Per Session</Text>
              <Text style={styles.settingValue}>{preferences.maxApplicationsPerSession}</Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={styles.settingTitle}>Minimum Savings Threshold</Text>
              <Text style={styles.settingValue}>₹{preferences.savingsThreshold}</Text>
            </View>
          </View>

          {/* Blocked Merchants */}
          {preferences.blockedMerchants.length > 0 && (
            <View style={styles.settingCard}>
              <Text style={styles.settingHeader}>Blocked Merchants</Text>
              {preferences.blockedMerchants.map((merchantId) => {
                const merchant = merchantIntegrations.find(m => m.id === merchantId);
                return (
                  <View key={merchantId} style={styles.blockedMerchant}>
                    <Text style={styles.blockedMerchantName}>{merchant?.merchantName || merchantId}</Text>
                    <TouchableOpacity onPress={() => unblockMerchant(merchantId)}>
                      <Text style={[styles.unblockButton, { color: primaryColor }]}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Auto-Apply Coupons</Text>
        <TouchableOpacity onPress={() => setShowSettings(true)}>
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: preferences.enabled ? '#E8F5E9' : '#FFF3E0' }]}>
          <Ionicons 
            name={preferences.enabled ? 'checkmark-circle' : 'information-circle'} 
            size={24} 
            color={preferences.enabled ? theme.colors.success : theme.colors.warning} 
          />
          <View style={styles.statusText}>
            <Text style={styles.statusTitle}>
              {preferences.enabled ? 'Auto-Apply Active ✨' : 'Auto-Apply Disabled'}
            </Text>
            <Text style={styles.statusDescription}>
              {preferences.enabled 
                ? 'Coupons will be automatically applied at checkout'
                : 'Enable auto-apply in settings to save automatically'
              }
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="wallet-outline" size={28} color={primaryColor} />
            <Text style={styles.statValue}>₹{totalSavings.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Saved</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={28} color={theme.colors.success} />
            <Text style={styles.statValue}>{(successRate * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="flash-outline" size={28} color={theme.colors.warning} />
            <Text style={styles.statValue}>{attemptHistory.length}</Text>
            <Text style={styles.statLabel}>Auto-Applied</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.value && { backgroundColor: primaryColor },
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Ionicons 
                  name={cat.icon as any} 
                  size={18} 
                  color={selectedCategory === cat.value ? '#fff' : theme.colors.textSecondary} 
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.value && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Supported Merchants */}
        <View style={styles.merchantsSection}>
          <Text style={styles.sectionTitle}>Supported Merchants</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredMerchants.length} merchants support auto-apply
          </Text>

          {filteredMerchants.map((merchant) => {
            const isBlocked = preferences.blockedMerchants.includes(merchant.id);
            const metric = successMetrics.find(m => m.merchantId === merchant.id);

            return (
              <View key={merchant.id} style={styles.merchantCard}>
                <View style={styles.merchantHeader}>
                  <View style={styles.merchantIcon}>
                    <Ionicons 
                      name={getCategoryIcon(merchant.category) as any} 
                      size={24} 
                      color={primaryColor} 
                    />
                  </View>
                  <View style={styles.merchantInfo}>
                    <Text style={styles.merchantName}>{merchant.merchantName}</Text>
                    <View style={styles.merchantMeta}>
                      <Text style={styles.merchantCategory}>{merchant.category.replace('_', ' ')}</Text>
                      {merchant.activeCoupons.length > 0 && (
                        <>
                          <Text style={styles.metaDivider}>•</Text>
                          <Text style={styles.couponCount}>{merchant.activeCoupons.length} coupons</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* Merchant Stats */}
                {metric && (
                  <View style={styles.merchantStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemValue}>{(metric.successRate * 100).toFixed(0)}%</Text>
                      <Text style={styles.statItemLabel}>Success</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemValue}>₹{metric.totalSavings.toFixed(0)}</Text>
                      <Text style={styles.statItemLabel}>Saved</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statItemValue}>{metric.totalAttempts}</Text>
                      <Text style={styles.statItemLabel}>Applied</Text>
                    </View>
                  </View>
                )}

                {/* Integration Methods */}
                <View style={styles.methodsRow}>
                  {merchant.supportedMethods.map((method) => (
                    <View key={method} style={styles.methodBadge}>
                      <Ionicons 
                        name={
                          method === 'browser_extension' ? 'globe-outline' :
                          method === 'deep_linking' ? 'link-outline' :
                          method === 'partner_api' ? 'server-outline' :
                          'create-outline'
                        } 
                        size={12} 
                        color={primaryColor} 
                      />
                      <Text style={[styles.methodText, { color: primaryColor }]}>
                        {method.replace('_', ' ')}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={styles.merchantActions}>
                  <TouchableOpacity
                    style={[styles.testButton, { backgroundColor: primaryColor }]}
                    onPress={() => handleTestAutoApply(merchant.id)}
                    disabled={isApplying || isBlocked}
                  >
                    {isApplying ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="flash" size={16} color="#fff" />
                        <Text style={styles.testButtonText}>Test Auto-Apply</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {preferences.autoTryMultipleCoupons && (
                    <TouchableOpacity
                      style={styles.multiTestButton}
                      onPress={() => handleTryMultiple(merchant.id)}
                      disabled={isApplying || isBlocked}
                    >
                      <Ionicons name="layers" size={16} color={primaryColor} />
                      <Text style={[styles.multiTestButtonText, { color: primaryColor }]}>
                        Try All
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.blockButton}
                    onPress={() => isBlocked ? unblockMerchant(merchant.id) : blockMerchant(merchant.id)}
                  >
                    <Ionicons 
                      name={isBlocked ? 'checkmark-circle' : 'ban'} 
                      size={16} 
                      color={isBlocked ? theme.colors.success : theme.colors.error} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        {/* Recent Activity */}
        {recentAttempts.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Auto-Apply Activity</Text>
            {recentAttempts.map((attempt) => (
              <View key={attempt.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Ionicons 
                    name={getStatusIcon(attempt.status) as any} 
                    size={20} 
                    color={getStatusColor(attempt.status)} 
                  />
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityMerchant}>{attempt.merchantName}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(attempt.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  {attempt.status === 'success' && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsText}>-₹{attempt.savings.toFixed(0)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.activityDetails}>
                  <View style={styles.activityDetail}>
                    <Text style={styles.detailLabel}>Code:</Text>
                    <Text style={styles.detailValue}>{attempt.couponCode}</Text>
                  </View>
                  <View style={styles.activityDetail}>
                    <Text style={styles.detailLabel}>Method:</Text>
                    <Text style={styles.detailValue}>{attempt.method.replace('_', ' ')}</Text>
                  </View>
                  {attempt.attemptDuration > 0 && (
                    <View style={styles.activityDetail}>
                      <Text style={styles.detailLabel}>Time:</Text>
                      <Text style={styles.detailValue}>{(attempt.attemptDuration / 1000).toFixed(1)}s</Text>
                    </View>
                  )}
                </View>

                {attempt.errorMessage && (
                  <Text style={styles.errorMessage}>{attempt.errorMessage}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Top Performers */}
        {topMerchants.length > 0 && (
          <View style={styles.topPerformersSection}>
            <Text style={styles.sectionTitle}>Top Performing Merchants</Text>
            {topMerchants.map((metric, index) => (
              <View key={metric.merchantId} style={styles.topPerformerCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.performerInfo}>
                  <Text style={styles.performerName}>{metric.merchantName}</Text>
                  <Text style={styles.performerStats}>
                    {metric.totalAttempts} applications • ₹{metric.totalSavings.toFixed(0)} saved
                  </Text>
                </View>
                <View style={styles.performerBadge}>
                  <Text style={styles.performerRate}>{(metric.successRate * 100).toFixed(0)}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  statusText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  statusTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  categorySection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  categoryScroll: {
    paddingLeft: theme.spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceLight,
    marginRight: theme.spacing.sm,
  },
  categoryLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  categoryLabelActive: {
    color: '#fff',
    fontWeight: theme.fontWeight.semibold as any,
  },
  merchantsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  merchantCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  merchantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  merchantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
    marginBottom: 4,
  },
  merchantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  merchantCategory: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
  metaDivider: {
    marginHorizontal: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  couponCount: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  merchantStats: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
    marginBottom: theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statItemValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text,
  },
  statItemLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  methodsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceLight,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  methodText: {
    fontSize: theme.fontSize.xs,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  merchantActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
  },
  testButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    marginLeft: theme.spacing.xs,
  },
  multiTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: primaryColor,
    marginRight: theme.spacing.sm,
  },
  multiTestButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    marginLeft: theme.spacing.xs,
  },
  blockButton: {
    padding: theme.spacing.sm,
  },
  activitySection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  activityInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  activityMerchant: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
  },
  activityTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  savingsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.success,
  },
  activityDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  activityDetail: {
    flexDirection: 'row',
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginRight: 4,
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.medium as any,
  },
  errorMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  topPerformersSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  topPerformerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: primaryColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  rankText: {
    color: '#fff',
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
  },
  performerStats: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  performerBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  performerRate: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.success,
  },
  settingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  settingHeader: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  settingTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingValue: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold as any,
    color: theme.colors.text,
  },
  blockedMerchant: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  blockedMerchantName: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  unblockButton: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold as any,
  },
});
