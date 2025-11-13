import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useExternalLoyaltyStore,
  ExternalLoyaltyProgram,
  LoyaltyTemplate,
  ProgramType,
} from '../store/externalLoyaltyStore';
import { theme } from '../constants/theme';

const primaryColor = theme.colors.primary;

export default function LoyaltyManagementScreen() {
  const router = useRouter();
  const {
    programs,
    templates,
    insights,
    reminders,
    calculateInsights,
    generateReminders,
    getTotalPortfolioValue,
    getExpiringPrograms,
    getBestRedemptionOpportunities,
    getProximityAlerts,
    markReminderRead,
    addProgram,
    createFromTemplate,
  } = useExternalLoyaltyStore();

  const [activeTab, setActiveTab] = useState<'portfolio' | 'reminders' | 'add'>('portfolio');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProgramDetail, setShowProgramDetail] = useState<ExternalLoyaltyProgram | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    calculateInsights();
    generateReminders();
  }, []);

  const portfolioValue = getTotalPortfolioValue();
  const expiringPrograms = getExpiringPrograms();
  const bestOpportunities = getBestRedemptionOpportunities();
  const unreadReminders = reminders.filter(r => !r.isRead);

  const filteredPrograms = searchQuery
    ? programs.filter(p =>
        p.merchantName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : programs;

  const PortfolioHeader = () => (
    <View style={styles.portfolioHeader}>
      <View style={styles.valueCard}>
        <Text style={styles.valueLabel}>Total Portfolio Value</Text>
        <Text style={styles.valueAmount}>₹{portfolioValue.toLocaleString()}</Text>
        <Text style={styles.valueSubtext}>
          Across {programs.length} loyalty programs
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{insights?.activePrograms || 0}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="warning" size={24} color="#FF9800" />
          <Text style={styles.statNumber}>{expiringPrograms.length}</Text>
          <Text style={styles.statLabel}>Expiring</Text>
        </View>
        <View style={styles.statBox}>
          <Ionicons name="gift" size={24} color={primaryColor} />
          <Text style={styles.statNumber}>{bestOpportunities.length}</Text>
          <Text style={styles.statLabel}>Ready</Text>
        </View>
      </View>
    </View>
  );

  const ProgramCard = ({ program }: { program: ExternalLoyaltyProgram }) => {
    const progress = (program.currentProgress / program.requiredForReward) * 100;
    const isReady = program.currentProgress >= program.requiredForReward;
    const daysUntilExpiry = program.expirationDate
      ? Math.ceil((program.expirationDate - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <TouchableOpacity
        style={[
          styles.programCard,
          isReady && styles.programCardReady,
          program.status === 'near_expiry' && styles.programCardExpiring,
        ]}
        onPress={() => setShowProgramDetail(program)}
      >
        <View style={styles.programHeader}>
          <View style={styles.programInfo}>
            <Text style={styles.merchantLogo}>{program.merchantLogo || '🏪'}</Text>
            <View style={styles.programTitleSection}>
              <Text style={styles.merchantName}>{program.merchantName}</Text>
              <Text style={styles.programCategory}>{program.category}</Text>
            </View>
          </View>
          {isReady && (
            <View style={styles.readyBadge}>
              <Ionicons name="gift" size={16} color="#fff" />
              <Text style={styles.readyText}>READY</Text>
            </View>
          )}
          {program.status === 'near_expiry' && !isReady && (
            <View style={styles.expiringBadge}>
              <Ionicons name="time" size={16} color="#fff" />
              <Text style={styles.expiringText}>{daysUntilExpiry}d</Text>
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {program.currentProgress} / {program.requiredForReward}{' '}
              {program.programType === 'stamps'
                ? 'stamps'
                : program.programType === 'points'
                ? 'points'
                : 'visits'}
            </Text>
            <Text style={styles.progressPercent}>{progress.toFixed(0)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%` },
                isReady && styles.progressFillReady,
              ]}
            />
          </View>
        </View>

        <View style={styles.rewardSection}>
          <Ionicons name="gift-outline" size={18} color={primaryColor} />
          <Text style={styles.rewardText}>{program.reward}</Text>
        </View>

        {program.expirationDate && (
          <View style={styles.expirySection}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={daysUntilExpiry && daysUntilExpiry <= 7 ? '#FF9800' : '#888'}
            />
            <Text
              style={[
                styles.expiryText,
                (daysUntilExpiry && daysUntilExpiry <= 7) ? styles.expiryWarning : null,
              ]}
            >
              Expires in {daysUntilExpiry} days
            </Text>
          </View>
        )}

        {program.isManual && (
          <View style={styles.manualBadge}>
            <Text style={styles.manualText}>Manual Tracking</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const ReminderCard = ({ reminder }: { reminder: typeof reminders[0] }) => {
    const getIcon = () => {
      switch (reminder.type) {
        case 'expiring_soon':
          return 'time-outline';
        case 'milestone_reached':
          return 'trophy-outline';
        case 'unused_points':
          return 'warning-outline';
        case 'new_reward':
          return 'gift-outline';
        default:
          return 'notifications-outline';
      }
    };

    const getColor = () => {
      switch (reminder.type) {
        case 'expiring_soon':
          return '#FF9800';
        case 'milestone_reached':
          return '#4CAF50';
        case 'unused_points':
          return '#FF5722';
        case 'new_reward':
          return primaryColor;
        default:
          return '#888';
      }
    };

    return (
      <View style={[styles.reminderCard, !reminder.isRead && styles.reminderUnread]}>
        <View style={[styles.reminderIcon, { backgroundColor: getColor() + '20' }]}>
          <Ionicons name={getIcon() as any} size={24} color={getColor()} />
        </View>
        <View style={styles.reminderContent}>
          <Text style={styles.reminderMerchant}>{reminder.merchantName}</Text>
          <Text style={styles.reminderMessage}>{reminder.message}</Text>
          <Text style={styles.reminderTime}>
            {new Date(reminder.timestamp).toLocaleDateString()}
          </Text>
        </View>
        {!reminder.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  const TemplateCard = ({ template }: { template: LoyaltyTemplate }) => (
    <TouchableOpacity
      style={styles.templateCard}
      onPress={() => {
        createFromTemplate(template.id);
        setShowAddModal(false);
      }}
    >
      <Text style={styles.templateLogo}>{template.merchantLogo}</Text>
      <Text style={styles.templateName}>{template.merchantName}</Text>
      <Text style={styles.templateCategory}>{template.category}</Text>
      {template.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>POPULAR</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loyalty Management</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Ionicons name="add-circle" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search loyalty programs..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'portfolio' && styles.tabActive]}
          onPress={() => setActiveTab('portfolio')}
        >
          <Ionicons
            name="wallet-outline"
            size={20}
            color={activeTab === 'portfolio' ? primaryColor : '#888'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'portfolio' && styles.tabTextActive,
            ]}
          >
            Portfolio
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reminders' && styles.tabActive]}
          onPress={() => setActiveTab('reminders')}
        >
          <Ionicons
            name="notifications-outline"
            size={20}
            color={activeTab === 'reminders' ? primaryColor : '#888'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'reminders' && styles.tabTextActive,
            ]}
          >
            Reminders
          </Text>
          {unreadReminders.length > 0 && (
            <View style={styles.reminderBadge}>
              <Text style={styles.reminderBadgeText}>{unreadReminders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'portfolio' && (
          <>
            <PortfolioHeader />

            {/* Expiring Soon Section */}
            {expiringPrograms.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning" size={20} color="#FF9800" />
                  <Text style={styles.sectionTitle}>Expiring Soon</Text>
                </View>
                {expiringPrograms.map(program => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </View>
            )}

            {/* Ready to Redeem Section */}
            {bestOpportunities.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="gift" size={20} color="#4CAF50" />
                  <Text style={styles.sectionTitle}>Ready to Redeem</Text>
                </View>
                {bestOpportunities.map(program => (
                  <ProgramCard key={program.id} program={program} />
                ))}
              </View>
            )}

            {/* All Programs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Loyalty Programs</Text>
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map(program => (
                  <ProgramCard key={program.id} program={program} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="card-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyText}>No loyalty programs yet</Text>
                  <Text style={styles.emptySubtext}>
                    Tap + to add your first program
                  </Text>
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'reminders' && (
          <View style={styles.section}>
            {reminders.length > 0 ? (
              reminders.map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="notifications-off-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No reminders</Text>
                <Text style={styles.emptySubtext}>
                  We'll notify you about expiring rewards
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Program Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Loyalty Program</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.templatesTitle}>Popular Programs</Text>
              <View style={styles.templatesGrid}>
                {templates
                  .filter(t => t.isPopular)
                  .map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
              </View>

              <Text style={styles.templatesTitle}>All Categories</Text>
              <View style={styles.templatesGrid}>
                {templates
                  .filter(t => !t.isPopular)
                  .map(template => (
                    <TemplateCard key={template.id} template={template} />
                  ))}
              </View>

              <TouchableOpacity
                style={styles.customButton}
                onPress={() => {
                  setShowAddModal(false);
                  router.push('/loyalty-add' as any);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={primaryColor} />
                <Text style={styles.customButtonText}>Create Custom Program</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: primaryColor + '15',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: primaryColor,
  },
  reminderBadge: {
    marginLeft: 6,
    backgroundColor: '#FF5722',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  reminderBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  portfolioHeader: {
    padding: 16,
  },
  valueCard: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  valueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  valueSubtext: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  programCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  programCardReady: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  programCardExpiring: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  programInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  merchantLogo: {
    fontSize: 36,
    marginRight: 12,
  },
  programTitleSection: {
    flex: 1,
  },
  merchantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  programCategory: {
    fontSize: 13,
    color: '#888',
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readyText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expiringText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: primaryColor,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: primaryColor,
    borderRadius: 4,
  },
  progressFillReady: {
    backgroundColor: '#4CAF50',
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rewardText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  expirySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  expiryText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#888',
  },
  expiryWarning: {
    color: '#FF9800',
    fontWeight: '600',
  },
  manualBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  manualText: {
    fontSize: 11,
    color: primaryColor,
    fontWeight: '600',
  },
  reminderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reminderUnread: {
    borderColor: primaryColor,
    backgroundColor: primaryColor + '10',
  },
  reminderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderMerchant: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  reminderTime: {
    fontSize: 12,
    color: '#888',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primaryColor,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  bottomPadding: {
    height: 80,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  modalScroll: {
    padding: 20,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    marginTop: 8,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 16,
  },
  templateCard: {
    width: '31%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    margin: '1%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  templateName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
  },
  popularBadge: {
    marginTop: 6,
    backgroundColor: primaryColor,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  popularText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#fff',
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: primaryColor,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
  },
  customButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: primaryColor,
  },
});
