import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  ArrowLeft, TrendingUp, Award, Target, Star, Zap, Gift,
  Calendar, Trophy, ChevronRight, Sparkles, IndianRupee, Percent
} from 'lucide-react-native';
import { useCouponEngineStore } from '../store/couponEngineStore';

export default function SavingsDashboardScreen() {
  const router = useRouter();
  const {
    savingsStats,
    achievements,
    userHistory,
    coupons,
  } = useCouponEngineStore();

  const stats = savingsStats;
  const recentHistory = userHistory.slice(0, 10);

  // Calculate success rate percentage
  const successfulUses = userHistory.filter(h => h.success).length;
  const totalUses = userHistory.length;
  const actualSuccessRate = totalUses > 0 ? Math.round((successfulUses / totalUses) * 100) : 0;

  // Find best deal
  const bestDeal = userHistory.reduce((max, h) => h.savings > max.savings ? h : max, userHistory[0] || { couponId: '', savings: 0 });
  const bestCoupon = coupons.find(c => c.id === bestDeal.couponId);

  // Unlocked vs total achievements
  const unlockedCount = achievements.filter(a => a.unlockedAt !== null).length;
  const totalCount = achievements.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Trophy size={24} color="#f59e0b" />
          <Text style={styles.headerTitle}>Savings Dashboard</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Savings Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Sparkles size={32} color="#fff" />
          </View>
          <Text style={styles.heroLabel}>Total Savings</Text>
          <Text style={styles.heroAmount}>₹{stats.totalSaved.toLocaleString()}</Text>
          <Text style={styles.heroSubtext}>
            You're saving {stats.comparisonToAverage}% more than average users! 🎉
          </Text>
          <View style={styles.heroBadge}>
            <TrendingUp size={16} color="#10b981" />
            <Text style={styles.heroBadgeText}>Top 15% Saver</Text>
          </View>
        </View>

        {/* Monthly Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.monthlyCard}>
            <View style={styles.monthlyRow}>
              <View style={styles.monthlyItem}>
                <View style={styles.monthlyIconWrapper}>
                  <Calendar size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.monthlyValue}>₹{stats.savingsThisMonth.toLocaleString()}</Text>
                <Text style={styles.monthlyLabel}>Saved</Text>
              </View>
              <View style={styles.monthlyDivider} />
              <View style={styles.monthlyItem}>
                <View style={styles.monthlyIconWrapper}>
                  <IndianRupee size={20} color="#10b981" />
                </View>
                <Text style={styles.monthlyValue}>₹{stats.averageSavingsPerOrder}</Text>
                <Text style={styles.monthlyLabel}>Avg per Order</Text>
              </View>
            </View>
          </View>

          {/* Projections */}
          <View style={styles.projectionCard}>
            <View style={styles.projectionHeader}>
              <TrendingUp size={18} color="#3b82f6" />
              <Text style={styles.projectionTitle}>Savings Forecast</Text>
            </View>
            <View style={styles.projectionRow}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionValue}>₹{stats.projectedMonthlySavings.toLocaleString()}</Text>
                <Text style={styles.projectionLabel}>Projected Monthly</Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionValue}>₹{stats.projectedYearlySavings.toLocaleString()}</Text>
                <Text style={styles.projectionLabel}>Projected Yearly</Text>
              </View>
            </View>
            <Text style={styles.projectionFootnote}>
              Based on your current usage patterns
            </Text>
          </View>
        </View>

        {/* Success Rate */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <View style={styles.successIconWrapper}>
                <Star size={24} color="#f59e0b" fill="#f59e0b" />
              </View>
              <View style={styles.successInfo}>
                <Text style={styles.successValue}>{actualSuccessRate}%</Text>
                <Text style={styles.successLabel}>Success Rate</Text>
              </View>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${actualSuccessRate}%` }]} />
            </View>
            <Text style={styles.successText}>
              {successfulUses} successful out of {totalUses} attempts
            </Text>
          </View>

          {/* Best Deal */}
          {bestCoupon && (
            <View style={styles.bestDealCard}>
              <View style={styles.bestDealHeader}>
                <Gift size={20} color="#10b981" />
                <Text style={styles.bestDealTitle}>Best Deal</Text>
              </View>
              <View style={styles.bestDealContent}>
                <Text style={styles.bestDealAmount}>₹{bestDeal.savings}</Text>
                <Text style={styles.bestDealDescription}>{bestCoupon.description}</Text>
                <Text style={styles.bestDealMerchant}>{bestCoupon.merchantName}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {unlockedCount}/{totalCount} Unlocked
            </Text>
          </View>

          {achievements.map((achievement, index) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <View style={styles.achievementLeft}>
                <View style={[
                  styles.achievementIcon,
                  !achievement.unlockedAt && styles.achievementIconLocked
                ]}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={[
                    styles.achievementName,
                    !achievement.unlockedAt && styles.achievementNameLocked
                  ]}>
                    {achievement.name}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <View style={styles.achievementProgress}>
                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${achievement.progress}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.achievementProgressText}>
                      {achievement.progress}%
                    </Text>
                  </View>
                </View>
              </View>
              {achievement.unlockedAt && (
                <View style={styles.achievementBadge}>
                  <Trophy size={16} color="#f59e0b" />
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Recent History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => {/* View all */ }}>
              <Text style={styles.viewAllButton}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentHistory.map((item, index) => {
            const coupon = coupons.find(c => c.id === item.couponId);
            if (!coupon) return null;

            return (
              <View key={index} style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <View style={[
                    styles.historyIcon,
                    item.success ? styles.historyIconSuccess : styles.historyIconFail
                  ]}>
                    {item.success ? (
                      <Zap size={16} color="#10b981" />
                    ) : (
                      <Text style={styles.historyIconText}>✕</Text>
                    )}
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyMerchant}>{coupon.merchantName}</Text>
                    <Text style={styles.historyCode}>{coupon.code}</Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.usedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  {item.success ? (
                    <>
                      <Text style={styles.historySavings}>₹{item.savings}</Text>
                      <Text style={styles.historySavingsLabel}>saved</Text>
                    </>
                  ) : (
                    <Text style={styles.historyFailure}>Failed</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Sparkles size={20} color="#8b5cf6" />
            <Text style={styles.tipsTitle}>Savings Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>💡</Text>
              <Text style={styles.tipText}>
                Stack multiple coupons for maximum savings
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>🔔</Text>
              <Text style={styles.tipText}>
                Enable notifications for expiring coupons
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>🤝</Text>
              <Text style={styles.tipText}>
                Share viral deals with friends to unlock rewards
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#8b5cf6',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  heroSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  achievementCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  monthlyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthlyItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyIconWrapper: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  monthlyValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  monthlyLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  monthlyDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#e5e7eb',
  },
  projectionCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  projectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  projectionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  projectionItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  projectionValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 4,
  },
  projectionLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  projectionFootnote: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  successCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  successIconWrapper: {
    width: 56,
    height: 56,
    backgroundColor: '#fef3c7',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successInfo: {
    flex: 1,
  },
  successValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  successLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 4,
  },
  successText: {
    fontSize: 13,
    color: '#6b7280',
  },
  bestDealCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#d1fae5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bestDealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bestDealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
  },
  bestDealContent: {
    alignItems: 'center',
  },
  bestDealAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 8,
  },
  bestDealDescription: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  bestDealMerchant: {
    fontSize: 13,
    color: '#6b7280',
  },
  achievementCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    backgroundColor: '#fef3c7',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconLocked: {
    backgroundColor: '#f3f4f6',
    opacity: 0.5,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  achievementNameLocked: {
    color: '#9ca3af',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    minWidth: 40,
    textAlign: 'right',
  },
  achievementBadge: {
    width: 40,
    height: 40,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyIconSuccess: {
    backgroundColor: '#d1fae5',
  },
  historyIconFail: {
    backgroundColor: '#fee2e2',
  },
  historyIconText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '600',
  },
  historyInfo: {
    flex: 1,
  },
  historyMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  historyCode: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: '#9ca3af',
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historySavings: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginBottom: 2,
  },
  historySavingsLabel: {
    fontSize: 11,
    color: '#6b7280',
  },
  historyFailure: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc2626',
  },
  tipsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipBullet: {
    fontSize: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  footer: {
    height: 40,
  },
});
