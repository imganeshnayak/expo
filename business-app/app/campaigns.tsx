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
import { useRouter } from 'expo-router';
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  Pause,
  Play,
  Copy,
  Archive,
  Edit,
  Eye,
  Rocket,
  Calendar,
  Clock,
  Lightbulb,
  ChevronRight,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import {
  useCampaignStore,
  type Campaign,
  getCampaignTypeLabel,
  getCampaignStatusColor,
  formatBudget,
  calculateBudgetPercentage,
} from '../store/campaignStore';

const { width } = Dimensions.get('window');

export default function CampaignsScreen() {
  const router = useRouter();
  const {
    campaigns,
    initializeCampaigns,
    pauseCampaign,
    resumeCampaign,
    archiveCampaign,
    duplicateCampaign,
    getAIOptimizations,
  } = useCampaignStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('active');

  useEffect(() => {
    initializeCampaigns('merchant_coffee_house_123');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeCampaigns('merchant_coffee_house_123');
    setRefreshing(false);
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const filteredCampaigns = selectedStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === selectedStatus);

  // Calculate aggregate metrics
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget.total, 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + c.budget.spent, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.performance.conversions, 0);
  const avgROI = campaigns.length > 0
    ? campaigns.reduce((sum, c) => sum + c.performance.roi, 0) / campaigns.length
    : 0;

  // ============================================================================
  // STATS OVERVIEW
  // ============================================================================

  const renderStatsOverview = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Rocket size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.statValue}>{activeCampaigns.length}</Text>
        <Text style={styles.statLabel}>Active Campaigns</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#2ECC7120' }]}>
          <TrendingUp size={20} color="#2ECC71" />
        </View>
        <Text style={styles.statValue}>{avgROI.toFixed(0)}%</Text>
        <Text style={styles.statLabel}>Avg ROI</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#F39C1220' }]}>
          <Users size={20} color="#F39C12" />
        </View>
        <Text style={styles.statValue}>{totalConversions}</Text>
        <Text style={styles.statLabel}>Conversions</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#E74C3C20' }]}>
          <DollarSign size={20} color="#E74C3C" />
        </View>
        <Text style={styles.statValue}>{formatBudget(totalRevenue)}</Text>
        <Text style={styles.statLabel}>Revenue</Text>
      </View>
    </View>
  );

  // ============================================================================
  // STATUS FILTER
  // ============================================================================

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      {(['all', 'active', 'paused', 'completed'] as const).map(status => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            selectedStatus === status && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedStatus(status)}>
          <Text
            style={[
              styles.filterButtonText,
              selectedStatus === status && styles.filterButtonTextActive,
            ]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
          <View style={[
            styles.filterBadge,
            selectedStatus === status && styles.filterBadgeActive,
          ]}>
            <Text style={[
              styles.filterBadgeText,
              selectedStatus === status && styles.filterBadgeTextActive,
            ]}>
              {status === 'all' ? campaigns.length :
               status === 'active' ? activeCampaigns.length :
               status === 'paused' ? pausedCampaigns.length :
               completedCampaigns.length}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ============================================================================
  // CAMPAIGN CARD
  // ============================================================================

  const renderCampaignCard = (campaign: Campaign) => {
    const optimizations = getAIOptimizations(campaign.id);
    const budgetPercentage = calculateBudgetPercentage(campaign.budget.spent, campaign.budget.total);

    return (
      <View key={campaign.id} style={styles.campaignCard}>
        {/* Header */}
        <View style={styles.campaignHeader}>
          <View style={styles.campaignHeaderLeft}>
            <Text style={styles.campaignName}>{campaign.name}</Text>
            <Text style={styles.campaignType}>{getCampaignTypeLabel(campaign.type)}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: `${getCampaignStatusColor(campaign.status)}20` },
          ]}>
            <Text style={[
              styles.statusText,
              { color: getCampaignStatusColor(campaign.status) },
            ]}>
              {campaign.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{campaign.performance.conversions}</Text>
            <Text style={styles.metricLabel}>Conversions</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{campaign.performance.roi}%</Text>
            <Text style={styles.metricLabel}>ROI</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatBudget(campaign.performance.revenue)}</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{campaign.performance.clickThroughRate}%</Text>
            <Text style={styles.metricLabel}>CTR</Text>
          </View>
        </View>

        {/* Budget Progress */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetLabel}>Budget Used</Text>
            <Text style={styles.budgetText}>
              {formatBudget(campaign.budget.spent)} / {formatBudget(campaign.budget.total)}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${budgetPercentage}%`,
                  backgroundColor: budgetPercentage > 90 ? '#E74C3C' : budgetPercentage > 70 ? '#F39C12' : theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={styles.budgetPercentage}>{budgetPercentage}% used</Text>
        </View>

        {/* AI Optimizations */}
        {optimizations.length > 0 && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Lightbulb size={16} color={theme.colors.primary} />
              <Text style={styles.aiTitle}>{optimizations.length} AI Recommendation{optimizations.length > 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.aiRecommendation}>
              <Text style={styles.aiRecommendationText}>{optimizations[0].description}</Text>
              <Text style={styles.aiImpact}>{optimizations[0].expectedImpact}</Text>
            </View>
            {optimizations.length > 1 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View all {optimizations.length} recommendations</Text>
                <ChevronRight size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionButtons}>
          {campaign.status === 'active' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pauseCampaign(campaign.id)}>
              <Pause size={16} color={theme.colors.text} />
              <Text style={styles.actionButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          {campaign.status === 'paused' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => resumeCampaign(campaign.id)}>
              <Play size={16} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Resume</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => duplicateCampaign(campaign.id)}>
            <Copy size={16} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Duplicate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {}}>
            <Eye size={16} color={theme.colors.text} />
            <Text style={styles.actionButtonText}>Details</Text>
          </TouchableOpacity>
          {campaign.status !== 'active' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => archiveCampaign(campaign.id)}>
              <Archive size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>Archive</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Rocket size={64} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>No campaigns yet</Text>
      <Text style={styles.emptyText}>
        Create your first campaign to start attracting and retaining customers
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/business/campaign-creator')}>
        <Plus size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Campaign</Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Campaigns</Text>
          <Text style={styles.headerSubtitle}>
            {activeCampaigns.length} active • {totalConversions} total conversions
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButtonHeader}
          onPress={() => router.push('/business/campaign-creator')}>
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }>
        {/* Stats Overview */}
        {campaigns.length > 0 && renderStatsOverview()}

        {/* Status Filter */}
        {campaigns.length > 0 && renderStatusFilter()}

        {/* Campaign List */}
        <View style={styles.campaignList}>
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map(renderCampaignCard)
          ) : campaigns.length === 0 ? (
            renderEmptyState()
          ) : (
            <View style={styles.emptyState}>
              <Target size={48} color={theme.colors.textTertiary} />
              <Text style={styles.emptyTitle}>No {selectedStatus} campaigns</Text>
              <Text style={styles.emptyText}>
                Try selecting a different filter or create a new campaign
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        {campaigns.length > 0 && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Zap size={20} color={theme.colors.primary} />
              <Text style={styles.tipsTitle}>Campaign Tips</Text>
            </View>
            <Text style={styles.tipText}>• Test multiple offers to find what resonates best with your audience</Text>
            <Text style={styles.tipText}>• Monitor ROI weekly and adjust budgets for top performers</Text>
            <Text style={styles.tipText}>• Use targeted campaigns for specific customer segments</Text>
            <Text style={styles.tipText}>• Set daily limits to control spending and test performance</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  createButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  filterBadgeActive: {
    backgroundColor: theme.colors.primary,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  campaignList: {
    padding: 20,
    paddingTop: 0,
  },
  campaignCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  campaignHeaderLeft: {
    flex: 1,
  },
  campaignName: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  campaignType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  budgetSection: {
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    textAlign: 'right',
  },
  aiSection: {
    backgroundColor: `${theme.colors.primary}10`,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  },
  aiRecommendation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiRecommendationText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  aiImpact: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tipsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
  },
});
