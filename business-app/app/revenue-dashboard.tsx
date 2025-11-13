import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useAdvancedFeaturesStore, type RevenueStream } from '../store/advancedFeaturesStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function RevenueDashboardScreen() {
  const {
    liveTransactions,
    revenueBreakdown,
    revenueProjections,
    revenueAnomalies,
    getLiveTransactions,
    calculateRevenueBreakdown,
    generateProjections,
    dismissAnomaly,
    detectAnomalies,
  } = useAdvancedFeaturesStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStream, setSelectedStream] = useState<RevenueStream | 'all'>('all');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = () => {
    const now = Date.now();
    const startDate =
      timeRange === 'today'
        ? now - 86400000
        : timeRange === 'week'
        ? now - 604800000
        : now - 2592000000;

    calculateRevenueBreakdown(startDate, now);
    generateProjections(7);
    
    // Detect anomalies in recent transactions
    const recent = getLiveTransactions(100);
    detectAnomalies(recent);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    loadData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Calculate totals
  const totalRevenue = revenueBreakdown.reduce((sum, rb) => sum + rb.amount, 0);
  const totalTransactions = revenueBreakdown.reduce(
    (sum, rb) => sum + rb.transactionCount,
    0
  );
  const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Get filtered transactions
  const filteredTransactions =
    selectedStream === 'all'
      ? liveTransactions
      : liveTransactions.filter((t) => t.revenueStream === selectedStream);

  const recentTransactions = filteredTransactions.slice(0, 20);

  // Stream icons and colors
  const streamConfig: Record<
    RevenueStream,
    { icon: string; color: string; label: string }
  > = {
    cpt: { icon: '💰', color: '#10B981', label: 'Cost Per Transaction' },
    cpa: { icon: '🎯', color: '#3B82F6', label: 'Cost Per Action' },
    subscription: { icon: '📅', color: '#8B5CF6', label: 'Subscriptions' },
    premium_features: { icon: '⭐', color: '#F59E0B', label: 'Premium Features' },
    marketplace: { icon: '🏪', color: '#EC4899', label: 'Marketplace' },
  };

  const renderRevenueCard = (breakdown: typeof revenueBreakdown[0]) => {
    const config = streamConfig[breakdown.stream];

    return (
      <TouchableOpacity
        key={breakdown.stream}
        style={[
          styles.revenueCard,
          selectedStream === breakdown.stream && styles.revenueCardSelected,
        ]}
        onPress={() =>
          setSelectedStream(
            selectedStream === breakdown.stream ? 'all' : breakdown.stream
          )
        }
      >
        <View style={styles.revenueHeader}>
          <Text style={[styles.streamIcon, { color: config.color }]}>
            {config.icon}
          </Text>
          <View style={styles.revenueInfo}>
            <Text style={styles.streamLabel}>{config.label}</Text>
            <Text style={styles.revenueAmount}>
              ${breakdown.amount.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.revenueStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Share</Text>
            <Text style={styles.statValue}>{breakdown.percentage.toFixed(1)}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Txns</Text>
            <Text style={styles.statValue}>{breakdown.transactionCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg</Text>
            <Text style={styles.statValue}>
              ${breakdown.averageValue.toFixed(0)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Growth</Text>
            <Text
              style={[
                styles.statValue,
                breakdown.growth >= 0 ? styles.growthPositive : styles.growthNegative,
              ]}
            >
              {breakdown.growth >= 0 ? '+' : ''}
              {breakdown.growth.toFixed(1)}%
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${breakdown.percentage}%`, backgroundColor: config.color },
            ]}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderTransaction = (transaction: typeof liveTransactions[0]) => {
    const config = streamConfig[transaction.revenueStream];
    const timeAgo = getTimeAgo(transaction.timestamp);

    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionIconText}>{config.icon}</Text>
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionCustomer}>{transaction.customerName}</Text>
          <Text style={styles.transactionTime}>{timeAgo}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={styles.transactionValue}>
            ${transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.transactionStream}>{config.label}</Text>
        </View>
      </View>
    );
  };

  const renderAnomaly = (anomaly: typeof revenueAnomalies[0]) => {
    const severityColors = {
      low: '#FEF3C7',
      medium: '#FED7AA',
      high: '#FEE2E2',
    };

    const severityTextColors = {
      low: '#D97706',
      medium: '#EA580C',
      high: '#DC2626',
    };

    return (
      <View
        key={anomaly.id}
        style={[
          styles.anomalyCard,
          { backgroundColor: severityColors[anomaly.severity] },
        ]}
      >
        <View style={styles.anomalyHeader}>
          <View>
            <Text style={styles.anomalyType}>
              {anomaly.type === 'spike' ? '📈' : anomaly.type === 'drop' ? '📉' : '⚠️'}{' '}
              {anomaly.type.toUpperCase()}
            </Text>
            <Text style={styles.anomalyDescription}>{anomaly.description}</Text>
          </View>
          <TouchableOpacity onPress={() => dismissAnomaly(anomaly.id)}>
            <Text style={styles.dismissButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.anomalyStats}>
          <View style={styles.anomalyStat}>
            <Text style={styles.anomalyStatLabel}>Expected</Text>
            <Text style={styles.anomalyStatValue}>
              ${anomaly.expectedValue.toFixed(0)}
            </Text>
          </View>
          <View style={styles.anomalyStat}>
            <Text style={styles.anomalyStatLabel}>Actual</Text>
            <Text style={styles.anomalyStatValue}>
              ${anomaly.actualValue.toFixed(0)}
            </Text>
          </View>
          <View style={styles.anomalyStat}>
            <Text style={styles.anomalyStatLabel}>Deviation</Text>
            <Text
              style={[
                styles.anomalyStatValue,
                { color: severityTextColors[anomaly.severity] },
              ]}
            >
              {anomaly.deviation > 0 ? '+' : ''}
              {anomaly.deviation.toFixed(1)}%
            </Text>
          </View>
        </View>

        {anomaly.possibleCauses.length > 0 && (
          <View style={styles.anomalyCauses}>
            <Text style={styles.anomalyCausesTitle}>Possible Causes:</Text>
            {anomaly.possibleCauses.map((cause, index) => (
              <Text key={index} style={styles.anomalyCause}>
                • {cause}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderProjection = (projection: typeof revenueProjections[0]) => {
    const date = new Date(projection.date);
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <View key={projection.date} style={styles.projectionItem}>
        <Text style={[styles.projectionDate, isToday && styles.projectionToday]}>
          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
        <View style={styles.projectionBar}>
          <View
            style={[
              styles.projectionFill,
              {
                width: `${(projection.projected / Math.max(...revenueProjections.map(p => p.projected))) * 100}%`,
                backgroundColor: projection.actual
                  ? '#10B981'
                  : `rgba(59, 130, 246, ${projection.confidence})`,
              },
            ]}
          />
        </View>
        <Text style={styles.projectionAmount}>
          ${projection.projected.toFixed(0)}
        </Text>
        {projection.actual && (
          <Text style={styles.projectionActual}>
            (${projection.actual.toFixed(0)})
          </Text>
        )}
      </View>
    );
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Real-Time Revenue Dashboard</Text>
        <View style={styles.headerActions}>
          {(['today', 'week', 'month'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive,
              ]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  timeRange === range && styles.timeRangeTextActive,
                ]}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Revenue</Text>
          <Text style={styles.summaryValue}>${totalRevenue.toLocaleString()}</Text>
          <Text style={styles.summarySubtext}>{timeRange}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>{totalTransactions.toLocaleString()}</Text>
          <Text style={styles.summarySubtext}>total count</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Avg Transaction</Text>
          <Text style={styles.summaryValue}>${averageTransaction.toFixed(2)}</Text>
          <Text style={styles.summarySubtext}>per transaction</Text>
        </View>
      </View>

      {/* Anomalies Alert */}
      {revenueAnomalies.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚠️ Anomalies Detected</Text>
            <View style={styles.anomalyBadge}>
              <Text style={styles.anomalyBadgeText}>{revenueAnomalies.length}</Text>
            </View>
          </View>
          {revenueAnomalies.map(renderAnomaly)}
        </View>
      )}

      {/* Revenue Stream Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Revenue Streams</Text>
        <View style={styles.revenueGrid}>
          {revenueBreakdown.map(renderRevenueCard)}
        </View>
      </View>

      {/* Revenue Projections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>7-Day Projection</Text>
        <View style={styles.projectionsContainer}>
          {revenueProjections.map(renderProjection)}
        </View>
        <Text style={styles.projectionNote}>
          Confidence decreases for future days. Bars show projected revenue with opacity
          indicating confidence level.
        </Text>
      </View>

      {/* Live Transaction Feed */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔴 Live Transactions</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedStream === 'all' ? 'All Streams' : streamConfig[selectedStream].label}
          </Text>
        </View>
        <View style={styles.transactionsList}>
          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            recentTransactions.map(renderTransaction)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  timeRangeButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  timeRangeTextActive: {
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  anomalyBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  anomalyBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  anomalyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  anomalyType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  anomalyDescription: {
    fontSize: 14,
    color: '#4B5563',
  },
  dismissButton: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  anomalyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  anomalyStat: {
    alignItems: 'center',
  },
  anomalyStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  anomalyStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  anomalyCauses: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  anomalyCausesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  anomalyCause: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  revenueGrid: {
    gap: 12,
  },
  revenueCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  revenueCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#EEF2FF',
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  revenueInfo: {
    flex: 1,
  },
  streamLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  revenueAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  revenueStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  growthPositive: {
    color: '#10B981',
  },
  growthNegative: {
    color: '#EF4444',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  projectionsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  projectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectionDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    width: 60,
  },
  projectionToday: {
    color: theme.colors.primary,
  },
  projectionBar: {
    flex: 1,
    height: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  projectionFill: {
    height: '100%',
    borderRadius: 4,
  },
  projectionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 60,
    textAlign: 'right',
  },
  projectionActual: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 8,
  },
  projectionNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 12,
  },
  transactionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 20,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  transactionStream: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
