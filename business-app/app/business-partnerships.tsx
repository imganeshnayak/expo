import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useMarketplaceStore,
  BusinessDeal,
  PartnershipRequest,
  DealType,
} from '../store/marketplaceStore';
import { theme } from '../constants/theme';

export default function BusinessPartnershipsScreen() {
  const router = useRouter();
  const {
    businessDeals,
    partnershipRequests,
    getActiveDeals,
    getRecommendedDeals,
    createDeal,
    joinDeal,
    leaveDeal,
    createPartnershipRequest,
    respondToPartnership,
    getMyPartnerships,
  } = useMarketplaceStore();

  const [activeTab, setActiveTab] = useState<'deals' | 'partnerships'>('deals');
  const [showCreateDealModal, setShowCreateDealModal] = useState(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<BusinessDeal | null>(null);

  // Create Deal Form
  const [dealType, setDealType] = useState<DealType>('bulk_purchase');
  const [dealTitle, setDealTitle] = useState('');
  const [dealDescription, setDealDescription] = useState('');
  const [dealBenefits, setDealBenefits] = useState('');

  // Partnership Form
  const [partnerBusinessName, setPartnerBusinessName] = useState('');
  const [partnershipProposal, setPartnershipProposal] = useState('');

  const myBusinessId = 'my_business_id';
  const myBusinessType = 'restaurant';

  useEffect(() => {
    // Initialize
  }, []);

  const handleCreateDeal = () => {
    if (!dealTitle || !dealDescription) {
      Alert.alert('Info', 'Please fill in all required fields');
      return;
    }

    const benefits = dealBenefits.split(',').map((b) => b.trim()).filter(Boolean);

    createDeal({
      initiatorId: myBusinessId,
      initiatorName: 'My Business',
      dealType,
      title: dealTitle,
      description: dealDescription,
      terms: 'Terms and conditions apply',
      benefits,
      targetBusinessTypes: [myBusinessType],
      status: 'active',
      participants: [],
      minParticipants: 5,
      maxParticipants: 20,
      currentSavings: 0,
      potentialSavings: 50000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    Alert.alert('Info', 'Business deal created successfully!');
    setShowCreateDealModal(false);
    resetDealForm();
  };

  const resetDealForm = () => {
    setDealTitle('');
    setDealDescription('');
    setDealBenefits('');
    setDealType('bulk_purchase');
  };

  const handleJoinDeal = (deal: BusinessDeal) => {
    joinDeal(deal.id, myBusinessId);
    Alert.alert('Info', `You've joined the deal: ${deal.title}`);
  };

  const handleLeaveDeal = (deal: BusinessDeal) => {
    leaveDeal(deal.id, myBusinessId);
    Alert.alert('Info', `You've left the deal: ${deal.title}`);
  };

  const handleCreatePartnership = () => {
    if (!partnerBusinessName || !partnershipProposal) {
      Alert.alert('Info', 'Please fill in all required fields');
      return;
    }

    createPartnershipRequest({
      fromBusinessId: myBusinessId,
      fromBusinessName: 'My Business',
      toBusinessId: 'partner_business_id',
      toBusinessName: partnerBusinessName,
      partnershipType: 'cross_promotion',
      proposal: partnershipProposal,
      proposedBenefits: [
        'Shared customer base',
        'Co-branded marketing',
        'Resource sharing',
      ],
    });

    Alert.alert('Info', 'Partnership request sent!');
    setShowPartnershipModal(false);
    setPartnerBusinessName('');
    setPartnershipProposal('');
  };

  const DealCard = ({ deal }: { deal: BusinessDeal }) => {
    const isParticipant = deal.participants.includes(myBusinessId);
    const progress = (deal.participants.length / deal.maxParticipants) * 100;

    return (
      <TouchableOpacity
        style={styles.dealCard}
        onPress={() => setSelectedDeal(deal)}
      >
        <View style={styles.dealHeader}>
          <View style={styles.dealTypeBadge}>
            <Text style={styles.dealTypeBadgeText}>
              {deal.dealType.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          {isParticipant && (
            <View style={styles.participatingBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.participatingText}>Participating</Text>
            </View>
          )}
        </View>

        <Text style={styles.dealTitle}>{deal.title}</Text>
        <Text style={styles.dealDescription} numberOfLines={2}>
          {deal.description}
        </Text>

        <View style={styles.dealStats}>
          <View style={styles.dealStat}>
            <Ionicons name="people-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.dealStatText}>
              {deal.participants.length}/{deal.maxParticipants}
            </Text>
          </View>
          <View style={styles.dealStat}>
            <Ionicons name="cash-outline" size={20} color="#4CAF50" />
            <Text style={styles.dealStatText}>₹{deal.currentSavings.toLocaleString()}</Text>
          </View>
          <View style={styles.dealStat}>
            <Ionicons name="time-outline" size={20} color="#FF9800" />
            <Text style={styles.dealStatText}>
              {Math.ceil((deal.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{progress.toFixed(0)}% filled</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          {deal.benefits.slice(0, 2).map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {isParticipant ? (
          <TouchableOpacity
            style={styles.leaveButton}
            onPress={() => handleLeaveDeal(deal)}
          >
            <Text style={styles.leaveButtonText}>Leave Deal</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => handleJoinDeal(deal)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Join Deal</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const PartnershipCard = ({ partnership }: { partnership: PartnershipRequest }) => {
    const isIncoming = partnership.toBusinessId === myBusinessId;

    return (
      <View style={styles.partnershipCard}>
        <View style={styles.partnershipHeader}>
          <View style={styles.partnershipInfo}>
            <Text style={styles.partnershipType}>
              {partnership.partnershipType.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={styles.partnershipName}>
              {isIncoming ? partnership.fromBusinessName : partnership.toBusinessName}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              partnership.status === 'pending' && styles.statusPending,
              partnership.status === 'accepted' && styles.statusAccepted,
              partnership.status === 'declined' && styles.statusDeclined,
            ]}
          >
            <Text style={styles.statusText}>
              {partnership.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.partnershipProposal}>{partnership.proposal}</Text>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Proposed Benefits:</Text>
          {partnership.proposedBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Ionicons name="star-outline" size={16} color={theme.colors.primary} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {isIncoming && partnership.status === 'pending' && (
          <View style={styles.partnershipActions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => respondToPartnership(partnership.id, 'decline')}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => respondToPartnership(partnership.id, 'accept')}
            >
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Business Partnerships</Text>
        <TouchableOpacity
          onPress={() =>
            activeTab === 'deals'
              ? setShowCreateDealModal(true)
              : setShowPartnershipModal(true)
          }
        >
          <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'deals' && styles.tabActive]}
          onPress={() => setActiveTab('deals')}
        >
          <Ionicons
            name="briefcase-outline"
            size={20}
            color={activeTab === 'deals' ? theme.colors.primary : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'deals' && styles.tabTextActive]}>
            Deals
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'partnerships' && styles.tabActive]}
          onPress={() => setActiveTab('partnerships')}
        >
          <Ionicons
            name="people-outline"
            size={20}
            color={activeTab === 'partnerships' ? theme.colors.primary : '#888'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'partnerships' && styles.tabTextActive,
            ]}
          >
            Partnerships
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {activeTab === 'deals' ? (
          <>
            {/* Recommended Deals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended for You</Text>
              {getRecommendedDeals(myBusinessType).map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </View>

            {/* All Active Deals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>All Active Deals</Text>
              {getActiveDeals().map((deal) => (
                <DealCard key={deal.id} deal={deal} />
              ))}
            </View>
          </>
        ) : (
          <>
            {/* My Partnerships */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Partnerships</Text>
              {partnershipRequests
                .filter((p) => p.status === 'active')
                .map((partnership) => (
                  <PartnershipCard key={partnership.id} partnership={partnership} />
                ))}
            </View>

            {/* Pending Requests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pending Requests</Text>
              {partnershipRequests
                .filter((p) => p.status === 'pending')
                .map((partnership) => (
                  <PartnershipCard key={partnership.id} partnership={partnership} />
                ))}
            </View>
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Deal Modal */}
      <Modal
        visible={showCreateDealModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateDealModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Business Deal</Text>
              <TouchableOpacity onPress={() => setShowCreateDealModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Deal Type *</Text>
                <View style={styles.dealTypeOptions}>
                  {(['bulk_purchase', 'joint_promotion', 'cross_selling', 'resource_sharing'] as DealType[]).map(
                    (type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.dealTypeOption,
                          dealType === type && styles.dealTypeOptionActive,
                        ]}
                        onPress={() => setDealType(type)}
                      >
                        <Text
                          style={[
                            styles.dealTypeOptionText,
                            dealType === type && styles.dealTypeOptionTextActive,
                          ]}
                        >
                          {type.replace('_', ' ')}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Deal Title *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Collective Coffee Bean Purchase"
                  value={dealTitle}
                  onChangeText={setDealTitle}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Description *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Describe your deal..."
                  value={dealDescription}
                  onChangeText={setDealDescription}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Benefits (comma-separated)</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="e.g., 25% discount, Free delivery, Quality guarantee"
                  value={dealBenefits}
                  onChangeText={setDealBenefits}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateDealModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleCreateDeal}>
                <Text style={styles.confirmButtonText}>Create Deal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Partnership Modal */}
      <Modal
        visible={showPartnershipModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPartnershipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Propose Partnership</Text>
              <TouchableOpacity onPress={() => setShowPartnershipModal(false)}>
                <Ionicons name="close" size={28} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Partner Business Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Enter business name"
                  value={partnerBusinessName}
                  onChangeText={setPartnerBusinessName}
                />
              </View>

              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Partnership Proposal *</Text>
                <TextInput
                  style={[styles.formInput, styles.formTextArea]}
                  placeholder="Describe your partnership idea..."
                  value={partnershipProposal}
                  onChangeText={setPartnershipProposal}
                  multiline
                  numberOfLines={6}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowPartnershipModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleCreatePartnership}
              >
                <Text style={styles.confirmButtonText}>Send Proposal</Text>
              </TouchableOpacity>
            </View>
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
    color: '#888',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  dealCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dealTypeBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  participatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  participatingText: {
    marginLeft: 4,
    fontSize: 11,
    fontWeight: '600',
    color: '#4CAF50',
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  dealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  dealStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  dealStat: {
    alignItems: 'center',
  },
  dealStatText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  benefitsContainer: {
    marginBottom: 12,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#666',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinButtonText: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  leaveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
  },
  leaveButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F44336',
  },
  partnershipCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  partnershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  partnershipInfo: {},
  partnershipType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  partnershipName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#FFF3E0',
  },
  statusAccepted: {
    backgroundColor: '#E8F5E9',
  },
  statusDeclined: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  partnershipProposal: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  partnershipActions: {
    flexDirection: 'row',
    marginTop: 12,
  },
  declineButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F44336',
  },
  acceptButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 8,
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
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
    maxHeight: 400,
  },
  formSection: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dealTypeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dealTypeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginRight: 8,
    marginBottom: 8,
  },
  dealTypeOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  dealTypeOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    textTransform: 'capitalize',
  },
  dealTypeOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
