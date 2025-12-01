import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react-native';
import { useBusinessAnalyticsStore, formatCurrency } from '../../store/businessAnalyticsStore';
import { theme } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  color: string;
}

const MetricCard = ({ icon: Icon, label, value, color }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
      <Icon size={24} color={color} strokeWidth={2.5} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

interface TopItemProps {
  rank: number;
  name: string;
  value: string;
  count: number;
}

const TopItem = ({ rank, name, value, count }: TopItemProps) => (
  <View style={styles.topItem}>
    <View style={styles.topItemLeft}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      <View>
        <Text style={styles.itemName}>{name}</Text>
        <Text style={styles.itemCount}>{count} orders</Text>
      </View>
    </View>
    <Text style={styles.itemValue}>{value}</Text>
  </View>
);

export default function BusinessAnalyticsScreen() {
  const { analytics, initializeAnalytics } = useBusinessAnalyticsStore();

  useEffect(() => {
    initializeAnalytics('merchant_coffee_house_123');
  }, []);

  if (!analytics) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Key Metrics - Simplified to 3 main ones */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon={DollarSign}
            label="Total Sales"
            value={formatCurrency(analytics.overview.totalRevenue)}
            color={theme.colors.success}
          />
          <MetricCard
            icon={TrendingUp}
            label="New Customers"
            value={`+${analytics.overview.newCustomers}`}
            color={theme.colors.secondary}
          />
          <MetricCard
            icon={ShoppingBag}
            label="Avg Order"
            value={formatCurrency(analytics.overview.averageOrderValue)}
            color={theme.colors.warning}
          />
        </View>

        {/* Top Products - Simplified List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Selling Items</Text>
          <View style={styles.card}>
            {analytics.customerInsights.behavior.favoriteItems.slice(0, 3).map((item, index) => (
              <TopItem
                key={index}
                rank={index + 1}
                name={item.item}
                value={formatCurrency(item.revenue)}
                count={item.orders}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // Header styles removed as they are no longer used
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