import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Heart,
  AlertCircle,
  Star,
  Crown,
  Target,
  Send,
  UserPlus,
  Award,
  Calendar,
  ChevronRight,
  MessageSquare,
  Gift,
} from 'lucide-react-native';
import { theme } from '../constants/theme';
import {
  useCRMStore,
  type CustomerProfile,
  getSegmentColor,
  getSegmentLabel,
  formatCurrency,
  formatDate,
} from '../store/crmStore';

const { width } = Dimensions.get('window');

type TabName = 'customers' | 'segments' | 'communications' | 'workflows';

export default function CRMScreen() {
  const router = useRouter();
  const {
    customers,
    segments,
    campaigns: communications,
    workflows,
    initializeCustomers,
    refreshSegmentCounts,
    getTopCustomers,
    getAtRiskCustomers,
    getCustomersInSegment,
  } = useCRMStore();

  const [activeTab, setActiveTab] = useState<TabName>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeCustomers('merchant_coffee_house_123');
    refreshSegmentCounts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeCustomers('merchant_coffee_house_123');
    await refreshSegmentCounts();
    setRefreshing(false);
  };

  // Filter customers by search and segment
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchQuery
      ? (customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery))
      : true;
    const matchesSegment = selectedSegment === 'all' || customer.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  // Calculate aggregate metrics
  const totalCustomers = customers.length;
  const vipCustomers = customers.filter(c => c.segment === 'vip').length;
  const atRiskCustomers = customers.filter(c => c.segment === 'at_risk').length;
  const totalLTV = customers.reduce((sum, c) => sum + c.lifetimeValue, 0);
  const avgLTV = totalCustomers > 0 ? totalLTV / totalCustomers : 0;
  const activeCustomers = customers.filter(c => (Date.now() - c.lastVisit) / (24 * 60 * 60 * 1000) <= 14).length;

  // Get top and at-risk customers
  const topCustomers = getTopCustomers(5);
  const atRisk = getAtRiskCustomers().slice(0, 5);

  // ============================================================================
  // HEADER WITH STATS
  // ============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.headerTitle}>CRM</Text>
        <Text style={styles.headerSubtitle}>
          {totalCustomers} customers • ₹{(totalLTV / 1000).toFixed(0)}K total LTV
        </Text>
      </View>
      <TouchableOpacity style={styles.addButton}>
        <UserPlus size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // STATS OVERVIEW
  // ============================================================================

  const renderStatsOverview = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
          <Users size={20} color={theme.colors.primary} />
        </View>
        <Text style={styles.statValue}>{totalCustomers}</Text>
        <Text style={styles.statLabel}>Total Customers</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#F39C1220' }]}>
          <Crown size={20} color="#F39C12" />
        </View>
        <Text style={styles.statValue}>{vipCustomers}</Text>
        <Text style={styles.statLabel}>VIP</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#E74C3C20' }]}>
          <AlertCircle size={20} color="#E74C3C" />
        </View>
        <Text style={styles.statValue}>{atRiskCustomers}</Text>
        <Text style={styles.statLabel}>At Risk</Text>
      </View>

      <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: '#2ECC7120' }]}>
          <DollarSign size={20} color="#2ECC71" />
        </View>
        <Text style={styles.statValue}>₹{(avgLTV / 1000).toFixed(1)}K</Text>
        <Text style={styles.statLabel}>Avg LTV</Text>
      </View>
    </View>
  );

  // ============================================================================
  // SEARCH & FILTERS
  // ============================================================================

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Search size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search customers..."
          placeholderTextColor={theme.colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <TouchableOpacity style={styles.filterButton}>
        <Filter size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSegmentFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.segmentFilter}>
      <TouchableOpacity
        style={[
          styles.segmentChip,
          selectedSegment === 'all' && styles.segmentChipActive,
        ]}
        onPress={() => setSelectedSegment('all')}>
        <Text
          style={[
            styles.segmentChipText,
            selectedSegment === 'all' && styles.segmentChipTextActive,
          ]}>
          All ({totalCustomers})
        </Text>
      </TouchableOpacity>

      {['vip', 'regular', 'new', 'at_risk'].map(segment => {
        const count = customers.filter(c => c.segment === segment).length;
        return (
          <TouchableOpacity
            key={segment}
            style={[
              styles.segmentChip,
              selectedSegment === segment && styles.segmentChipActive,
              selectedSegment === segment && {
                backgroundColor: `${getSegmentColor(segment as any)}20`,
                borderColor: getSegmentColor(segment as any),
              },
            ]}
            onPress={() => setSelectedSegment(segment)}>
            <Text
              style={[
                styles.segmentChipText,
                selectedSegment === segment && {
                  color: getSegmentColor(segment as any),
                  fontWeight: '600',
                },
              ]}>
              {getSegmentLabel(segment as any)} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ============================================================================
  // CUSTOMER CARD
  // ============================================================================

  const renderCustomerCard = (customer: CustomerProfile) => {
    const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit) / (24 * 60 * 60 * 1000));
    const isAtRisk = daysSinceLastVisit > 14;
    const isVIP = customer.segment === 'vip';

    return (
      <TouchableOpacity
        key={customer.id}
        style={styles.customerCard}
        onPress={() => {
          // Navigate to customer detail view
        }}>
        {/* Header */}
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerInitials}>
              {(customer.name || customer.phone.slice(-4))
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <View style={styles.customerNameRow}>
              <Text style={styles.customerName}>{customer.name}</Text>
              {isVIP && <Crown size={16} color="#F39C12" />}
            </View>
            <Text style={styles.customerPhone}>{customer.phone}</Text>
          </View>
          <View
            style={[
              styles.segmentBadge,
              { backgroundColor: `${getSegmentColor(customer.segment)}20` },
            ]}>
            <Text
              style={[
                styles.segmentBadgeText,
                { color: getSegmentColor(customer.segment) },
              ]}>
              {getSegmentLabel(customer.segment).toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.customerMetrics}>
          <View style={styles.metricItem}>
            <DollarSign size={14} color={theme.colors.primary} />
            <Text style={styles.metricValue}>{formatCurrency(customer.lifetimeValue)}</Text>
            <Text style={styles.metricLabel}>LTV</Text>
          </View>
          <View style={styles.metricItem}>
            <Target size={14} color="#2ECC71" />
            <Text style={styles.metricValue}>{customer.visitCount}</Text>
            <Text style={styles.metricLabel}>Visits</Text>
          </View>
          <View style={styles.metricItem}>
            <Clock size={14} color={isAtRisk ? '#E74C3C' : theme.colors.textSecondary} />
            <Text style={[styles.metricValue, isAtRisk && { color: '#E74C3C' }]}>
              {daysSinceLastVisit}d
            </Text>
            <Text style={styles.metricLabel}>Since Last</Text>
          </View>
          <View style={styles.metricItem}>
            <Award size={14} color="#F39C12" />
            <Text style={styles.metricValue}>
              {customer.stampCards.active.length + customer.stampCards.completed.length}
            </Text>
            <Text style={styles.metricLabel}>Cards</Text>
          </View>
        </View>

        {/* Favorite Items */}
        {customer.favoriteItems.length > 0 && (
          <View style={styles.favoriteItems}>
            <Heart size={12} color="#E74C3C" />
            <Text style={styles.favoriteText}>
              {customer.favoriteItems.slice(0, 2).join(', ')}
              {customer.favoriteItems.length > 2 && ` +${customer.favoriteItems.length - 2}`}
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MessageSquare size={14} color={theme.colors.primary} />
            <Text style={styles.actionText}>Message</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Gift size={14} color="#F39C12" />
            <Text style={styles.actionText}>Reward</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
              pathname: '/business/customer-detail' as any,
              params: { id: customer.id }
            })}>
            <ChevronRight size={14} color={theme.colors.textSecondary} />
            <Text style={styles.actionText}>Details</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // INSIGHTS SECTION
  // ============================================================================

  const renderInsights = () => (
    <View style={styles.insightsSection}>
      <Text style={styles.sectionTitle}>Customer Insights</Text>

      {/* Top Customers */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Star size={18} color="#F39C12" />
          <Text style={styles.insightTitle}>Top Customers</Text>
        </View>
        {topCustomers.slice(0, 3).map((customer, index) => (
          <View key={customer.id} style={styles.insightRow}>
            <View style={styles.insightRank}>
              <Text style={styles.insightRankText}>{index + 1}</Text>
            </View>
            <Text style={styles.insightName}>{customer.name}</Text>
            <Text style={styles.insightValue}>{formatCurrency(customer.lifetimeValue)}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all top customers</Text>
          <ChevronRight size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* At Risk Customers */}
      {atRisk.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <AlertCircle size={18} color="#E74C3C" />
            <Text style={styles.insightTitle}>At Risk</Text>
          </View>
          {atRisk.slice(0, 3).map(customer => (
            <View key={customer.id} style={styles.insightRow}>
              <Text style={styles.insightName}>{customer.name || customer.phone}</Text>
              <Text style={[styles.insightValue, { color: '#E74C3C' }]}>
                {Math.floor((Date.now() - customer.lastVisit) / (24 * 60 * 60 * 1000))} days
              </Text>
            </View>
          ))}
          <TouchableOpacity style={styles.winBackButton}>
            <Send size={14} color="#FFFFFF" />
            <Text style={styles.winBackText}>Send Win-Back Campaign</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Segment Performance */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <TrendingUp size={18} color="#2ECC71" />
          <Text style={styles.insightTitle}>Segment Performance</Text>
        </View>
        {segments.slice(0, 3).map(segment => (
          <View key={segment.id} style={styles.segmentRow}>
            <View
              style={[
                styles.segmentDot,
                { backgroundColor: getSegmentColor(segment.name.toLowerCase() as any) },
              ]}
            />
            <View style={styles.segmentRowContent}>
              <Text style={styles.segmentRowName}>{segment.name}</Text>
              <Text style={styles.segmentRowStats}>
                {segment.customerCount} customers • {formatCurrency(segment.averageLTV)} avg LTV
              </Text>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => setActiveTab('segments')}>
          <Text style={styles.viewAllText}>Manage segments</Text>
          <ChevronRight size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================================
  // TABS CONTENT
  // ============================================================================

  const renderCustomersTab = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
        />
      }>
      {renderStatsOverview()}
      {renderSearchBar()}
      {renderSegmentFilter()}

      <View style={styles.customerList}>
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(renderCustomerCard)
        ) : (
          <View style={styles.emptyState}>
            <Users size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No customers found</Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search term'
                : 'Customers will appear here as they make purchases'}
            </Text>
          </View>
        )}
      </View>

      {filteredCustomers.length > 0 && renderInsights()}
    </ScrollView>
  );

  const renderSegmentsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.segmentsContent}>
        <Text style={styles.tabTitle}>Customer Segments</Text>
        <Text style={styles.tabSubtitle}>Organize customers for targeted campaigns</Text>

        {segments.map(segment => (
          <TouchableOpacity key={segment.id} style={styles.segmentCard}>
            <View style={styles.segmentCardHeader}>
              <View>
                <Text style={styles.segmentCardName}>{segment.name}</Text>
                <Text style={styles.segmentCardDescription}>{segment.description}</Text>
              </View>
              <View
                style={[
                  styles.segmentCountBadge,
                  { backgroundColor: `${getSegmentColor(segment.name.toLowerCase() as any)}20` },
                ]}>
                <Text
                  style={[
                    styles.segmentCountText,
                    { color: getSegmentColor(segment.name.toLowerCase() as any) },
                  ]}>
                  {segment.customerCount}
                </Text>
              </View>
            </View>

            <View style={styles.segmentCardMetrics}>
              <View style={styles.segmentCardMetric}>
                <Text style={styles.segmentCardMetricLabel}>Avg LTV</Text>
                <Text style={styles.segmentCardMetricValue}>
                  {formatCurrency(segment.averageLTV)}
                </Text>
              </View>
              <View style={styles.segmentCardMetric}>
                <Text style={styles.segmentCardMetricLabel}>Updated</Text>
                <Text style={styles.segmentCardMetricValue}>
                  {formatDate(segment.lastUpdated)}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewSegmentButton}>
              <Users size={14} color={theme.colors.primary} />
              <Text style={styles.viewSegmentText}>View Customers</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.createSegmentButton}>
          <Target size={20} color="#FFFFFF" />
          <Text style={styles.createSegmentText}>Create New Segment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderCommunicationsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.communicationsContent}>
        <Text style={styles.tabTitle}>Communications</Text>
        <Text style={styles.tabSubtitle}>Message center and campaign history</Text>

        {communications.length > 0 ? (
          communications.map(comm => (
            <View key={comm.id} style={styles.communicationCard}>
              <View style={styles.communicationHeader}>
                <View>
                  <Text style={styles.communicationTitle}>{comm.message.title}</Text>
                  <Text style={styles.communicationSegment}>
                    To: {comm.segmentIds.length === 0 ? 'All Customers' : `${comm.segmentIds.length} Segment(s)`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.communicationStatusBadge,
                    {
                      backgroundColor:
                        comm.status === 'sent'
                          ? '#2ECC7120'
                          : comm.status === 'scheduled'
                          ? '#F39C1220'
                          : theme.colors.surfaceLight,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.communicationStatusText,
                      {
                        color:
                          comm.status === 'sent'
                            ? '#2ECC71'
                            : comm.status === 'scheduled'
                            ? '#F39C12'
                            : theme.colors.textSecondary,
                      },
                    ]}>
                    {comm.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {comm.performance && (
                <View style={styles.communicationMetrics}>
                  <View style={styles.communicationMetric}>
                    <Text style={styles.communicationMetricValue}>
                      {comm.performance.sent}
                    </Text>
                    <Text style={styles.communicationMetricLabel}>Sent</Text>
                  </View>
                  <View style={styles.communicationMetric}>
                    <Text style={styles.communicationMetricValue}>
                      {comm.performance.opened}
                    </Text>
                    <Text style={styles.communicationMetricLabel}>Opened</Text>
                  </View>
                  <View style={styles.communicationMetric}>
                    <Text style={styles.communicationMetricValue}>
                      {comm.performance.clicked}
                    </Text>
                    <Text style={styles.communicationMetricLabel}>Clicked</Text>
                  </View>
                  <View style={styles.communicationMetric}>
                    <Text style={styles.communicationMetricValue}>
                      {comm.performance.converted}
                    </Text>
                    <Text style={styles.communicationMetricLabel}>Converted</Text>
                  </View>
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Send size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No communications yet</Text>
            <Text style={styles.emptyText}>
              Start engaging with your customers through targeted messages
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.createCommunicationButton}>
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.createCommunicationText}>New Communication</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderWorkflowsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.workflowsContent}>
        <Text style={styles.tabTitle}>Automated Workflows</Text>
        <Text style={styles.tabSubtitle}>Customer journey automation</Text>

        {workflows.map(workflow => (
          <View key={workflow.id} style={styles.workflowCard}>
            <View style={styles.workflowHeader}>
              <View>
                <Text style={styles.workflowName}>{workflow.name}</Text>
                <Text style={styles.workflowDescription}>{workflow.type.replace('_', ' ').toUpperCase()}</Text>
              </View>
              <View
                style={[
                  styles.workflowStatusBadge,
                  {
                    backgroundColor: workflow.enabled ? '#2ECC7120' : theme.colors.surfaceLight,
                  },
                ]}>
                <Text
                  style={[
                    styles.workflowStatusText,
                    { color: workflow.enabled ? '#2ECC71' : theme.colors.textSecondary },
                  ]}>
                  {workflow.enabled ? 'ACTIVE' : 'PAUSED'}
                </Text>
              </View>
            </View>

            <View style={styles.workflowMetrics}>
              <View style={styles.workflowMetric}>
                <Text style={styles.workflowMetricValue}>
                  {workflow.performance.triggered}
                </Text>
                <Text style={styles.workflowMetricLabel}>Triggered</Text>
              </View>
              <View style={styles.workflowMetric}>
                <Text style={styles.workflowMetricValue}>
                  {workflow.performance.converted}
                </Text>
                <Text style={styles.workflowMetricLabel}>Converted</Text>
              </View>
              <View style={styles.workflowMetric}>
                <Text style={[styles.workflowMetricValue, { color: theme.colors.primary }]}>
                  {workflow.performance.triggered > 0
                    ? Math.round(
                        (workflow.performance.converted / workflow.performance.triggered) * 100
                      )
                    : 0}
                  %
                </Text>
                <Text style={styles.workflowMetricLabel}>Conv Rate</Text>
              </View>
              <View style={styles.workflowMetric}>
                <Text style={[styles.workflowMetricValue, { color: '#2ECC71' }]}>
                  {formatCurrency(workflow.performance.revenue)}
                </Text>
                <Text style={styles.workflowMetricLabel}>Revenue</Text>
              </View>
            </View>

            <View style={styles.workflowActions}>
              <TouchableOpacity style={styles.workflowActionButton}>
                <Text style={styles.workflowActionText}>
                  {workflow.enabled ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.workflowActionButton}>
                <Text style={styles.workflowActionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.workflowActionButton}>
                <Text style={styles.workflowActionText}>Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.createWorkflowButton}>
          <Target size={20} color="#FFFFFF" />
          <Text style={styles.createWorkflowText}>Create Workflow</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ============================================================================
  // TAB BAR
  // ============================================================================

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'customers' && styles.tabActive]}
        onPress={() => setActiveTab('customers')}>
        <Users
          size={20}
          color={activeTab === 'customers' ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'customers' && styles.tabTextActive,
          ]}>
          Customers
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'segments' && styles.tabActive]}
        onPress={() => setActiveTab('segments')}>
        <Target
          size={20}
          color={activeTab === 'segments' ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'segments' && styles.tabTextActive,
          ]}>
          Segments
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'communications' && styles.tabActive]}
        onPress={() => setActiveTab('communications')}>
        <Send
          size={20}
          color={
            activeTab === 'communications' ? theme.colors.primary : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'communications' && styles.tabTextActive,
          ]}>
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'workflows' && styles.tabActive]}
        onPress={() => setActiveTab('workflows')}>
        <Target
          size={20}
          color={activeTab === 'workflows' ? theme.colors.primary : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'workflows' && styles.tabTextActive,
          ]}>
          Workflows
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabBar()}

      {activeTab === 'customers' && renderCustomersTab()}
      {activeTab === 'segments' && renderSegmentsTab()}
      {activeTab === 'communications' && renderCommunicationsTab()}
      {activeTab === 'workflows' && renderWorkflowsTab()}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 12,
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
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: theme.colors.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  segmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentChipActive: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  segmentChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  segmentChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  customerList: {
    padding: 20,
    paddingTop: 0,
  },
  customerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  customerPhone: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  segmentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segmentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  customerMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  favoriteItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E74C3C10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  favoriteText: {
    fontSize: 12,
    color: theme.colors.text,
  },
  quickActions: {
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
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.text,
  },
  insightsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  winBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  winBackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  segmentDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  segmentRowContent: {
    flex: 1,
  },
  segmentRowName: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 2,
  },
  segmentRowStats: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  segmentsContent: {
    padding: 20,
  },
  tabTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  segmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  segmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  segmentCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  segmentCardDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  segmentCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  segmentCountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  segmentCardMetrics: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 12,
  },
  segmentCardMetric: {
    flex: 1,
  },
  segmentCardMetricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  segmentCardMetricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  viewSegmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: 10,
    borderRadius: 8,
  },
  viewSegmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  createSegmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  createSegmentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  communicationsContent: {
    padding: 20,
  },
  communicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  communicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  communicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  communicationSegment: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  communicationStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  communicationStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  communicationMetrics: {
    flexDirection: 'row',
  },
  communicationMetric: {
    flex: 1,
    alignItems: 'center',
  },
  communicationMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  communicationMetricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  createCommunicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  createCommunicationText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  workflowsContent: {
    padding: 20,
  },
  workflowCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  workflowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  workflowName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  workflowStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  workflowStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  workflowMetrics: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  workflowMetric: {
    flex: 1,
    alignItems: 'center',
  },
  workflowMetricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  workflowMetricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  workflowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  workflowActionButton: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  workflowActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  createWorkflowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  createWorkflowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
