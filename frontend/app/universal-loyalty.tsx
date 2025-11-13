import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Plus,
  Search,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  Gift,
  Star,
  ChevronRight,
  Bell,
  Filter,
  Sparkles,
  Target,
  Zap,
  Info,
  X,
} from 'lucide-react-native';
import {
  useExternalLoyaltyStore,
  formatProgress,
  getProgressPercentage,
  formatExpiryDate,
  getCategoryIcon,
  getProgramTypeLabel,
  type ExternalLoyaltyProgram,
  type ProgramType,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

type TabName = 'all' | 'active' | 'expiring' | 'ready';
type FilterType = 'all' | 'stamps' | 'points' | 'tiers';

export default function UniversalLoyaltyScreen() {
  const router = useRouter();
  const {
    programs,
    reminders,
    insights,
    isLoading,
    fetchPrograms,
    updateProgress,
    redeemReward,
    markReminderRead,
    dismissReminder,
    getExpiringPrograms,
    getBestRedemptionOpportunities,
  } = useExternalLoyaltyStore();

  const [activeTab, setActiveTab] = useState<TabName>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showReminders, setShowReminders] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<ExternalLoyaltyProgram | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPrograms();
    setRefreshing(false);
  };

  // Filter programs based on active tab and search
  const getFilteredPrograms = (): ExternalLoyaltyProgram[] => {
    let filtered = programs;

    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(p => p.status === 'active');
    } else if (activeTab === 'expiring') {
      filtered = getExpiringPrograms();
    } else if (activeTab === 'ready') {
      filtered = getBestRedemptionOpportunities();
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.programType === filterType);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.merchantName.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.reward.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredPrograms = getFilteredPrograms();
  const unreadReminders = reminders.filter(r => !r.isRead);

  // ============================================================================
  // RENDER INSIGHTS DASHBOARD
  // ============================================================================
  const renderInsightsDashboard = () => {
    if (!insights) return null;

    return (
      <View style={{ padding: 16, backgroundColor: '#ffffff', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          <Sparkles color={theme.colors.primary} size={24} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#111827', marginLeft: 8 }}>
            Loyalty Insights
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, minWidth: width / 2 - 24, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Award color="#10b981" size={20} />
              <Text style={{ fontSize: 12, color: '#065f46', marginLeft: 6, fontWeight: '600' }}>
                Total Programs
              </Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#10b981' }}>
              {insights.totalPrograms}
            </Text>
          </View>

          <View style={{ flex: 1, minWidth: width / 2 - 24, backgroundColor: '#fef3c7', borderRadius: 12, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <TrendingUp color="#f59e0b" size={20} />
              <Text style={{ fontSize: 12, color: '#92400e', marginLeft: 6, fontWeight: '600' }}>
                Potential Savings
              </Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#f59e0b' }}>
              ₹{insights.totalPotentialSavings}
            </Text>
          </View>

          {insights.expiringPrograms > 0 && (
            <View style={{ flex: 1, minWidth: width / 2 - 24, backgroundColor: '#fee2e2', borderRadius: 12, padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Clock color="#ef4444" size={20} />
                <Text style={{ fontSize: 12, color: '#991b1b', marginLeft: 6, fontWeight: '600' }}>
                  Expiring Soon
                </Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#ef4444' }}>
                {insights.expiringPrograms}
              </Text>
            </View>
          )}
        </View>

        {/* Top Recommendation */}
        {insights.topRecommendation && (
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(37, 99, 235, 0.05)',
              borderRadius: 12,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            }}
            onPress={() => {
              const program = programs.find(p => p.id === insights.topRecommendation!.programId);
              if (program) setSelectedProgram(program);
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Zap color={theme.colors.primary} size={20} fill={theme.colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary, marginLeft: 6 }}>
                Top Recommendation
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 }}>
              {insights.topRecommendation.merchantName}
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>
              {insights.topRecommendation.reason}
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
              Estimated Value: ₹{insights.topRecommendation.estimatedValue}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ============================================================================
  // RENDER PROGRAM CARD
  // ============================================================================
  const renderProgramCard = (program: ExternalLoyaltyProgram) => {
    const progressPercentage = getProgressPercentage(program.currentProgress, program.requiredForReward);
    const isReady = program.currentProgress >= program.requiredForReward;
    const isExpiringSoon = program.status === 'near_expiry';

    return (
      <TouchableOpacity
        key={program.id}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: isExpiringSoon ? '#fca5a5' : '#e5e7eb',
        }}
        onPress={() => setSelectedProgram(program)}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#f3f4f6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 24 }}>{program.merchantLogo || getCategoryIcon(program.category)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>
              {program.merchantName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: '#6b7280', marginRight: 8 }}>
                {getProgramTypeLabel(program.programType)}
              </Text>
              {program.isManual && (
                <View style={{ backgroundColor: '#dbeafe', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ fontSize: 10, color: '#1e40af', fontWeight: '600' }}>MANUAL</Text>
                </View>
              )}
            </View>
          </View>
          {isReady && (
            <View style={{ backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#166534' }}>Ready!</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              {formatProgress(program.currentProgress, program.requiredForReward, program.programType)}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
            <View
              style={{
                height: '100%',
                width: `${progressPercentage}%`,
                backgroundColor: isReady ? '#10b981' : theme.colors.primary,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        {/* Reward */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Gift color="#9ca3af" size={16} />
          <Text style={{ fontSize: 14, color: '#111827', marginLeft: 6, flex: 1 }}>
            {program.reward}
          </Text>
        </View>

        {/* Expiration */}
        {program.expirationDate && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {isExpiringSoon ? (
              <AlertCircle color="#ef4444" size={16} />
            ) : (
              <Clock color="#9ca3af" size={16} />
            )}
            <Text
              style={{
                fontSize: 12,
                color: isExpiringSoon ? '#ef4444' : '#6b7280',
                marginLeft: 6,
                fontWeight: isExpiringSoon ? '600' : '400',
              }}
            >
              {formatExpiryDate(program.expirationDate)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // ============================================================================
  // RENDER PROGRAM DETAIL MODAL
  // ============================================================================
  const renderProgramDetailModal = () => {
    if (!selectedProgram) return null;

    const isReady = selectedProgram.currentProgress >= selectedProgram.requiredForReward;
    const progressPercentage = getProgressPercentage(
      selectedProgram.currentProgress,
      selectedProgram.requiredForReward
    );

    return (
      <Modal visible={!!selectedProgram} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' }}>
            <ScrollView>
              {/* Header */}
              <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                <TouchableOpacity
                  style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
                  onPress={() => setSelectedProgram(null)}
                >
                  <X color="#6b7280" size={24} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: '#f3f4f6',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 32 }}>
                      {selectedProgram.merchantLogo || getCategoryIcon(selectedProgram.category)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                      {selectedProgram.merchantName}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                      {selectedProgram.category} • {getProgramTypeLabel(selectedProgram.programType)}
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={{ backgroundColor: '#f9fafb', borderRadius: 12, padding: 16 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
                    Current Progress
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>
                      {selectedProgram.currentProgress}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#6b7280', alignSelf: 'flex-end' }}>
                      of {selectedProgram.requiredForReward} required
                    </Text>
                  </View>
                  <View style={{ height: 12, backgroundColor: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
                    <View
                      style={{
                        height: '100%',
                        width: `${progressPercentage}%`,
                        backgroundColor: isReady ? '#10b981' : theme.colors.primary,
                        borderRadius: 6,
                      }}
                    />
                  </View>
                </View>
              </View>

              {/* Reward Info */}
              <View style={{ padding: 20 }}>
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                    YOUR REWARD
                  </Text>
                  <View
                    style={{
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: 12,
                      padding: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <Gift color="#10b981" size={24} />
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 12, flex: 1 }}>
                      {selectedProgram.reward}
                    </Text>
                  </View>
                </View>

                {/* Expiration */}
                {selectedProgram.expirationDate && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                      EXPIRATION
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Clock color="#6b7280" size={20} />
                      <Text style={{ fontSize: 14, color: '#111827', marginLeft: 8 }}>
                        {formatExpiryDate(selectedProgram.expirationDate)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Card Number */}
                {selectedProgram.cardNumber && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                      CARD NUMBER
                    </Text>
                    <Text style={{ fontSize: 14, color: '#111827' }}>{selectedProgram.cardNumber}</Text>
                  </View>
                )}

                {/* Notes */}
                {selectedProgram.notes && (
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#6b7280', marginBottom: 8 }}>
                      NOTES
                    </Text>
                    <Text style={{ fontSize: 14, color: '#111827' }}>{selectedProgram.notes}</Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={{ gap: 12 }}>
                  {isReady && (
                    <TouchableOpacity
                      style={{
                        backgroundColor: '#10b981',
                        borderRadius: 12,
                        padding: 16,
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        redeemReward(selectedProgram.id);
                        setSelectedProgram(null);
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
                        Redeem Reward
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: 12,
                      padding: 16,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      // Navigate to edit screen
                      router.push({
                        pathname: '/loyalty' as any,
                        params: { programId: selectedProgram.id },
                      } as any);
                      setSelectedProgram(null);
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#ffffff' }}>
                      Update Progress
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================================
  // RENDER REMINDERS MODAL
  // ============================================================================
  const renderRemindersModal = () => {
    return (
      <Modal visible={showReminders} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' }}>
            <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>
                  Loyalty Reminders ({reminders.length})
                </Text>
                <TouchableOpacity onPress={() => setShowReminders(false)}>
                  <X color="#6b7280" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {reminders.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Bell color="#d1d5db" size={48} />
                  <Text style={{ fontSize: 16, color: '#9ca3af', marginTop: 12 }}>
                    No reminders
                  </Text>
                </View>
              ) : (
                reminders.map(reminder => (
                  <View
                    key={reminder.id}
                    style={{
                      backgroundColor: reminder.isRead ? '#ffffff' : '#f0fdf4',
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: reminder.isRead ? '#e5e7eb' : '#86efac',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827', flex: 1 }}>
                        {reminder.merchantName}
                      </Text>
                      <TouchableOpacity onPress={() => dismissReminder(reminder.id)}>
                        <X color="#9ca3af" size={16} />
                      </TouchableOpacity>
                    </View>
                    <Text style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                      {reminder.message}
                    </Text>
                    {!reminder.isRead && (
                      <TouchableOpacity onPress={() => markReminderRead(reminder.id)}>
                        <Text style={{ fontSize: 12, color: theme.colors.primary, fontWeight: '600' }}>
                          Mark as read
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // ============================================================================
  // RENDER MAIN UI
  // ============================================================================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
            Universal Loyalty
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{ position: 'relative' }}
              onPress={() => setShowReminders(true)}
            >
              <Bell color="#6b7280" size={24} />
              {unreadReminders.length > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#ef4444',
                    borderRadius: 10,
                    width: 20,
                    height: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#ffffff' }}>
                    {unreadReminders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/loyalty' as any)}>
              <Plus color={theme.colors.primary} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: 12,
            paddingHorizontal: 12,
            marginBottom: 12,
          }}
        >
          <Search color="#9ca3af" size={20} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search programs..."
            placeholderTextColor="#9ca3af"
            style={{
              flex: 1,
              padding: 12,
              fontSize: 16,
              color: '#111827',
            }}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {(['all', 'stamps', 'points', 'tiers'] as FilterType[]).map(type => (
            <TouchableOpacity
              key={type}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: filterType === type ? theme.colors.primary : '#f3f4f6',
              }}
              onPress={() => setFilterType(type)}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: filterType === type ? '#ffffff' : '#6b7280',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'all' ? 'All Types' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Insights Dashboard */}
        {renderInsightsDashboard()}

        {/* Tabs */}
        <View style={{ backgroundColor: '#ffffff', padding: 16, marginBottom: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {([
              { key: 'all', label: 'All Programs', count: programs.length },
              { key: 'active', label: 'Active', count: programs.filter(p => p.status === 'active').length },
              { key: 'expiring', label: 'Expiring', count: getExpiringPrograms().length },
              { key: 'ready', label: 'Ready to Redeem', count: getBestRedemptionOpportunities().length },
            ] as { key: TabName; label: string; count: number }[]).map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab.key ? theme.colors.primary : '#f3f4f6',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: activeTab === tab.key ? '#ffffff' : '#6b7280',
                  }}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={{
                      backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: activeTab === tab.key ? '#ffffff' : '#6b7280',
                      }}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Programs List */}
        <View style={{ padding: 16 }}>
          {filteredPrograms.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Award color="#d1d5db" size={64} />
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#9ca3af', marginTop: 16 }}>
                No programs found
              </Text>
              <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Add your first loyalty program to get started'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 20,
                    marginTop: 16,
                  }}
                  onPress={() => router.push('/loyalty' as any)}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#ffffff' }}>
                    Add Loyalty Program
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredPrograms.map(program => renderProgramCard(program))
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {renderProgramDetailModal()}
      {renderRemindersModal()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        onPress={() => router.push('/loyalty' as any)}
      >
        <Plus color="#ffffff" size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
