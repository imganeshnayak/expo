import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react-native';
import { useBusinessAnalyticsStore, formatCurrency } from '../../store/businessAnalyticsStore';
import { useAuthStore } from '../../store/authStore';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width } = Dimensions.get('window');

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

  useEffect(() => {
    if (user?.merchantId) {
      initializeAnalytics(user.merchantId);
    }
  }, [user?.merchantId]);

  if (isLoading && !analytics) {
    return (
      <View style={styles(theme).loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles(theme).loadingText, { marginTop: 12 }]}>Loading Business Insights...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles(theme).loading}>
        <Text style={styles(theme).loadingText}>No data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <ScrollView
        style={styles(theme).scroll}
        contentContainerStyle={styles(theme).scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics - Simplified to 3 main ones */}
        <View style={styles(theme).metricsGrid}>
          <MetricCard
            icon={DollarSign}
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

        {/* Top Products - Simplified List */}
        <View style={styles(theme).section}>
          <Text style={styles(theme).sectionTitle}>Top Selling Items</Text>
          <View style={styles(theme).card}>
            {analytics?.customerInsights?.behavior?.favoriteItems?.length > 0 ? (
              analytics.customerInsights.behavior.favoriteItems.slice(0, 3).map((item, index) => (
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
      </ScrollView>
    </SafeAreaView>
  );
}

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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: (width - 52) / 3, // 3 cards per row approx, or adjust for 2
    minWidth: '30%',
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
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
});