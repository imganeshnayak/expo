import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Award,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  Trophy,
  Star,
  Calendar,
  MapPin,
} from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useLoyaltyStore, StampCard, getStampIcon, formatReward } from '@/store/loyaltyStore';
import QRCode from 'react-native-qrcode-svg';
import { LockedFeatureOverlay } from '@/components/gamification/LockedFeatureOverlay';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

export default function LoyaltyScreen() {
  const router = useRouter();
  const {
    stampCards,
    totalStampsEarned,
    totalRewardsRedeemed,
    initializeLoyalty,
    getActiveStampCards,
    getCompletedStampCards,
    redeemReward,
    resetStampCard,
    checkExpiredCards,
  } = useLoyaltyStore();

  const [selectedCard, setSelectedCard] = useState<StampCard | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [celebrationAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    initializeLoyalty();
    checkExpiredCards();
  }, []);

  const activeCards = getActiveStampCards();
  const completedCards = getCompletedStampCards();

  const handleCardPress = (card: StampCard) => {
    setSelectedCard(card);
  };

  const handleRedeemPress = (card: StampCard) => {
    setSelectedCard(card);
    setShowRedeemModal(true);
    
    // Celebration animation
    Animated.sequence([
      Animated.spring(celebrationAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.delay(2000),
      Animated.timing(celebrationAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConfirmRedeem = () => {
    if (selectedCard) {
      redeemReward(selectedCard.id);
      setShowRedeemModal(false);
      
      // Reset card for next loyalty cycle
      setTimeout(() => {
        resetStampCard(selectedCard.id);
      }, 3000);
    }
  };

  // Render stamp dots for progress
  const renderStamps = (card: StampCard) => {
    const stamps = [];
    for (let i = 0; i < card.requiredStamps; i++) {
      const isFilled = i < card.currentStamps;
      stamps.push(
        <View
          key={i}
          style={[
            styles.stampDot,
            isFilled && styles.stampDotFilled,
            { backgroundColor: isFilled ? card.categoryColor : theme.colors.surfaceLight },
          ]}>
          {isFilled && (
            <Text style={styles.stampIcon}>{getStampIcon(card.stampDesign)}</Text>
          )}
        </View>
      );
    }
    return stamps;
  };

  const StampCardComponent = ({ card }: { card: StampCard }) => {
    const isCompleted = card.completed && !card.redeemedAt;
    
    return (
      <TouchableOpacity
        style={[
          styles.stampCard,
          isCompleted && styles.stampCardCompleted,
        ]}
        onPress={() => handleCardPress(card)}
        activeOpacity={0.8}>
        {/* Merchant Logo Badge */}
        <View
          style={[
            styles.merchantBadge,
            { backgroundColor: `${card.categoryColor}20` },
          ]}>
          <Text style={styles.merchantLogo}>{card.merchantLogo}</Text>
        </View>

        {/* Merchant Name */}
        <Text style={styles.merchantName} numberOfLines={2}>
          {card.merchantName}
        </Text>

        {/* Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            {card.currentStamps}/{card.requiredStamps} Stamps
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${card.progress}%`,
                  backgroundColor: card.categoryColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Stamp Grid */}
        <View style={styles.stampGrid}>{renderStamps(card)}</View>

        {/* Reward */}
        <View style={styles.rewardSection}>
          <Gift size={14} color={theme.colors.textSecondary} />
          <Text style={styles.rewardText} numberOfLines={2}>
            {card.reward}
          </Text>
        </View>

        {/* Action Button */}
        {isCompleted && (
          <TouchableOpacity
            style={[styles.redeemButton, { backgroundColor: card.categoryColor }]}
            onPress={() => handleRedeemPress(card)}>
            <Text style={styles.redeemButtonText}>Redeem</Text>
          </TouchableOpacity>
        )}

        {/* Expiration Warning */}
        {card.expiresAt && (
          <View style={styles.expiryBadge}>
            <Clock size={10} color="#E74C3C" />
            <Text style={styles.expiryText}>
              {Math.ceil((card.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))}d left
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const StampCardDetailModal = () => {
    if (!selectedCard) return null;

    return (
      <Modal
        visible={!!selectedCard && !showRedeemModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedCard(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedCard(null)}
          />
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalMerchantInfo}>
                <Text style={styles.modalMerchantLogo}>{selectedCard.merchantLogo}</Text>
                <View>
                  <Text style={styles.modalMerchantName}>{selectedCard.merchantName}</Text>
                  <Text style={styles.modalCategory}>
                    {selectedCard.merchantCategory.toUpperCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSelectedCard(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Progress Circle */}
            <View style={styles.modalProgressSection}>
              <View
                style={[
                  styles.progressCircle,
                  { borderColor: selectedCard.categoryColor },
                ]}>
                <Text style={styles.progressCircleText}>
                  {selectedCard.currentStamps}
                </Text>
                <Text style={styles.progressCircleLabel}>
                  / {selectedCard.requiredStamps}
                </Text>
              </View>
              <Text style={styles.progressPercentage}>{Math.round(selectedCard.progress)}%</Text>
            </View>

            {/* Stamp Grid Large */}
            <View style={styles.modalStampGrid}>{renderStamps(selectedCard)}</View>

            {/* Reward Info */}
            <View style={styles.modalRewardBox}>
              <Trophy size={24} color={selectedCard.categoryColor} />
              <Text style={styles.modalRewardTitle}>Your Reward</Text>
              <Text style={styles.modalRewardValue}>{selectedCard.reward}</Text>
              <Text style={styles.modalRewardSubtext}>
                Worth ₹{selectedCard.rewardValue}
              </Text>
            </View>

            {/* Info */}
            <View style={styles.modalInfoSection}>
              <View style={styles.modalInfoRow}>
                <Calendar size={16} color={theme.colors.textSecondary} />
                <Text style={styles.modalInfoText}>
                  Started {new Date(selectedCard.createdAt).toLocaleDateString()}
                </Text>
              </View>
              {selectedCard.expiresAt && (
                <View style={styles.modalInfoRow}>
                  <Clock size={16} color="#E74C3C" />
                  <Text style={styles.modalInfoText}>
                    Expires {new Date(selectedCard.expiresAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </View>

            {/* Action Button */}
            {selectedCard.completed && !selectedCard.redeemedAt && (
              <TouchableOpacity
                style={[
                  styles.modalRedeemButton,
                  { backgroundColor: selectedCard.categoryColor },
                ]}
                onPress={() => handleRedeemPress(selectedCard)}>
                <Gift size={20} color="#FFFFFF" />
                <Text style={styles.modalRedeemButtonText}>Redeem Reward</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const RedeemQRModal = () => {
    if (!selectedCard) return null;

    const qrData = JSON.stringify({
      type: 'loyalty_redemption',
      stampCardId: selectedCard.id,
      merchantId: selectedCard.merchantId,
      reward: selectedCard.reward,
      timestamp: Date.now(),
    });

    return (
      <Modal visible={showRedeemModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.redeemModalContent,
              {
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}>
            {/* Celebration Header */}
            <View style={styles.celebrationHeader}>
              <Trophy size={60} color="#F39C12" />
              <Text style={styles.celebrationTitle}>Congratulations! 🎉</Text>
              <Text style={styles.celebrationSubtitle}>
                You've completed your stamp card!
              </Text>
            </View>

            {/* Reward Info */}
            <View style={styles.redeemRewardBox}>
              <Text style={styles.redeemRewardLabel}>YOUR REWARD</Text>
              <Text style={styles.redeemRewardValue}>{selectedCard.reward}</Text>
              <Text style={styles.redeemMerchantName}>at {selectedCard.merchantName}</Text>
            </View>

            {/* QR Code */}
            <View style={styles.qrSection}>
              <Text style={styles.qrLabel}>Show this QR to staff</Text>
              <View style={styles.qrWrapper}>
                <QRCode
                  value={qrData}
                  size={200}
                  color={theme.colors.text}
                  backgroundColor={theme.colors.surface}
                />
              </View>
              <Text style={styles.qrHint}>Valid for 24 hours</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.redeemActions}>
              <TouchableOpacity
                style={[
                  styles.confirmRedeemButton,
                  { backgroundColor: selectedCard.categoryColor },
                ]}
                onPress={handleConfirmRedeem}>
                <CheckCircle2 size={20} color="#FFFFFF" />
                <Text style={styles.confirmRedeemText}>Confirm Redemption</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRedeemModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <LockedFeatureOverlay featureId="LOYALTY_CARDS" minRank="Silver I">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Loyalty Cards</Text>
          <Text style={styles.headerSubtitle}>Collect stamps & earn rewards</Text>
        </View>
        <View style={styles.statsBox}>
          <View style={styles.statItem}>
            <Sparkles size={16} color="#F39C12" />
            <Text style={styles.statValue}>{totalStampsEarned}</Text>
            <Text style={styles.statLabel}>Stamps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Award size={16} color={theme.colors.primary} />
            <Text style={styles.statValue}>{totalRewardsRedeemed}</Text>
            <Text style={styles.statLabel}>Rewards</Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Completed Cards - Ready to Redeem */}
        {completedCards.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Trophy size={20} color="#F39C12" />
              <Text style={styles.sectionTitle}>Ready to Redeem ({completedCards.length})</Text>
            </View>
            <View style={styles.cardGrid}>
              {completedCards.map((card) => (
                <StampCardComponent key={card.id} card={card} />
              ))}
            </View>
          </View>
        )}

        {/* Active Stamp Cards */}
        {activeCards.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>In Progress ({activeCards.length})</Text>
            </View>
            <View style={styles.cardGrid}>
              {activeCards.map((card) => (
                <StampCardComponent key={card.id} card={card} />
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 How it Works</Text>
          <Text style={styles.tipText}>• Visit partner merchants and scan their QR code</Text>
          <Text style={styles.tipText}>• Earn 1 stamp for each visit or purchase</Text>
          <Text style={styles.tipText}>• Complete the card to unlock your reward</Text>
          <Text style={styles.tipText}>• Show the redemption QR to staff</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <StampCardDetailModal />
      <RedeemQRModal />
    </SafeAreaView>
    </LockedFeatureOverlay>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  statsBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.surfaceLight,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  stampCard: {
    width: CARD_WIDTH,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: theme.colors.surfaceLight,
  },
  stampCardCompleted: {
    borderColor: '#F39C12',
    backgroundColor: 'rgba(243, 156, 18, 0.05)',
  },
  merchantBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  merchantLogo: {
    fontSize: 24,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    height: 36,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  stampDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampDotFilled: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  stampIcon: {
    fontSize: 12,
  },
  rewardSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rewardText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  redeemButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expiryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  expiryText: {
    fontSize: 9,
    color: '#E74C3C',
    fontWeight: '600',
  },
  tipsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalMerchantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalMerchantLogo: {
    fontSize: 40,
  },
  modalMerchantName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalCategory: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    fontSize: 24,
    color: theme.colors.textSecondary,
  },
  modalProgressSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressCircleText: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressCircleLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  modalStampGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  modalRewardBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  modalRewardTitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  modalRewardValue: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  modalRewardSubtext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  modalInfoSection: {
    gap: 12,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalInfoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  modalRedeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  modalRedeemButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Redeem Modal
  redeemModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxHeight: '90%',
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  redeemRewardBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  redeemRewardLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    letterSpacing: 1,
  },
  redeemRewardValue: {
    fontSize: 22,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  redeemMerchantName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 16,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  qrHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  redeemActions: {
    gap: 12,
  },
  confirmRedeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmRedeemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});
