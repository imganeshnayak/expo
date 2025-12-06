import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, IndianRupee, ShoppingBag, TrendingUp, BarChart as BarChartIcon, PieChart, Activity } from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-gifted-charts';
import { useBusinessAnalyticsStore, formatCurrency } from '../../store/businessAnalyticsStore';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BusinessHeader } from '../../components/BusinessHeader';

const { width } = Dimensions.get('window');

const styles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.surface,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  activeTabText: {
    color: theme.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fontFamily.primary,
  },
  section: {
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 12,
    fontFamily: theme.fontFamily.heading,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  chartCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    paddingLeft: 0, // Charts usually have their own padding
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  topItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.primary,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fontFamily.heading,
  },
  itemCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.primary,
  },
  dealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  dealInfo: {
    flex: 1,
  },
  dealName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  dealStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  dealMetrics: {
    alignItems: 'flex-end',
  },
  dealRevenue: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.success,
    fontFamily: theme.fontFamily.primary,
  },
});

interface MetricCardProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color: string;
  theme: any;
}

const MetricCard = ({ icon: Icon, label, value, color, theme }: MetricCardProps) => (
  <View style={styles(theme).metricCard}>
    <View style={[styles(theme).iconCircle, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} strokeWidth={2.5} />
    </View>
    <Text style={styles(theme).metricValue}>{value}</Text>
    <Text style={styles(theme).metricLabel}>{label}</Text>
  </View>
);

interface TopItemProps {
  rank: number;
  name: string;
  value: string;
  count: number;
  theme: any;
}

const TopItem = ({ rank, name, value, count, theme }: TopItemProps) => (
  <View style={styles(theme).topItem}>
    <View style={styles(theme).topItemLeft}>
      <View style={styles(theme).rankBadge}>
        <Text style={styles(theme).rankText}>{rank}</Text>
      </View>
      <View>
        <Text style={styles(theme).itemName}>{name}</Text>
        <Text style={styles(theme).itemCount}>{count} orders</Text>
      </View>
    </View>
    <Text style={styles(theme).itemValue}>{value}</Text>
  </View>
);

export default function BusinessAnalyticsScreen() {
  const { analytics, initializeAnalytics, isLoading } = useBusinessAnalyticsStore();
  const { user } = useAuthStore();
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<'overview' | 'trends'>('overview');

  useEffect(() => {
    if (user?.merchantId) {
      initializeAnalytics(user.merchantId);
    }
  }, [user?.merchantId]);

  const revenueData = analytics?.overview?.dailyRevenue?.map((item: any) => ({
    value: item.value,
    label: item.label,
    dataPointText: formatCurrency(item.value),
  })) || [];

  const peakHoursData = analytics?.customerInsights?.behavior?.peakHours?.map((item: any) => ({
    value: item.visits,
    label: item.hour,
    frontColor: theme.colors.primary,
  })) || [];

  if (isLoading && !analytics) {
    return (
      <View style={styles(theme).loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles(theme).loadingText, { marginTop: 12 }]}>Loading Business Insights...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles(theme).container}>
      <BusinessHeader title="Analytics" />
      <View style={styles(theme).tabContainer}>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'overview' && styles(theme).activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles(theme).tabText, activeTab === 'overview' && styles(theme).activeTabText]}>Overview</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles(theme).tab, activeTab === 'trends' && styles(theme).activeTab]}
          onPress={() => setActiveTab('trends')}
        >
          <Text style={[styles(theme).tabText, activeTab === 'trends' && styles(theme).activeTabText]}>Trends</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles(theme).scroll}
        contentContainerStyle={styles(theme).scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'overview' ? (
          <>
            {/* Key Metrics */}
            <View style={styles(theme).metricsGrid}>
              <MetricCard
                icon={IndianRupee}
                label="Total Sales"
                value={analytics?.overview ? formatCurrency(analytics.overview.totalRevenue) : '₹0'}
                color={theme.colors.success}
                theme={theme}
              />
              <MetricCard
                icon={TrendingUp}
                label="New Customers"
                value={analytics?.overview ? `+${analytics.overview.newCustomers}` : '0'}
                color={theme.colors.secondary}
                theme={theme}
              />
              <MetricCard
                icon={ShoppingBag}
                label="Avg Order"
                value={analytics?.overview ? formatCurrency(analytics.overview.averageOrderValue) : '₹0'}
                color={theme.colors.warning}
                theme={theme}
              />
            </View>

            {/* Deal Claims - Show campaign performance */}
            {(analytics?.campaignPerformance?.activeCampaigns?.length ?? 0) > 0 && (
              <View style={styles(theme).section}>
                <Text style={styles(theme).sectionTitle}>Deal Performance</Text>
                <View style={styles(theme).card}>
                  {analytics?.campaignPerformance?.activeCampaigns?.map((campaign) => (
                    <View key={campaign.id} style={styles(theme).dealItem}>
                      <View style={styles(theme).dealInfo}>
                        <Text style={styles(theme).dealName}>{campaign.name}</Text>
                        <Text style={styles(theme).dealStats}>
                          {campaign.customers} claims • {campaign.conversions} redeemed
                        </Text>
                      </View>
                      <View style={styles(theme).dealMetrics}>
                        <Text style={styles(theme).dealRevenue}>{formatCurrency(campaign.revenue)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Top Products */}
            <View style={styles(theme).section}>
              <Text style={styles(theme).sectionTitle}>Top Selling Items</Text>
              <View style={styles(theme).card}>
                {(analytics?.customerInsights?.behavior?.favoriteItems?.length ?? 0) > 0 ? (
                  analytics?.customerInsights?.behavior?.favoriteItems?.slice(0, 3).map((item, index) => (
                    <TopItem
                      key={index}
                      rank={index + 1}
                      name={item.item}
                      value={formatCurrency(item.revenue)}
                      count={item.orders}
                      theme={theme}
                    />
                  ))
                ) : (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: theme.colors.textSecondary }}>No sales data yet</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Revenue Trend Chart */}
            <View style={styles(theme).chartSection}>
              <Text style={styles(theme).sectionTitle}>Revenue Trend (Last 7 Days)</Text>
              <View style={styles(theme).chartCard}>
                <LineChart
                  data={revenueData}
                  color={theme.colors.success}
                  thickness={3}
                  startFillColor={theme.colors.success}
                  endFillColor={theme.colors.success + '10'}
                  startOpacity={0.2}
                  endOpacity={0.05}
                  initialSpacing={20}
                  noOfSections={4}
                  yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                  hideDataPoints={false}
                  dataPointsColor={theme.colors.success}
                  curved
                  width={width - 80} // Adjust for padding
                  height={200}
                />
              </View>
            </View>

            {/* Peak Hours Chart */}
            <View style={styles(theme).chartSection}>
              <Text style={styles(theme).sectionTitle}>Peak Traffic Hours</Text>
              <View style={styles(theme).chartCard}>
                <BarChart
                  data={peakHoursData}
                  barWidth={22}
                  noOfSections={3}
                  barBorderRadius={4}
                  frontColor={theme.colors.primary}
                  yAxisTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                  xAxisLabelTextStyle={{ color: theme.colors.textSecondary, fontSize: 10 }}
                  width={width - 80}
                  height={200}
                  isAnimated
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView >
  );
}
