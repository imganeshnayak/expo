import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import CampaignCreatorModal from './campaign-creator-modal';
import {
  Plus,
  TrendingUp,
  Users,
  IndianRupee,
  Target,
  Zap,
  Pause,
  Play,
  Copy,
  Archive,
  Eye,
  Rocket,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { BusinessHeader } from '../../components/BusinessHeader';
import {
  useCampaignStore,
  type Campaign,
  getCampaignTypeLabel,
  getCampaignStatusColor,
  formatBudget,
  calculateBudgetPercentage,
} from '../../store/campaignStore';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

export default function CampaignsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const theme = useAppTheme();
  const {
    campaigns,
    templates,
    initializeCampaigns,
    loadTemplates,
    pauseCampaign,
    resumeCampaign,
    archiveCampaign,
    duplicateCampaign,
    isLoading,
  } = useCampaignStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'paused' | 'completed'>('active');
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const styles = getStyles(theme);

  useEffect(() => {
    if (user?.merchantId) {
      initializeCampaigns(user.merchantId);
      loadTemplates();
    }
  }, [user?.merchantId]);

  if (isLoading && !refreshing && campaigns.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const onRefresh = async () => {
    if (user?.merchantId) {
      setRefreshing(true);
      await initializeCampaigns(user.merchantId);
      setRefreshing(false);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const filteredCampaigns = selectedStatus === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === selectedStatus);

  // Calculate aggregate metrics
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.performance.revenue, 0);

  // ============================================================================
  // STATS OVERVIEW - SIMPLIFIED
  // ============================================================================

  const renderStatsOverview = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Rocket size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.statValue}>{activeCampaigns.length}</Text>
        <Text style={styles.statLabel}>Active Promotions</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#2ECC7120' }]}>
          <IndianRupee size={24} color="#2ECC71" />
        </View>
        <Text style={styles.statValue}>{formatBudget(totalRevenue)}</Text>
        <Text style={styles.statLabel}>Total Revenue</Text>
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
  // CAMPAIGN CARD - SIMPLIFIED
  // ============================================================================

  const renderCampaignCard = (campaign: Campaign) => {
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

        {/* Simplified Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{formatBudget(campaign.performance.revenue)}</Text>
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>{campaign.performance.conversions}</Text>
            <Text style={styles.metricLabel}>Orders</Text>
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
        </View>

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
      <Text style={styles.emptyTitle}>No promotions yet</Text>
      <Text style={styles.emptyText}>
        Create your first promotion to start engaging customers
      </Text>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <BusinessHeader title="Promotions" />
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
              <Text style={styles.emptyTitle}>No {selectedStatus} promotions</Text>
              <Text style={styles.emptyText}>
                Try selecting a different filter or create a new promotion
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        {campaigns.length > 0 && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Zap size={20} color={theme.colors.primary} />
              <Text style={styles.tipsTitle}>Quick Tips</Text>
            </View>
            <View>
              <Text style={styles.tipText}>• Active campaigns perform 2.5x better with clear images</Text>
              <Text style={styles.tipText}>• Try running flash sales on weekends for better engagement</Text>
            </View>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCampaignModal(true)}>
        <Plus size={30} color="#FFFFFF" />
      </TouchableOpacity>

      {user?.merchantId && (
        <CampaignCreatorModal
          visible={showCampaignModal}
          onClose={() => setShowCampaignModal(false)}
          merchantId={user.merchantId}
        />
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.heading,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontFamily: theme.fontFamily.primary,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontFamily: theme.fontFamily.primary,
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
    borderColor: theme.colors.surfaceLight,
  },
  filterButtonActive: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
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
    fontFamily: theme.fontFamily.primary,
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
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
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
    fontFamily: theme.fontFamily.heading,
  },
  campaignType: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
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
    fontFamily: theme.fontFamily.primary,
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
    fontFamily: theme.fontFamily.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
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
    fontFamily: theme.fontFamily.primary,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.primary,
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
    backgroundColor: theme.colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.primary,
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
    fontFamily: theme.fontFamily.heading,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    fontFamily: theme.fontFamily.primary,
  },
  tipsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
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
    fontFamily: theme.fontFamily.heading,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: 6,
    fontFamily: theme.fontFamily.primary,
  },
});
