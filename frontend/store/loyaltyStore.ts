import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StampCard {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantLogo: string;
  merchantCategory: 'food' | 'cafe' | 'wellness' | 'shopping' | 'entertainment' | 'fitness';
  categoryColor: string;
  requiredStamps: number; // Typically 5, 8, or 10
  currentStamps: number;
  reward: string; // "Free Coffee", "20% Off", "Buy 1 Get 1"
  rewardValue: number; // Monetary value in rupees
  completed: boolean;
  completedAt?: number;
  redeemedAt?: number;
  createdAt: number;
  expiresAt?: number; // Optional expiration timestamp
  progress: number; // 0-100
  stampDesign: 'circle' | 'star' | 'heart' | 'coffee' | 'pizza' | 'dumbbell' | 'cart';
  tierLevel?: 'basic' | 'premium' | 'exclusive'; // For tiered rewards
}

export interface StampTransaction {
  id: string;
  stampCardId: string;
  merchantId: string;
  merchantName: string;
  type: 'earned' | 'redeemed' | 'expired';
  stampNumber?: number; // Which stamp number was earned (1-10)
  createdAt: number;
  dealId?: string; // Which deal earned the stamp
  location?: string;
  notes?: string;
}

interface LoyaltyBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt?: number;
  requirement: string;
}

interface LoyaltyState {
  stampCards: StampCard[];
  transactions: StampTransaction[];
  badges: LoyaltyBadge[];
  totalStampsEarned: number;
  totalRewardsRedeemed: number;
  
  // Actions
  initializeLoyalty: () => void;
  addStampCard: (merchantData: Partial<StampCard>) => StampCard;
  earnStamp: (merchantId: string, dealId?: string, location?: string) => boolean;
  redeemReward: (stampCardId: string) => boolean;
  resetStampCard: (stampCardId: string) => void;
  getActiveStampCards: () => StampCard[];
  getCompletedStampCards: () => StampCard[];
  getStampCardByMerchant: (merchantId: string) => StampCard | undefined;
  checkExpiredCards: () => void;
  unlockBadge: (badgeId: string) => void;
  getRecentTransactions: (limit?: number) => StampTransaction[];
}

// ============================================================================
// SAMPLE STAMP CARDS
// ============================================================================

const sampleStampCards: Omit<StampCard, 'id' | 'createdAt' | 'progress'>[] = [
  {
    merchantId: 'merchant_starbucks',
    merchantName: 'Starbucks Coffee',
    merchantLogo: '☕',
    merchantCategory: 'cafe',
    categoryColor: '#6F4E37',
    requiredStamps: 5,
    currentStamps: 2, // User already has 2 stamps
    reward: 'Free Coffee of Any Size',
    rewardValue: 250,
    completed: false,
    stampDesign: 'coffee',
    tierLevel: 'basic',
  },
  {
    merchantId: 'merchant_dominos',
    merchantName: "Domino's Pizza",
    merchantLogo: '🍕',
    merchantCategory: 'food',
    categoryColor: '#E31837',
    requiredStamps: 8,
    currentStamps: 5, // 5/8 stamps
    reward: 'Free Medium Pizza',
    rewardValue: 399,
    completed: false,
    stampDesign: 'pizza',
    tierLevel: 'premium',
  },
  {
    merchantId: 'merchant_wellness_spa',
    merchantName: 'Serenity Wellness Spa',
    merchantLogo: '🧘',
    merchantCategory: 'wellness',
    categoryColor: '#2ECC71',
    requiredStamps: 5,
    currentStamps: 0,
    reward: '15% Off Any Treatment',
    rewardValue: 300,
    completed: false,
    stampDesign: 'heart',
    tierLevel: 'basic',
  },
  {
    merchantId: 'merchant_gaming_zone',
    merchantName: 'PlayZone Gaming Arena',
    merchantLogo: '🎮',
    merchantCategory: 'entertainment',
    categoryColor: '#9B59B6',
    requiredStamps: 10,
    currentStamps: 7, // Almost there!
    reward: '1 Hour Free Gaming',
    rewardValue: 200,
    completed: false,
    stampDesign: 'star',
    tierLevel: 'exclusive',
  },
  {
    merchantId: 'merchant_fitness_first',
    merchantName: 'Fitness First Gym',
    merchantLogo: '💪',
    merchantCategory: 'fitness',
    categoryColor: '#E74C3C',
    requiredStamps: 8,
    currentStamps: 3,
    reward: 'Free Personal Training Session',
    rewardValue: 500,
    completed: false,
    stampDesign: 'dumbbell',
    tierLevel: 'premium',
  },
  {
    merchantId: 'merchant_bigbazaar',
    merchantName: 'Big Bazaar',
    merchantLogo: '🛒',
    merchantCategory: 'shopping',
    categoryColor: '#F39C12',
    requiredStamps: 10,
    currentStamps: 1,
    reward: '₹500 Shopping Voucher',
    rewardValue: 500,
    completed: false,
    stampDesign: 'cart',
    tierLevel: 'exclusive',
  },
];

