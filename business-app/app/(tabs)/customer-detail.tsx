import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  TrendingUp,
  Clock,
  Heart,
  Award,
  MessageSquare,
  Gift,
  Bell,
  Tag,
  Edit,
  Trash,
  Plus,
  Send,
  Star,
  Crown,
  AlertCircle,
} from 'lucide-react-native';
import { theme } from '../../constants/theme';
import {
  useCRMStore,
  type CustomerProfile,
  getSegmentColor,
  getSegmentLabel,
  formatCurrency,
  formatDate,
} from '../../store/crmStore';

export default function CustomerDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const customerId = params.id as string;

  const {
    getCustomer,
    updateCustomer,
    addCustomerNote,
    addCustomerTag,
    removeCustomerTag,
  } = useCRMStore();

  const customer = getCustomer(customerId);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  if (!customer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.colors.textSecondary} />
          <Text style={styles.errorText}>Customer not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysSinceLastVisit = Math.floor((Date.now() - customer.lastVisit) / (24 * 60 * 60 * 1000));
  const isAtRisk = daysSinceLastVisit > 14;
  const isVIP = customer.segment === 'vip';

  const handleAddNote = () => {
    if (newNote.trim()) {
      addCustomerNote(customerId, newNote.trim());
      setNewNote('');
      setShowNoteModal(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addCustomerTag(customerId, newTag.trim());
      setNewTag('');
      setShowTagModal(false);
    }
  };

  // ============================================================================
  // HEADER
  // ============================================================================

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
        <ArrowLeft size={24} color={theme.colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Customer Details</Text>
      <TouchableOpacity style={styles.editButton}>
        <Edit size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // PROFILE HEADER
  // ============================================================================

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.profileAvatarLarge}>
        <Text style={styles.profileInitialsLarge}>
          {(customer.name || customer.phone.slice(-4))
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()}
        </Text>
        {isVIP && (
          <View style={styles.crownBadge}>
            <Crown size={16} color="#FFFFFF" />
          </View>
        )}
      </View>

      <Text style={styles.profileName}>{customer.name || customer.phone}</Text>
      <Text style={styles.profilePhone}>{customer.phone}</Text>

      <View
        style={[
          styles.segmentBadgeLarge,
          { backgroundColor: `${getSegmentColor(customer.segment)}20` },
        ]}>
        <Text
          style={[
            styles.segmentBadgeTextLarge,
            { color: getSegmentColor(customer.segment) },
          ]}>
          {getSegmentLabel(customer.segment).toUpperCase()}
        </Text>
      </View>

      {isAtRisk && (
        <View style={styles.alertBanner}>
          <AlertCircle size={16} color="#E74C3C" />
          <Text style={styles.alertText}>
            At risk • Last visit {daysSinceLastVisit} days ago
          </Text>
        </View>
      )}

      <View style={styles.quickActionsRow}>
        <TouchableOpacity style={styles.quickActionBtn}>
          <MessageSquare size={18} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Gift size={18} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Reward</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Send size={18} color="#FFFFFF" />
          <Text style={styles.quickActionText}>Campaign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ============================================================================
  // KEY METRICS
  // ============================================================================

  const renderKeyMetrics = () => (
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <IndianRupee size={20} color={theme.colors.primary} />
        <Text style={styles.metricValue}>{formatCurrency(customer.lifetimeValue)}</Text>
        <Text style={styles.metricLabel}>Lifetime Value</Text>
      </View>

      <View style={styles.metricCard}>
        <TrendingUp size={20} color="#2ECC71" />
        <Text style={styles.metricValue}>{customer.visitCount}</Text>
        <Text style={styles.metricLabel}>Total Visits</Text>
      </View>

      <View style={styles.metricCard}>
        <IndianRupee size={20} color="#F39C12" />
        <Text style={styles.metricValue}>{formatCurrency(customer.averageSpend)}</Text>
        <Text style={styles.metricLabel}>Avg Spend</Text>
      </View>

      <View style={styles.metricCard}>
        <Clock size={20} color={isAtRisk ? '#E74C3C' : theme.colors.textSecondary} />
        <Text style={[styles.metricValue, isAtRisk && { color: '#E74C3C' }]}>
          {daysSinceLastVisit}d
        </Text>
        <Text style={styles.metricLabel}>Since Last Visit</Text>
      </View>
    </View>
  );

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  const renderPreferences = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preferences & Behavior</Text>

      <View style={styles.preferenceCard}>
        <View style={styles.preferenceRow}>
          <Clock size={16} color={theme.colors.textSecondary} />
          <Text style={styles.preferenceLabel}>Preferred Time:</Text>
          <Text style={styles.preferenceValue}>
            {customer.preferences.timeOfDay.toUpperCase()}
          </Text>
        </View>

        <View style={styles.preferenceRow}>
          <Calendar size={16} color={theme.colors.textSecondary} />
          <Text style={styles.preferenceLabel}>Preferred Days:</Text>
          <Text style={styles.preferenceValue}>
            {customer.preferences.dayOfWeek.join(', ')}
          </Text>
        </View>

        <View style={styles.preferenceRow}>
          <Heart size={16} color="#E74C3C" />
          <Text style={styles.preferenceLabel}>Favorite Items:</Text>
          <View style={styles.favoriteItemsList}>
            {customer.favoriteItems.map((item, index) => (
              <View key={index} style={styles.favoriteItemChip}>
                <Text style={styles.favoriteItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );

  // ============================================================================
  // LOYALTY STATUS
  // ============================================================================

  const renderLoyaltyStatus = () => {
    const activeCards = customer.stampCards.active;
    const completedCards = customer.stampCards.completed;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loyalty Status</Text>

        {activeCards.length > 0 && (
          <View style={styles.loyaltyCard}>
            <View style={styles.loyaltyHeader}>
              <Award size={18} color={theme.colors.primary} />
              <Text style={styles.loyaltyTitle}>Active Stamp Cards</Text>
            </View>

            {activeCards.map(card => (
              <View key={card.id} style={styles.stampCardItem}>
                <View>
                  <Text style={styles.stampCardMerchant}>{card.merchantName}</Text>
                  <Text style={styles.stampCardReward}>{card.reward}</Text>
                </View>
                <View style={styles.stampProgress}>
                  <Text style={styles.stampCount}>
                    {card.stampsCollected}/{card.stampsRequired}
                  </Text>
                  <View style={styles.stampProgressBar}>
                    <View
                      style={[
                        styles.stampProgressFill,
                        {
                          width: `${(card.stampsCollected / card.stampsRequired) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {completedCards.length > 0 && (
          <View style={styles.completedCardsInfo}>
            <Star size={14} color="#F39C12" />
            <Text style={styles.completedCardsText}>
              {completedCards.length} completed stamp card{completedCards.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ============================================================================
  // COMMUNICATION
  // ============================================================================

  const renderCommunication = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Communication Preferences</Text>

      <View style={styles.communicationCard}>
        <View style={styles.communicationRow}>
          <Bell size={18} color={customer.communication.pushEnabled ? '#2ECC71' : theme.colors.textSecondary} />
          <Text style={styles.communicationLabel}>Push Notifications</Text>
          <View style={[
            styles.statusDot,
            { backgroundColor: customer.communication.pushEnabled ? '#2ECC71' : theme.colors.surfaceLight }
          ]} />
          <Text style={[
            styles.statusText,
            { color: customer.communication.pushEnabled ? '#2ECC71' : theme.colors.textSecondary }
          ]}>
            {customer.communication.pushEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        <View style={styles.communicationRow}>
          <MessageSquare size={18} color={customer.communication.smsEnabled ? '#2ECC71' : theme.colors.textSecondary} />
          <Text style={styles.communicationLabel}>SMS Messages</Text>
          <View style={[
            styles.statusDot,
            { backgroundColor: customer.communication.smsEnabled ? '#2ECC71' : theme.colors.surfaceLight }
          ]} />
          <Text style={[
            styles.statusText,
            { color: customer.communication.smsEnabled ? '#2ECC71' : theme.colors.textSecondary }
          ]}>
            {customer.communication.smsEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </View>

        <View style={styles.communicationRow}>
          <Clock size={18} color={theme.colors.textSecondary} />
          <Text style={styles.communicationLabel}>Last Contact</Text>
          <Text style={styles.communicationValue}>
            {formatDate(customer.communication.lastContact)}
          </Text>
        </View>
      </View>
    </View>
  );

  // ============================================================================
  // TAGS & NOTES
  // ============================================================================

  const renderTagsAndNotes = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Tags & Notes</Text>
      </View>

      {/* Tags */}
      <View style={styles.tagsContainer}>
        {customer.tags.map((tag, index) => (
          <View key={index} style={styles.tagChip}>
            <Tag size={12} color={theme.colors.primary} />
            <Text style={styles.tagText}>{tag}</Text>
            <TouchableOpacity onPress={() => removeCustomerTag(customerId, tag)}>
              <Text style={styles.tagRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={() => setShowTagModal(true)}>
          <Plus size={12} color={theme.colors.primary} />
          <Text style={styles.addTagText}>Add Tag</Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      {customer.notes && (
        <View style={styles.notesCard}>
          <Text style={styles.notesText}>{customer.notes}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addNoteButton}
        onPress={() => setShowNoteModal(true)}>
        <Plus size={16} color={theme.colors.primary} />
        <Text style={styles.addNoteText}>
          {customer.notes ? 'Update Notes' : 'Add Notes'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ============================================================================
  // VISIT HISTORY
  // ============================================================================

  const renderVisitHistory = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Visit History</Text>

      <View style={styles.historyCard}>
        <View style={styles.historyRow}>
          <Calendar size={16} color={theme.colors.textSecondary} />
          <Text style={styles.historyLabel}>First Visit:</Text>
          <Text style={styles.historyValue}>{formatDate(customer.firstVisit)}</Text>
        </View>

        <View style={styles.historyRow}>
          <Clock size={16} color={theme.colors.textSecondary} />
          <Text style={styles.historyLabel}>Last Visit:</Text>
          <Text style={styles.historyValue}>{formatDate(customer.lastVisit)}</Text>
        </View>

        <View style={styles.historyRow}>
          <TrendingUp size={16} color={theme.colors.primary} />
          <Text style={styles.historyLabel}>Total Visits:</Text>
          <Text style={styles.historyValue}>{customer.visitCount} visits</Text>
        </View>

        <View style={styles.historyRow}>
          <IndianRupee size={16} color="#2ECC71" />
          <Text style={styles.historyLabel}>Avg Spend per Visit:</Text>
          <Text style={styles.historyValue}>{formatCurrency(customer.averageSpend)}</Text>
        </View>
      </View>
    </View>
  );

  // ============================================================================
  // MODALS
  // ============================================================================

  const renderNoteModal = () => (
    <Modal
      visible={showNoteModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowNoteModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {customer.notes ? 'Update Notes' : 'Add Notes'}
            </Text>
            <TouchableOpacity onPress={() => setShowNoteModal(false)}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Enter customer notes..."
            placeholderTextColor={theme.colors.textTertiary}
            value={newNote}
            onChangeText={setNewNote}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowNoteModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddNote}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTagModal = () => (
    <Modal
      visible={showTagModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowTagModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Tag</Text>
            <TouchableOpacity onPress={() => setShowTagModal(false)}>
              <Text style={styles.modalClose}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.modalInput}
            placeholder="Enter tag name..."
            placeholderTextColor={theme.colors.textTertiary}
            value={newTag}
            onChangeText={setNewTag}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTagModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddTag}>
              <Text style={styles.modalSaveText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {renderProfileHeader()}
        {renderKeyMetrics()}
        {renderPreferences()}
        {renderLoyaltyStatus()}
        {renderCommunication()}
        {renderVisitHistory()}
        {renderTagsAndNotes()}

        <View style={{ height: 40 }} />
      </ScrollView>

      {renderNoteModal()}
      {renderTagModal()}
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
  backButtonHeader: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.surface,
  },
  profileAvatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileInitialsLarge: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F39C12',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  segmentBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  segmentBadgeTextLarge: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E74C3C20',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E74C3C',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingTop: 0,
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
    color: theme.colors.text,
    marginBottom: 16,
  },
  preferenceCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  preferenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  favoriteItemsList: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  favoriteItemChip: {
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  loyaltyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loyaltyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  stampCardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceLight,
  },
  stampCardMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  stampCardReward: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  stampProgress: {
    alignItems: 'flex-end',
  },
  stampCount: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  stampProgressBar: {
    width: 80,
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  stampProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  completedCardsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  completedCardsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  communicationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  communicationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  communicationLabel: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  communicationValue: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.text,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  tagRemove: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  addTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.primary,
  },
  notesCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: `${theme.colors.primary}20`,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addNoteText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  historyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalClose: {
    fontSize: 32,
    fontWeight: '300',
    color: theme.colors.textSecondary,
  },
  modalInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: 20,
    minHeight: 100,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
