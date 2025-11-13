import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  ShoppingBag,
  Target,
  Zap,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  Lightbulb,
  Trophy,
  Star,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import {
  useBusinessAnalyticsStore,
  formatCurrency,
  formatPercentage,
  getTrendIcon,
  getTrendColor,
  getPriorityColor,
  type TimePeriod,
  type AIRecommendation,
} from '../store/businessAnalyticsStore';

const { width } = Dimensions.get('window');

type TabName = 'overview' | 'customers' | 'campaigns' | 'competitive';

export default function BusinessAnalyticsScreen() {
  const {
    analytics,
    selectedPeriod,
    isLoading,
    initializeAnalytics,
    setPeriod,
    refreshAnalytics,
  } = useBusinessAnalyticsStore();

  const [activeTab, setActiveTab] = useState<TabName>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Initialize with sample merchant ID
    initializeAnalytics('merchant_coffee_house_123');
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    refreshAnalytics();
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ============================================================================
  // METRIC CARD COMPONENT
  // ============================================================================

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    trend,
    trendLabel,
    color,
  }: {
    icon: any;
    label: string;
    value: string;
    trend?: number;
    trendLabel?: string;
    color: string;
  }) => (
    <View style={styles.metricCard}>
      <View style={[styles.metricIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {trend !== undefined && (
        <View style={styles.metricTrend}>
          <Text style={[styles.trendText, { color: getTrendColor(trend) }]}>
            {getTrendIcon(trend)} {formatPercentage(trend)}
          </Text>
          {trendLabel && <Text style={styles.trendLabel}>{trendLabel}</Text>}
        </View>
      )}
    </View>
  );

  // ============================================================================
  // AI RECOMMENDATION CARD
  // ============================================================================

  const RecommendationCard = ({ recommendation }: { recommendation: AIRecommendation }) => (
    <View style={[styles.recommendationCard, { borderLeftColor: getPriorityColor(recommendation.priority) }]}>
      <View style={styles.recommendationHeader}>
        <View style={styles.recommendationTitleRow}>
          <Lightbulb size={18} color={getPriorityColor(recommendation.priority)} />
          <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(recommendation.priority)}20` }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(recommendation.priority) }]}>
            {recommendation.priority.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
      <View style={styles.recommendationFooter}>
        <View style={styles.impactBadge}>
          <Zap size={14} color={theme.colors.primary} />
          <Text style={styles.impactText}>{recommendation.expectedImpact}</Text>
        </View>
        {recommendation.actionable && recommendation.action && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>{recommendation.action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ============================================================================
  // OVERVIEW TAB
  // ============================================================================

  const OverviewTab = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.colors.primary} />
      }>
      {/* Key Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={Users}
            label="Total Customers"
            value={analytics.overview.totalCustomers.toString()}
            trend={analytics.overview.customersTrend}
            trendLabel="vs last period"
            color="#3498DB"
          />
          <MetricCard
            icon={DollarSign}
            label="Revenue"
            value={formatCurrency(analytics.overview.totalRevenue)}
            trend={analytics.overview.revenueTrend}
            trendLabel="vs last period"
            color="#2ECC71"
          />
          <MetricCard
            icon={ShoppingBag}
            label="Avg Order Value"
            value={formatCurrency(analytics.overview.averageOrderValue)}
            trend={analytics.overview.aovTrend}
            trendLabel="vs last period"
            color="#F39C12"
          />
          <MetricCard
            icon={Target}
            label="CAC"
            value={formatCurrency(analytics.overview.customerAcquisitionCost)}
            color="#9B59B6"
          />
        </View>
      </View>

      {/* Customer Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Breakdown</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{analytics.overview.newCustomers}</Text>
            <Text style={styles.statLabel}>New Customers</Text>
            <View style={styles.statBar}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${(analytics.overview.newCustomers / analytics.overview.totalCustomers) * 100}%`,
                    backgroundColor: '#3498DB',
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{analytics.overview.returningCustomers}</Text>
            <Text style={styles.statLabel}>Returning</Text>
            <View style={styles.statBar}>
              <View
                style={[
                  styles.statBarFill,
                  {
                    width: `${(analytics.overview.returningCustomers / analytics.overview.totalCustomers) * 100}%`,
                    backgroundColor: '#2ECC71',
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      {/* AI Recommendations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI-Powered Recommendations</Text>
          <View style={styles.recommendationCount}>
            <Text style={styles.recommendationCountText}>{analytics.recommendations.length}</Text>
          </View>
        </View>
        {analytics.recommendations.slice(0, 3).map(rec => (
          <RecommendationCard key={rec.id} recommendation={rec} />
        ))}
      </View>
    </ScrollView>
  );

  // ============================================================================
  // CUSTOMERS TAB
  // ============================================================================

  const CustomersTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Demographics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Demographics</Text>
        
        {/* Age Distribution */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Age Groups</Text>
          {analytics.customerInsights.demographics.ageGroups.map((group, index) => (
            <View key={index} style={styles.barChartRow}>
              <Text style={styles.barLabel}>{group.range}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${group.percentage}%`, backgroundColor: '#3498DB' }]} />
              </View>
              <Text style={styles.barValue}>{group.percentage}%</Text>
            </View>
          ))}
        </View>

        {/* Customer Source */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Customer Source</Text>
          {analytics.customerInsights.demographics.customerSource.map((source, index) => (
            <View key={index} style={styles.barChartRow}>
              <Text style={styles.barLabel}>{source.source}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${source.percentage}%`, backgroundColor: theme.colors.primary }]} />
              </View>
              <Text style={styles.barValue}>{source.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Behavior Insights */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Behavior Insights</Text>
        <View style={styles.behaviorGrid}>
          <View style={styles.behaviorCard}>
            <Clock size={24} color="#F39C12" />
            <Text style={styles.behaviorValue}>{analytics.customerInsights.behavior.visitFrequency}x</Text>
            <Text style={styles.behaviorLabel}>Avg Visits/Customer</Text>
          </View>
          <View style={styles.behaviorCard}>
            <DollarSign size={24} color="#2ECC71" />
            <Text style={styles.behaviorValue}>{formatCurrency(analytics.customerInsights.behavior.averageSpend)}</Text>
            <Text style={styles.behaviorLabel}>Avg Spend</Text>
          </View>
        </View>

        {/* Favorite Items */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Top 5 Items</Text>
          {analytics.customerInsights.behavior.favoriteItems.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.item}</Text>
                <Text style={styles.itemStats}>
                  {item.orders} orders • {formatCurrency(item.revenue)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Peak Hours */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Peak Hours</Text>
          <View style={styles.peakHoursChart}>
            {analytics.customerInsights.behavior.peakHours.map((hour, index) => {
              const maxVisits = Math.max(...analytics.customerInsights.behavior.peakHours.map(h => h.visits));
              const height = (hour.visits / maxVisits) * 100;
              return (
                <View key={index} style={styles.hourBar}>
                  <View style={styles.hourBarContainer}>
                    <View style={[styles.hourBarFill, { height: `${height}%` }]} />
                  </View>
                  <Text style={styles.hourLabel}>{hour.hour.slice(0, 2)}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Loyalty Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loyalty Metrics</Text>
        <View style={styles.loyaltyGrid}>
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyPercentage}>
              <Text style={styles.loyaltyValue}>{analytics.customerInsights.loyalty.stampCardCompletionRate}%</Text>
            </View>
            <Text style={styles.loyaltyLabel}>Stamp Card Completion</Text>
          </View>
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyPercentage}>
              <Text style={styles.loyaltyValue}>{analytics.customerInsights.loyalty.repeatCustomerRate}%</Text>
            </View>
            <Text style={styles.loyaltyLabel}>Repeat Rate</Text>
          </View>
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyPercentage}>
              <Text style={styles.loyaltyValue}>{formatCurrency(analytics.customerInsights.loyalty.customerLifetimeValue)}</Text>
            </View>
            <Text style={styles.loyaltyLabel}>Lifetime Value</Text>
          </View>
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyPercentage}>
              <Text style={styles.loyaltyValue}>{analytics.customerInsights.loyalty.churnRate}%</Text>
            </View>
            <Text style={styles.loyaltyLabel}>Churn Rate</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // CAMPAIGNS TAB
  // ============================================================================

  const CampaignsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Active Campaigns */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Campaigns ({analytics.campaignPerformance.activeCampaigns.length})</Text>
        {analytics.campaignPerformance.activeCampaigns.map(campaign => (
          <View key={campaign.id} style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <View>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignType}>{campaign.type.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View style={[styles.roiBadge, { backgroundColor: campaign.roi > 200 ? '#2ECC7120' : '#F39C1220' }]}>
                <Text style={[styles.roiText, { color: campaign.roi > 200 ? '#2ECC71' : '#F39C12' }]}>
                  {campaign.roi}% ROI
                </Text>
              </View>
            </View>
            
            <View style={styles.campaignMetrics}>
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricValue}>{formatCurrency(campaign.revenue)}</Text>
                <Text style={styles.campaignMetricLabel}>Revenue</Text>
              </View>
              <View style={styles.campaignMetricDivider} />
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricValue}>{campaign.customers}</Text>
                <Text style={styles.campaignMetricLabel}>Customers</Text>
              </View>
              <View style={styles.campaignMetricDivider} />
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricValue}>{campaign.clickThroughRate.toFixed(1)}%</Text>
                <Text style={styles.campaignMetricLabel}>CTR</Text>
              </View>
            </View>

            <View style={styles.campaignFooter}>
              <Text style={styles.campaignSpend}>Spend: {formatCurrency(campaign.spend)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: '#2ECC7120' }]}>
                <Text style={[styles.statusText, { color: '#2ECC71' }]}>Active</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* ROI Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ROI Comparison</Text>
        {analytics.campaignPerformance.roiByCampaign.map((camp, index) => (
          <View key={index} style={styles.roiRow}>
            <Text style={styles.roiCampaignName}>{camp.name}</Text>
            <View style={styles.roiBarContainer}>
              <View style={[styles.roiBar, { width: `${Math.min(camp.roi, 300) / 3}%` }]} />
            </View>
            <Text style={styles.roiValue}>{camp.roi}%</Text>
          </View>
        ))}
      </View>

      {/* Best Performing Deals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Best Performing Deals</Text>
        {analytics.campaignPerformance.bestPerformingDeals.map((deal, index) => (
          <View key={index} style={styles.dealCard}>
            <View style={styles.dealRank}>
              <Trophy size={18} color={index === 0 ? '#F39C12' : theme.colors.textSecondary} />
            </View>
            <View style={styles.dealInfo}>
              <Text style={styles.dealName}>{deal.name}</Text>
              <Text style={styles.dealStats}>
                {deal.conversions} conversions • {formatCurrency(deal.revenue)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // ============================================================================
  // COMPETITIVE TAB
  // ============================================================================

  const CompetitiveTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Market Position */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Market Position</Text>
        <View style={styles.marketGrid}>
          <View style={styles.marketCard}>
            <PieChart size={24} color={theme.colors.primary} />
            <Text style={styles.marketValue}>{analytics.competitiveIntelligence.marketShare}%</Text>
            <Text style={styles.marketLabel}>Market Share</Text>
          </View>
          <View style={styles.marketCard}>
            <Trophy size={24} color="#F39C12" />
            <Text style={styles.marketValue}>#{analytics.competitiveIntelligence.marketRank}</Text>
            <Text style={styles.marketLabel}>Ranking</Text>
          </View>
          <View style={styles.marketCard}>
            <Users size={24} color="#3498DB" />
            <Text style={styles.marketValue}>{analytics.competitiveIntelligence.totalCompetitors}</Text>
            <Text style={styles.marketLabel}>Competitors</Text>
          </View>
        </View>
      </View>

      {/* Rating Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating Comparison</Text>
        {analytics.competitiveIntelligence.ratingComparison.map((merchant, index) => (
          <View key={index} style={[styles.ratingRow, merchant.isYou && styles.ratingRowHighlight]}>
            <Text style={[styles.ratingMerchant, merchant.isYou && styles.ratingMerchantYou]}>
              {merchant.merchant} {merchant.isYou && '(You)'}
            </Text>
            <View style={styles.ratingStars}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  color={i < Math.floor(merchant.rating) ? '#F39C12' : theme.colors.surfaceLight}
                  fill={i < Math.floor(merchant.rating) ? '#F39C12' : 'transparent'}
                />
              ))}
              <Text style={styles.ratingValue}>{merchant.rating.toFixed(1)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pricing Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pricing Analysis</Text>
        {analytics.competitiveIntelligence.pricingComparison.map((item, index) => (
          <View key={index} style={styles.pricingCard}>
            <Text style={styles.pricingItem}>{item.item}</Text>
            <View style={styles.pricingComparison}>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Your Price</Text>
                <Text style={styles.priceValue}>{formatCurrency(item.yourPrice)}</Text>
              </View>
              <View style={styles.priceColumn}>
                <Text style={styles.priceLabel}>Market Avg</Text>
                <Text style={styles.priceValue}>{formatCurrency(item.avgPrice)}</Text>
              </View>
              <View style={[styles.positionBadge, { 
                backgroundColor: item.position === 'low' ? '#2ECC7120' : item.position === 'high' ? '#E74C3C20' : '#F39C1220'
              }]}>
                <Text style={[styles.positionText, {
                  color: item.position === 'low' ? '#2ECC71' : item.position === 'high' ? '#E74C3C' : '#F39C12'
                }]}>
                  {item.position.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Demand Forecast */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>5-Day Demand Forecast</Text>
        <View style={styles.forecastChart}>
          {analytics.competitiveIntelligence.demandForecast.map((day, index) => {
            const maxCustomers = Math.max(...analytics.competitiveIntelligence.demandForecast.map(d => d.expectedCustomers));
            const height = (day.expectedCustomers / maxCustomers) * 100;
            return (
              <View key={index} style={styles.forecastBar}>
                <Text style={styles.forecastValue}>{day.expectedCustomers}</Text>
                <View style={styles.forecastBarContainer}>
                  <View style={[styles.forecastBarFill, { height: `${height}%` }]} />
                </View>
                <Text style={styles.forecastDate}>{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={styles.forecastConfidence}>{day.confidence}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Business Intelligence</Text>
          <Text style={styles.headerSubtitle}>{analytics.merchantName}</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(['today', 'week', 'month', 'quarter'] as TimePeriod[]).map(period => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
            onPress={() => setPeriod(period)}>
            <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'overview', label: 'Overview', icon: BarChart3 },
          { key: 'customers', label: 'Customers', icon: Users },
          { key: 'campaigns', label: 'Campaigns', icon: Target },
          { key: 'competitive', label: 'Market', icon: TrendingUp },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as TabName)}>
            <tab.icon size={18} color={activeTab === tab.key ? theme.colors.primary : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'campaigns' && <CampaignsTab />}
        {activeTab === 'competitive' && <CompetitiveTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  periodText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationCount: {
    backgroundColor: theme.colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  statBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recommendationDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartSection: {
    marginTop: 20,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  barLabel: {
    fontSize: 12,
    color: theme.colors.text,
    width: 60,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    width: 40,
    textAlign: 'right',
  },
  behaviorGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  behaviorCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  behaviorValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
  },
  behaviorLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  itemStats: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  peakHoursChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingVertical: 8,
  },
  hourBar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  hourBarContainer: {
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  hourBarFill: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  hourLabel: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
  loyaltyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  loyaltyCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  loyaltyPercentage: {
    marginBottom: 8,
  },
  loyaltyValue: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
  },
  loyaltyLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  campaignCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  campaignType: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  roiText: {
    fontSize: 13,
    fontWeight: '600',
  },
  campaignMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  campaignMetric: {
    flex: 1,
    alignItems: 'center',
  },
  campaignMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  campaignMetricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  campaignMetricDivider: {
    width: 1,
    backgroundColor: theme.colors.surfaceLight,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
  },
  campaignSpend: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  roiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  roiCampaignName: {
    fontSize: 12,
    color: theme.colors.text,
    width: 120,
  },
  roiBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  roiBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  roiValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    width: 50,
    textAlign: 'right',
  },
  dealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  dealRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dealInfo: {
    flex: 1,
  },
  dealName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  dealStats: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  marketGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  marketCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  marketValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
  },
  marketLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  ratingRowHighlight: {
    backgroundColor: theme.colors.surface,
  },
  ratingMerchant: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  ratingMerchantYou: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 4,
  },
  pricingCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  pricingItem: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  pricingComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceColumn: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  positionText: {
    fontSize: 10,
    fontWeight: '600',
  },
  forecastChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingVertical: 8,
  },
  forecastBar: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  forecastValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  forecastBarContainer: {
    width: '80%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  forecastBarFill: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  forecastDate: {
    fontSize: 11,
    color: theme.colors.text,
  },
  forecastConfidence: {
    fontSize: 9,
    color: theme.colors.textSecondary,
  },
});