// Sample loyalty badges
const sampleBadges: LoyaltyBadge[] = [
  {
    id: 'badge_coffee_lover',
    name: 'Coffee Connoisseur',
    description: 'Complete 3 different cafe stamp cards',
    icon: '☕',
    category: 'cafe',
    requirement: 'Complete 3 cafe stamp cards',
  },
  {
    id: 'badge_foodie',
    name: 'Foodie Explorer',
    description: 'Complete stamp cards from 5 different restaurants',
    icon: '🍕',
    category: 'food',
    requirement: 'Complete 5 food stamp cards',
  },
  {
    id: 'badge_wellness_warrior',
    name: 'Wellness Champion',
    description: 'Complete 2 wellness stamp cards',
    icon: '🧘',
    category: 'wellness',
    requirement: 'Complete 2 wellness stamp cards',
  },
  {
    id: 'badge_shopaholic',
    name: 'Shopping Superstar',
    description: 'Earn 50 stamps total',
    icon: '🛍️',
    category: 'shopping',
    requirement: 'Earn 50 stamps',
  },
];

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const generateId = () => `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateTransactionId = () => `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      stampCards: [],
      transactions: [],
      badges: sampleBadges,
      totalStampsEarned: 0,
      totalRewardsRedeemed: 0,

      // ====================================================================
      // INITIALIZATION
      // ====================================================================

      initializeLoyalty: () => {
        const { stampCards } = get();
        
        // Only initialize if no stamp cards exist
        if (stampCards.length === 0) {
          const initialCards: StampCard[] = sampleStampCards.map((card) => ({
            ...card,
            id: generateId(),
            createdAt: Date.now(),
            progress: (card.currentStamps / card.requiredStamps) * 100,
          }));

          set({
            stampCards: initialCards,
            totalStampsEarned: initialCards.reduce((sum, card) => sum + card.currentStamps, 0),
          });

          console.log('✅ Loyalty system initialized with', initialCards.length, 'stamp cards');
        }
      },

      // ====================================================================
      // STAMP CARD MANAGEMENT
      // ====================================================================

      addStampCard: (merchantData) => {
        const newCard: StampCard = {
          id: generateId(),
          merchantId: merchantData.merchantId || '',
          merchantName: merchantData.merchantName || '',
          merchantLogo: merchantData.merchantLogo || '🏪',
          merchantCategory: merchantData.merchantCategory || 'shopping',
          categoryColor: merchantData.categoryColor || '#00D9A3',
          requiredStamps: merchantData.requiredStamps || 5,
          currentStamps: 0,
          reward: merchantData.reward || 'Free Item',
          rewardValue: merchantData.rewardValue || 100,
          completed: false,
          createdAt: Date.now(),
          expiresAt: merchantData.expiresAt,
          progress: 0,
          stampDesign: merchantData.stampDesign || 'circle',
          tierLevel: merchantData.tierLevel || 'basic',
        };

        set((state) => ({
          stampCards: [...state.stampCards, newCard],
        }));

        return newCard;
      },

      // ====================================================================
      // EARNING STAMPS
      // ====================================================================

      earnStamp: (merchantId, dealId, location) => {
        const { stampCards, totalStampsEarned } = get();
        
        // Find the stamp card for this merchant
        const cardIndex = stampCards.findIndex(
          (card) => card.merchantId === merchantId && !card.completed
        );

        if (cardIndex === -1) {
          console.log('No active stamp card found for merchant:', merchantId);
          return false;
        }

        const card = stampCards[cardIndex];
        const newStampCount = card.currentStamps + 1;
        const isCompleted = newStampCount >= card.requiredStamps;
        const newProgress = Math.min((newStampCount / card.requiredStamps) * 100, 100);

        // Create transaction record
        const transaction: StampTransaction = {
          id: generateTransactionId(),
          stampCardId: card.id,
          merchantId,
          merchantName: card.merchantName,
          type: 'earned',
          stampNumber: newStampCount,
          createdAt: Date.now(),
          dealId,
          location,
          notes: `Earned stamp ${newStampCount}/${card.requiredStamps}`,
        };

        // Update the card
        const updatedCard: StampCard = {
          ...card,
          currentStamps: newStampCount,
          completed: isCompleted,
          completedAt: isCompleted ? Date.now() : undefined,
          progress: newProgress,
        };

        const newStampCards = [...stampCards];
        newStampCards[cardIndex] = updatedCard;

        set({
          stampCards: newStampCards,
          transactions: [transaction, ...get().transactions],
          totalStampsEarned: totalStampsEarned + 1,
        });

        console.log(`✅ Stamp earned! ${newStampCount}/${card.requiredStamps} at ${card.merchantName}`);
        
        if (isCompleted) {
          console.log('🎉 STAMP CARD COMPLETED!', card.merchantName, '-', card.reward);
        }

        return true;
      },

      // ====================================================================
      // REWARD REDEMPTION
      // ====================================================================

      redeemReward: (stampCardId) => {
        const { stampCards, totalRewardsRedeemed } = get();
        
        const cardIndex = stampCards.findIndex((card) => card.id === stampCardId);
        
        if (cardIndex === -1) {
          console.log('Stamp card not found:', stampCardId);
          return false;
        }

        const card = stampCards[cardIndex];

        if (!card.completed) {
          console.log('Stamp card not completed yet');
          return false;
        }

        if (card.redeemedAt) {
          console.log('Reward already redeemed');
          return false;
        }

        // Create redemption transaction
        const transaction: StampTransaction = {
          id: generateTransactionId(),
          stampCardId: card.id,
          merchantId: card.merchantId,
          merchantName: card.merchantName,
          type: 'redeemed',
          createdAt: Date.now(),
          notes: `Redeemed: ${card.reward}`,
        };

        // Mark as redeemed
        const updatedCard: StampCard = {
          ...card,
          redeemedAt: Date.now(),
        };

        const newStampCards = [...stampCards];
        newStampCards[cardIndex] = updatedCard;

        set({
          stampCards: newStampCards,
          transactions: [transaction, ...get().transactions],
          totalRewardsRedeemed: totalRewardsRedeemed + 1,
        });

        console.log('🎁 Reward redeemed!', card.reward, 'at', card.merchantName);
        return true;
      },

      // ====================================================================
      // RESET STAMP CARD
      // ====================================================================

      resetStampCard: (stampCardId) => {
        const { stampCards } = get();
        
        const cardIndex = stampCards.findIndex((card) => card.id === stampCardId);
        
        if (cardIndex === -1) return;

        const card = stampCards[cardIndex];

        // Create new stamp card for the same merchant
        const newCard: StampCard = {
          ...card,
          id: generateId(),
          currentStamps: 0,
          completed: false,
          completedAt: undefined,
          redeemedAt: undefined,
          createdAt: Date.now(),
          progress: 0,
        };

        const newStampCards = [...stampCards];
        newStampCards[cardIndex] = newCard;

        set({ stampCards: newStampCards });

        console.log('🔄 Stamp card reset for', card.merchantName);
      },

      // ====================================================================
      // GETTERS
      // ====================================================================

      getActiveStampCards: () => {
        return get().stampCards.filter(
          (card) => !card.completed && (!card.expiresAt || card.expiresAt > Date.now())
        );
      },

      getCompletedStampCards: () => {
        return get().stampCards.filter((card) => card.completed && !card.redeemedAt);
      },

      getStampCardByMerchant: (merchantId) => {
        return get().stampCards.find(
          (card) => card.merchantId === merchantId && !card.completed && !card.redeemedAt
        );
      },

      // ====================================================================
      // EXPIRATION HANDLING
      // ====================================================================

      checkExpiredCards: () => {
        const { stampCards } = get();
        const now = Date.now();
        
        const expiredCards = stampCards.filter(
          (card) => card.expiresAt && card.expiresAt < now && !card.completed
        );

        if (expiredCards.length > 0) {
          // Create expiration transactions
          const transactions: StampTransaction[] = expiredCards.map((card) => ({
            id: generateTransactionId(),
            stampCardId: card.id,
            merchantId: card.merchantId,
            merchantName: card.merchantName,
            type: 'expired',
            createdAt: now,
            notes: `Stamp card expired with ${card.currentStamps}/${card.requiredStamps} stamps`,
          }));

          // Remove expired cards
          const activeCards = stampCards.filter(
            (card) => !card.expiresAt || card.expiresAt >= now || card.completed
          );

          set({
            stampCards: activeCards,
            transactions: [...transactions, ...get().transactions],
          });

          console.log(`⚠️ ${expiredCards.length} stamp card(s) expired`);
        }
      },

      // ====================================================================
      // BADGE SYSTEM
      // ====================================================================

      unlockBadge: (badgeId) => {
        const { badges } = get();
        
        const badgeIndex = badges.findIndex((b) => b.id === badgeId);
        
        if (badgeIndex === -1) return;

        const badge = badges[badgeIndex];
        
        if (badge.unlockedAt) {
          console.log('Badge already unlocked:', badge.name);
          return;
        }

        const updatedBadge = {
          ...badge,
          unlockedAt: Date.now(),
        };

        const newBadges = [...badges];
        newBadges[badgeIndex] = updatedBadge;

        set({ badges: newBadges });

        console.log('🏆 Badge unlocked!', badge.name);
      },

      // ====================================================================
      // TRANSACTION HISTORY
      // ====================================================================

      getRecentTransactions: (limit = 10) => {
        return get()
          .transactions.sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);
      },
    }),
    {
      name: 'uma-loyalty-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCategoryColor = (category: StampCard['merchantCategory']): string => {
  const colors: Record<StampCard['merchantCategory'], string> = {
    food: '#FF6B6B',
    cafe: '#6F4E37',
    wellness: '#2ECC71',
    shopping: '#F39C12',
    entertainment: '#9B59B6',
    fitness: '#E74C3C',
  };
  return colors[category];
};

export const getStampIcon = (design: StampCard['stampDesign']): string => {
  const icons: Record<StampCard['stampDesign'], string> = {
    circle: '⭕',
    star: '⭐',
    heart: '❤️',
    coffee: '☕',
    pizza: '🍕',
    dumbbell: '💪',
    cart: '🛒',
  };
  return icons[design];
};

export const formatReward = (card: StampCard): string => {
  if (card.reward.toLowerCase().includes('free')) {
    return card.reward;
  }
  return `${card.reward} (Worth ₹${card.rewardValue})`;
};
