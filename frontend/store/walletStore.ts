import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType = 'CASHBACK' | 'RIDE_PAYMENT' | 'WALLET_TOPUP' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  merchant?: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  bookingId?: string;
}

export interface Booking {
  id: string;
  userId: string;
  dealId: string;
  dealTitle: string;
  dealDiscount: number;
  merchant: string;
  timestamp: number;
  status: 'active' | 'completed' | 'cancelled';
  qrData: string;
  cashbackAmount?: number;
}

interface WalletState {
  balance: number;
  transactions: Transaction[];
  activeBookings: Booking[];
  
  // Actions
  addMoney: (amount: number) => void;
  withdraw: (amount: number) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  createBooking: (booking: Omit<Booking, 'id' | 'timestamp' | 'status'>) => Booking;
  completeBooking: (bookingId: string, cashbackAmount: number) => void;
  cancelBooking: (bookingId: string) => void;
  processCashback: (bookingId: string, amount: number, merchant: string) => void;
  clearAll: () => void;
}

const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balance: 1500,
      transactions: [
        {
          id: 'tx_1',
          type: 'CASHBACK',
          amount: 150,
          merchant: 'Starbucks',
          description: 'Cashback from Starbucks',
          timestamp: Date.now() - 86400000 * 2,
          status: 'completed',
        },
        {
          id: 'tx_2',
          type: 'RIDE_PAYMENT',
          amount: -120,
          merchant: 'Uber',
          description: 'Ride Payment',
          timestamp: Date.now() - 86400000 * 3,
          status: 'completed',
        },
        {
          id: 'tx_3',
          type: 'WALLET_TOPUP',
          amount: 1000,
          description: 'Wallet Top-up',
          timestamp: Date.now() - 86400000 * 5,
          status: 'completed',
        },
      ],
      activeBookings: [],

      addMoney: (amount) => {
        set((state) => ({
          balance: state.balance + amount,
          transactions: [
            {
              id: generateId(),
              type: 'WALLET_TOPUP',
              amount: amount,
              description: `Added ₹${amount} to wallet`,
              timestamp: Date.now(),
              status: 'completed',
            },
            ...state.transactions,
          ],
        }));
      },

      withdraw: (amount) => {
        const currentBalance = get().balance;
        if (currentBalance >= amount) {
          set((state) => ({
            balance: state.balance - amount,
            transactions: [
              {
                id: generateId(),
                type: 'WITHDRAWAL',
                amount: -amount,
                description: `Withdrawn ₹${amount} to bank`,
                timestamp: Date.now(),
                status: 'completed',
              },
              ...state.transactions,
            ],
          }));
          return true;
        }
        return false;
      },

      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [
            {
              ...transaction,
              id: generateId(),
              timestamp: Date.now(),
            },
            ...state.transactions,
          ],
        }));
      },

      createBooking: (bookingData) => {
        const booking: Booking = {
          ...bookingData,
          id: generateId(),
          timestamp: Date.now(),
          status: 'active',
        };

        set((state) => ({
          activeBookings: [...state.activeBookings, booking],
        }));

        return booking;
      },

      completeBooking: (bookingId, cashbackAmount) => {
        set((state) => ({
          activeBookings: state.activeBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: 'completed' as const, cashbackAmount }
              : booking
          ),
        }));
      },

      cancelBooking: (bookingId) => {
        set((state) => ({
          activeBookings: state.activeBookings.map((booking) =>
            booking.id === bookingId
              ? { ...booking, status: 'cancelled' as const }
              : booking
          ),
        }));
      },

      processCashback: (bookingId, amount, merchant) => {
        const booking = get().activeBookings.find((b) => b.id === bookingId);
        
        if (booking && booking.status === 'active') {
          // Add cashback to balance
          set((state) => ({
            balance: state.balance + amount,
            transactions: [
              {
                id: generateId(),
                type: 'CASHBACK',
                amount: amount,
                merchant: merchant,
                description: `Cashback from ${merchant}`,
                timestamp: Date.now(),
                status: 'completed',
                bookingId: bookingId,
              },
              ...state.transactions,
            ],
          }));

          // Mark booking as completed
          get().completeBooking(bookingId, amount);
        }
      },

      clearAll: () => {
        set({
          balance: 1500,
          transactions: [],
          activeBookings: [],
        });
      },
    }),
    {
      name: 'uma-wallet-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
