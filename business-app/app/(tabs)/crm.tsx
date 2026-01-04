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
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  IndianRupee,
  Clock,
  Heart,
  AlertCircle,
  Star,
  Crown,
  Target,
  Send,
  UserPlus,
  Award,
  ChevronRight,
  Phone,
  MessageCircle,
  Trash2,
} from 'lucide-react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import {
  useCRMStore,
  type CustomerProfile,
  getSegmentColor,
  getSegmentLabel,
  formatCurrency,
  formatDate,
} from '../../store/crmStore';
import { notificationService } from '../../services/api/notificationService';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');

// Simplified Tabs - Removed Workflows
type TabName = 'customers' | 'segments' | 'messages';

export default function CRMScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const {
    customers,
    segments,
    campaigns: communications,
    initializeCustomers,
    refreshSegmentCounts,
    getTopCustomers,
    getAtRiskCustomers,
    isLoading,
  } = useCRMStore();

  const [activeTab, setActiveTab] = useState<TabName>('customers');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationAudience, setNotificationAudience] = useState<'all' | 'segment'>('all');
  const [selectedNotificationSegments, setSelectedNotificationSegments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const styles = getStyles(theme);

  useEffect(() => {
    initializeCustomers('merchant_coffee_house_123');
    refreshSegmentCounts();
  }, []);

  if (isLoading && !refreshing && customers.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeCustomers('merchant_coffee_house_123');
    await refreshSegmentCounts();
    setRefreshing(false);
  };

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      Alert.alert('Error', 'Please enter both title and message');
      return;
    }

    setSending(true);
    try {
      const response = await notificationService.sendNotification({
        title: notificationTitle,
        message: notificationMessage,
        audience: notificationAudience,
        targetSegments: notificationAudience === 'segment' ? selectedNotificationSegments : undefined,
      });

      // Reset form
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationAudience('all');
      setSelectedNotificationSegments([]);
      setShowNotificationModal(false);

      // Refresh communications list
      await onRefresh();

      // Check if any were actually sent
      if (response.notification.sentCount > 0) {
        Alert.alert('Success', `Notification sent to ${response.notification.sentCount} users!`);
      } else {
        Alert.alert('Warning', 'Notification processed but sent to 0 users. Check if users have push tokens registered.');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      Alert.alert('Error', `Failed to send notification: ${error.message || 'Unknown error'}`);
    } finally {
      setSending(false);
    }
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

  // Get top and at-risk customers
  const topCustomers = getTopCustomers(5);
  const atRisk = getAtRiskCustomers().slice(0, 5);

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
        <View style={[styles.statIcon, { backgroundColor: '#2ECC7120' }]}>
          <IndianRupee size={20} color="#2ECC71" />
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
            <IndianRupee size={14} color={theme.colors.primary} />
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
        </View>

        {/* Quick Actions - Simplified for Local Business */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
            <Phone size={16} color={theme.colors.primary} />
            <Text style={styles.actionTextSecondary}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => Linking.openURL(`sms:${customer.phone}`)}>
            <MessageCircle size={16} color={theme.colors.primary} />
            <Text style={styles.actionTextSecondary}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() => router.push({
              pathname: '/customer-detail' as any,
              params: { id: customer.id }
            })}>
            <Text style={styles.actionTextPrimary}>Details</Text>
            <ChevronRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

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
    </ScrollView>
  );

  const renderSegmentsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.segmentsContent}>
        <Text style={styles.tabTitle}>Customer Segments</Text>
        <Text style={styles.tabSubtitle}>Pre-built groups for easy targeting</Text>

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

            <TouchableOpacity style={styles.viewSegmentButton}>
              <Users size={14} color={theme.colors.primary} />
              <Text style={styles.viewSegmentText}>View Customers</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderMessagesTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.communicationsContent}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.tabTitle}>Message History</Text>
            <Text style={styles.tabSubtitle}>Past messages sent to customers</Text>
          </View>
          <TouchableOpacity
            style={styles.clearHistoryButton}
            onPress={() => {
              Alert.alert(
                'Clear History',
                'Are you sure you want to delete all notification history? This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await api.delete('/api/business/push-notifications');
                        // Refresh the list
                        useCRMStore.getState().initializeCustomers(useAuthStore.getState().user?.merchantId || '');
                        Alert.alert('Success', 'History cleared');
                      } catch (error: any) {
                        console.error('Clear history error:', error);
                        Alert.alert('Error', `Failed to clear history: ${error.message || 'Unknown error'}`);
                      }
                    }
                  }
                ]
              );
            }}>
            <Trash2 size={20} color="#E74C3C" />
          </TouchableOpacity>
        </View>

        {communications.length > 0 ? (
          communications.map(comm => (
            <TouchableOpacity
              key={comm.id}
              style={styles.communicationCard}
              onPress={() => {
                setNotificationTitle(comm.message.title);
                setNotificationMessage(comm.message.body);
                Alert.alert(
                  'Message Details',
                  `Title: ${comm.message.title}\n\nMessage: ${comm.message.body}\n\nStatus: ${comm.status.toUpperCase()}\nSent: ${comm.performance.sent}\nDelivered: ${comm.performance.delivered}`
                );
              }}
            >
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
                            : comm.status === 'failed'
                              ? '#E74C3C20'
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
                              : comm.status === 'failed'
                                ? '#E74C3C'
                                : theme.colors.textSecondary,
                      },
                    ]}>
                    {comm.status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Send size={48} color={theme.colors.textTertiary} />
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>
              Start engaging with your customers through targeted messages
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.createCommunicationButton}
          onPress={() => setShowNotificationModal(true)}>
          <Send size={20} color="#FFFFFF" />
          <Text style={styles.createCommunicationText}>New Message</Text>
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
        style={[styles.tab, activeTab === 'messages' && styles.tabActive]}
        onPress={() => setActiveTab('messages')}>
        <MessageCircle
          size={20}
          color={
            activeTab === 'messages' ? theme.colors.primary : theme.colors.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            activeTab === 'messages' && styles.tabTextActive,
          ]}>
          History
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {renderTabBar()}

      {activeTab === 'customers' && renderCustomersTab()}
      {activeTab === 'segments' && renderSegmentsTab()}
      {activeTab === 'messages' && renderMessagesTab()}

      {/* Notification Composer Modal */}
      <Modal
        visible={showNotificationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send Notification</Text>
              <TouchableOpacity onPress={() => setShowNotificationModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Title Input */}
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter notification title"
                placeholderTextColor={theme.colors.textTertiary}
                value={notificationTitle}
                onChangeText={setNotificationTitle}
                maxLength={100}
              />

              {/* Message Input */}
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter notification message"
                placeholderTextColor={theme.colors.textTertiary}
                value={notificationMessage}
                onChangeText={setNotificationMessage}
                multiline
                numberOfLines={4}
                maxLength={500}
              />

              {/* Audience Selector */}
              <Text style={styles.inputLabel}>Audience</Text>
              <View style={styles.audienceSelector}>
                <TouchableOpacity
                  style={[
                    styles.audienceOption,
                    notificationAudience === 'all' && styles.audienceOptionActive,
                  ]}
                  onPress={() => setNotificationAudience('all')}>
                  <Text
                    style={[
                      styles.audienceOptionText,
                      notificationAudience === 'all' && styles.audienceOptionTextActive,
                    ]}>
                    All Users
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.audienceOption,
                    notificationAudience === 'segment' && styles.audienceOptionActive,
                  ]}
                  onPress={() => setNotificationAudience('segment')}>
                  <Text
                    style={[
                      styles.audienceOptionText,
                      notificationAudience === 'segment' && styles.audienceOptionTextActive,
                    ]}>
                    By Segment
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Segment Selection */}
              {notificationAudience === 'segment' && (
                <View style={styles.segmentSelection}>
                  {['vip', 'regular', 'new', 'at_risk'].map(segment => (
                    <TouchableOpacity
                      key={segment}
                      style={[
                        styles.segmentOption,
                        selectedNotificationSegments.includes(segment) &&
                        styles.segmentOptionActive,
                      ]}
                      onPress={() => {
                        if (selectedNotificationSegments.includes(segment)) {
                          setSelectedNotificationSegments(
                            selectedNotificationSegments.filter(s => s !== segment)
                          );
                        } else {
                          setSelectedNotificationSegments([
                            ...selectedNotificationSegments,
                            segment,
                          ]);
                        }
                      }}>
                      <Text
                        style={[
                          styles.segmentOptionText,
                          selectedNotificationSegments.includes(segment) &&
                          styles.segmentOptionTextActive,
                        ]}>
                        {getSegmentLabel(segment as any)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Send Button */}
              <TouchableOpacity
                style={[styles.sendButton, sending && styles.sendButtonDisabled]}
                onPress={handleSendNotification}
                disabled={sending}>
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Send size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Notification</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    alignItems: 'center',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fontFamily.heading,
  },
  statLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: theme.colors.text,
    fontSize: 16,
    fontFamily: theme.fontFamily.primary,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  segmentFilter: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  segmentChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  segmentChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentChipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  segmentChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customerList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  customerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInitials: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.heading,
  },
  customerInfo: {
    flex: 1,
  },
  customerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  customerPhone: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  segmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  segmentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: theme.fontFamily.primary,
  },
  customerMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
    fontFamily: theme.fontFamily.primary,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    fontFamily: theme.fontFamily.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  actionTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: theme.fontFamily.primary,
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  actionTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
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
    fontFamily: theme.fontFamily.primary,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceLight,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontFamily: theme.fontFamily.primary,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  segmentsContent: {
    padding: 16,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  tabSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
    fontFamily: theme.fontFamily.primary,
  },
  segmentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  segmentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  segmentCardName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  segmentCardDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    maxWidth: '80%',
    fontFamily: theme.fontFamily.primary,
  },
  segmentCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  segmentCountText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: theme.fontFamily.primary,
  },
  viewSegmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  viewSegmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.primary,
  },
  communicationsContent: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  clearHistoryButton: {
    padding: 8,
  },
  communicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
  },
  communicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  communicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.fontFamily.heading,
  },
  communicationSegment: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  communicationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  communicationStatusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: theme.fontFamily.primary,
  },
  createCommunicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    marginTop: 16,
    gap: 8,
  },
  createCommunicationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: theme.fontFamily.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    fontFamily: theme.fontFamily.heading,
  },
  modalClose: {
    fontSize: 24,
    color: theme.colors.textSecondary,
    padding: 4,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    fontFamily: theme.fontFamily.primary,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    marginBottom: 20,
    fontFamily: theme.fontFamily.primary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  audienceSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  audienceOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.background,
  },
  audienceOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  audienceOptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontFamily: theme.fontFamily.primary,
  },
  audienceOptionTextActive: {
    color: '#FFFFFF',
  },
  segmentSelection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  segmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceLight,
    backgroundColor: theme.colors.background,
  },
  segmentOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  segmentOptionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.fontFamily.primary,
  },
  segmentOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.lg,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: theme.fontFamily.primary,
  },
});
