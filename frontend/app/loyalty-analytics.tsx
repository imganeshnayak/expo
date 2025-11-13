import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useExternalLoyaltyStore,
  ExternalLoyaltyProgram,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

const primaryColor = theme.colors.primary;
const { width } = Dimensions.get('window');

export default function LoyaltyAnalyticsScreen() {
  const router = useRouter();
  const {
    programs,
    insights,
    calculateInsights,
    getTotalPortfolioValue,
    getExpiringPrograms,
    getBestRedemptionOpportunities,
  } = useExternalLoyaltyStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    calculateInsights();
  }, []);

  const portfolioValue = getTotalPortfolioValue();
  const expiringPrograms = getExpiringPrograms();
  const bestOpportunities = getBestRedemptionOpportunities();

  // Category breakdown
  const categoryBreakdown = programs.reduce((acc, program) => {
    const category = program.category;
    if (!acc[category]) {
      acc[category] = { count: 0, value: 0, progress: 0 };
    }
    acc[category].count += 1;
    const completion = (program.currentProgress / program.requiredForReward) * 100;
    acc[category].progress += completion;
    
    // Estimate value (you can enhance this based on actual reward values)
    if (completion >= 100) {
      acc[category].value += 100; // Default reward value
    }
    return acc;
  }, {} as Record<string, { count: number; value: number; progress: number }>);

  const categoryData = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      avgProgress: data.progress / data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // Program type breakdown
  const typeBreakdown = programs.reduce((acc, program) => {
    const type = program.programType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalPrograms = programs.length;
  const activePrograms = programs.filter(p => p.status === 'active').length;
  const completedPrograms = programs.filter(
    p => p.currentProgress >= p.requiredForReward
  ).length;

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Food & Dining': 'restaurant',
      'Food & Drink': 'restaurant',
      Retail: 'cart',
      Services: 'construct',
      Entertainment: 'film',
      Travel: 'airplane',
      'Health & Wellness': 'fitness',
      Beauty: 'sparkles',
      Other: 'ellipsis-horizontal',
    };
    return icons[category] || 'card';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#FFA07A',
      '#9B59B6',
      '#2ECC71',
      '#E74C3C',
      '#95A5A6',
    ];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Portfolio Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Total Value Card */}
        <View style={styles.valueCard}>
          <View style={styles.valueHeader}>
            <Ionicons name="wallet" size={32} color="#fff" />
            <View style={styles.valueInfo}>
              <Text style={styles.valueLabel}>Total Portfolio Value</Text>
              <Text style={styles.valueAmount}>₹{portfolioValue.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.valueDivider} />
          <View style={styles.valueStats}>
            <View style={styles.valueStat}>
              <Text style={styles.valueStatNumber}>{activePrograms}</Text>
              <Text style={styles.valueStatLabel}>Active</Text>
            </View>
            <View style={styles.valueStatDivider} />
            <View style={styles.valueStat}>
              <Text style={styles.valueStatNumber}>{completedPrograms}</Text>
              <Text style={styles.valueStatLabel}>Ready</Text>
            </View>
            <View style={styles.valueStatDivider} />
            <View style={styles.valueStat}>
              <Text style={styles.valueStatNumber}>{expiringPrograms.length}</Text>
              <Text style={styles.valueStatLabel}>Expiring</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#4CAF50' }]}>
            <Ionicons name="gift" size={28} color="#fff" />
            <Text style={styles.statCardNumber}>{bestOpportunities.length}</Text>
            <Text style={styles.statCardLabel}>Best Opportunities</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FF9800' }]}>
            <Ionicons name="trending-up" size={28} color="#fff" />
            <Text style={styles.statCardNumber}>
              {insights?.usagePatterns?.averageRedemptionTime || 0}d
            </Text>
            <Text style={styles.statCardLabel}>Avg. Completion</Text>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categoryData.map((item, index) => {
            const color = getCategoryColor(index);
            const progressWidth = (item.avgProgress / 100) * (width - 120);
            
            return (
              <View key={item.category} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons
                      name={getCategoryIcon(item.category) as any}
                      size={24}
                      color={color}
                    />
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{item.category}</Text>
                    <Text style={styles.categoryCount}>
                      {item.count} program{item.count !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.categoryValue}>₹{item.value}</Text>
                </View>
                <View style={styles.categoryProgress}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: Math.min(progressWidth, width - 120), backgroundColor: color },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressLabel}>{item.avgProgress.toFixed(0)}%</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Program Type Distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Program Types</Text>
          <View style={styles.typeGrid}>
            {Object.entries(typeBreakdown).map(([type, count]) => {
              const percentage = ((count / totalPrograms) * 100).toFixed(0);
              const getTypeIcon = () => {
                switch (type) {
                  case 'stamps':
                    return 'checkbox';
                  case 'points':
                    return 'trophy';
                  case 'tiers':
                    return 'ribbon';
                  case 'visits':
                    return 'footsteps';
                  default:
                    return 'card';
                }
              };
              const getTypeColor = () => {
                switch (type) {
                  case 'stamps':
                    return '#2196F3';
                  case 'points':
                    return '#FF9800';
                  case 'tiers':
                    return '#9C27B0';
                  case 'visits':
                    return '#4CAF50';
                  default:
                    return '#888';
                }
              };
              
              return (
                <View
                  key={type}
                  style={[styles.typeCard, { borderColor: getTypeColor() }]}
                >
                  <Ionicons name={getTypeIcon() as any} size={32} color={getTypeColor()} />
                  <Text style={styles.typeLabel}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                  <Text style={styles.typeCount}>{count}</Text>
                  <Text style={styles.typePercent}>{percentage}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Top Recommendation */}
        {insights?.topRecommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Recommendation</Text>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Ionicons name="bulb" size={32} color={primaryColor} />
                <View style={styles.recommendationInfo}>
                  <Text style={styles.recommendationMerchant}>
                    {insights.topRecommendation.merchantName}
                  </Text>
                  <Text style={styles.recommendationReason}>
                    {insights.topRecommendation.reason}
                  </Text>
                </View>
              </View>
              <View style={styles.recommendationValue}>
                <Text style={styles.recommendationValueLabel}>Estimated Value</Text>
                <Text style={styles.recommendationValueAmount}>
                  ₹{insights.topRecommendation.estimatedValue}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.recommendationButton}
                onPress={() => {
                  const program = programs.find(
                    p => p.merchantName === insights.topRecommendation?.merchantName
                  );
                  if (program) {
                    router.push({
                      pathname: '/manual-update' as any,
                      params: { programId: program.id },
                    });
                  }
                }}
              >
                <Text style={styles.recommendationButtonText}>View Program</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Insights Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightRow}>
              <Ionicons name="star" size={20} color={primaryColor} />
              <Text style={styles.insightText}>
                Most used category:{' '}
                <Text style={styles.insightBold}>
                  {insights?.usagePatterns?.mostUsedCategory || 'N/A'}
                </Text>
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="time" size={20} color={primaryColor} />
              <Text style={styles.insightText}>
                Average time to redeem:{' '}
                <Text style={styles.insightBold}>
                  {insights?.usagePatterns?.averageRedemptionTime || 0} days
                </Text>
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="heart" size={20} color={primaryColor} />
              <Text style={styles.insightText}>
                Preferred program type:{' '}
                <Text style={styles.insightBold}>
                  {insights?.usagePatterns?.preferredProgramType || 'N/A'}
                </Text>
              </Text>
            </View>
            <View style={styles.insightRow}>
              <Ionicons name="cash" size={20} color={primaryColor} />
              <Text style={styles.insightText}>
                Total potential savings:{' '}
                <Text style={styles.insightBold}>
                  ₹{insights?.totalPotentialSavings || 0}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  valueCard: {
    backgroundColor: primaryColor,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  valueInfo: {
    marginLeft: 16,
    flex: 1,
  },
  valueLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 4,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  valueDivider: {
    height: 1,
    backgroundColor: '#fff',
    opacity: 0.3,
    marginVertical: 16,
  },
  valueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueStat: {
    flex: 1,
    alignItems: 'center',
  },
  valueStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  valueStatLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  valueStatDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#fff',
    opacity: 0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statCardNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    color: '#888',
  },
  categoryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  categoryProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 45,
    textAlign: 'right',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  typeCard: {
    width: (width - 44) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 8,
  },
  typeCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
  },
  typePercent: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  recommendationCard: {
    backgroundColor: primaryColor + '15',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: primaryColor,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  recommendationMerchant: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  recommendationReason: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: primaryColor + '30',
    marginBottom: 12,
  },
  recommendationValueLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  recommendationValueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primaryColor,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: primaryColor,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  recommendationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  insightCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
  },
  insightBold: {
    fontWeight: 'bold',
    color: '#000',
  },
  bottomPadding: {
    height: 40,
  },
});
