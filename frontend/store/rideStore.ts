import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ondcApi, parseSearchResponse, parseConfirmResponse } from '../services/ondcService';
import { ONDC_ERROR_CODES } from '../constants/ondcConfig';

export type RideType = 'auto' | 'bus' | 'car';
export type RideStatus = 'searching' | 'confirmed' | 'arriving' | 'ongoing' | 'completed' | 'cancelled';

export interface RideProvider {
  id: string;
  name: string;
  type: RideType;
  logo: string;
  basePrice: number;
  estimatedTime: number; // in minutes
  rating: number;
  available: boolean;
  // ONDC specific fields
  itemId?: string;
  fulfillmentId?: string;
  distance?: string;
  currency?: string;
}

export interface RideBooking {
  id: string;
  providerId: string;
  providerName: string;
  type: RideType;
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  price: number;
  estimatedTime: number;
  status: RideStatus;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  otp?: string;
  bookedAt: number;
  completedAt?: number;
  dealId?: string;
  // ONDC specific fields
  transactionId?: string;
  orderId?: string;
  itemId?: string;
  fulfillmentId?: string;
  trackingUrl?: string;
  paymentStatus?: string;
}

interface RideState {
  // Available providers (from ONDC search)
  providers: RideProvider[];
  searchLoading: boolean;
  searchError: string | null;
  
  // Current/Active bookings
  activeRide: RideBooking | null;
  rideHistory: RideBooking[];
  
  // Booking flow state
  selectedPickup: { latitude: number; longitude: number; address: string } | null;
  selectedDestination: { latitude: number; longitude: number; address: string } | null;
  currentTransactionId: string | null;
  
  // Actions
  setPickup: (location: { latitude: number; longitude: number; address: string }) => void;
  setDestination: (location: { latitude: number; longitude: number; address: string }) => void;
  searchRides: () => Promise<boolean>;
  bookRide: (providerId: string, dealId?: string) => Promise<RideBooking>;
  updateRideStatus: (rideId: string, status: RideStatus) => void;
  completeRide: (rideId: string) => void;
  cancelRide: (rideId: string) => Promise<boolean>;
  clearBookingFlow: () => void;
  refreshRideStatus: (rideId: string) => Promise<void>;
}

// Mock ONDC providers
const mockProviders: RideProvider[] = [
  {
    id: 'namma_yatri',
    name: 'Namma Yatri',
    type: 'auto',
    logo: '🛺',
    basePrice: 45,
    estimatedTime: 8,
    rating: 4.5,
    available: true,
  },
  {
    id: 'chalo',
    name: 'Chalo',
    type: 'bus',
    logo: '🚌',
    basePrice: 15,
    estimatedTime: 25,
    rating: 4.3,
    available: true,
  },
  {
    id: 'uber_ondc',
    name: 'Uber ONDC',
    type: 'car',
    logo: '🚗',
    basePrice: 120,
    estimatedTime: 12,
    rating: 4.7,
    available: true,
  },
  {
    id: 'ola_ondc',
    name: 'Ola Auto',
    type: 'auto',
    logo: '🛺',
    basePrice: 50,
    estimatedTime: 10,
    rating: 4.4,
    available: true,
  },
];

const generateRideId = () => `ride_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

export const useRideStore = create<RideState>()(
  persist(
    (set, get) => ({
      providers: [],
      searchLoading: false,
      searchError: null,
      activeRide: null,
      rideHistory: [],
      selectedPickup: null,
      selectedDestination: null,
      currentTransactionId: null,

      setPickup: (location) => {
        set({ selectedPickup: location });
      },

      setDestination: (location) => {
        set({ selectedDestination: location });
      },

      searchRides: async () => {
        const { selectedPickup, selectedDestination } = get();
        
        if (!selectedPickup || !selectedDestination) {
          set({ searchError: 'Please select pickup and destination' });
          return false;
        }

        set({ searchLoading: true, searchError: null, providers: [] });

        try {
          // Call real ONDC search API
          const result = await ondcApi.search({
            pickup: selectedPickup,
            destination: selectedDestination,
          });

          if (!result.success) {
            const error = 'error' in result ? result.error : null;
            set({ 
              searchError: error?.message || 'Search failed',
              searchLoading: false 
            });
            return false;
          }

          // Parse and store transaction ID for later use
          const transactionId = 'transactionId' in result ? result.transactionId : null;
          set({ currentTransactionId: transactionId });

          // Wait for on_search callback (in production, use webhook)
          // For now, simulate with timeout
          await new Promise(resolve => setTimeout(resolve, 2000));

          // In production, the on_search response would come via webhook
          // For demo, parse mock response or use fallback providers
          const data = 'data' in result ? result.data : null;
          const providers = parseSearchResponse(data);
          
          if (providers.length === 0) {
            // Fallback to mock providers if ONDC returns nothing
            set({
              providers: mockProviders,
              searchLoading: false,
              searchError: 'Using demo providers (ONDC integration in progress)',
            });
            return true;
          }

          // Map ONDC providers to our format
          const mappedProviders: RideProvider[] = providers.map((p: any) => ({
            id: p.providerId,
            name: p.providerName,
            type: p.category?.includes('Auto') ? 'auto' : p.category?.includes('Bus') ? 'bus' : 'car',
            logo: p.category?.includes('Auto') ? '🛺' : p.category?.includes('Bus') ? '🚌' : '🚗',
            basePrice: p.price,
            estimatedTime: parseInt(p.estimatedTime) || 10,
            rating: 4.5,
            available: true,
            itemId: p.itemId,
            fulfillmentId: p.fulfillmentId,
            distance: p.distance,
            currency: p.currency,
          }));

          set({ 
            providers: mappedProviders,
            searchLoading: false 
          });
          
          return true;
        } catch (error: any) {
          console.error('Search error:', error);
          set({ 
            searchError: error.message || 'Failed to search rides',
            searchLoading: false,
            // Fallback to mock data
            providers: mockProviders,
          });
          return false;
        }
      },

      bookRide: async (providerId: string, dealId?: string) => {
        const { providers, selectedPickup, selectedDestination, currentTransactionId } = get();
        const provider = providers.find((p) => p.id === providerId);

        if (!provider || !selectedPickup || !selectedDestination) {
          throw new Error('Invalid booking data');
        }

        try {
          // Step 1: Select (if using real ONDC)
          if (currentTransactionId && provider.itemId && provider.fulfillmentId) {
            const selectResult = await ondcApi.select({
              transactionId: currentTransactionId,
              providerId: provider.id,
              itemId: provider.itemId,
              fulfillmentId: provider.fulfillmentId,
            });

            if (!selectResult.success) {
              throw new Error('Failed to select ride');
            }

            // Wait for on_select
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 2: Init
            const initResult = await ondcApi.init({
              transactionId: currentTransactionId,
              providerId: provider.id,
              itemId: provider.itemId,
              fulfillmentId: provider.fulfillmentId,
              customer: {
                name: 'UMA User', // Get from user profile
                phone: '+919876543210',
                email: 'user@uma.com',
              },
              billing: {
                name: 'UMA User',
                phone: '+919876543210',
                address: selectedPickup.address,
              },
            });

            if (!initResult.success) {
              throw new Error('Failed to initialize booking');
            }

            // Wait for on_init
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Step 3: Confirm
            const confirmResult = await ondcApi.confirm({
              transactionId: currentTransactionId,
              providerId: provider.id,
              orderId: `ORDER-${Date.now()}`, // Would come from on_init
              payment: {
                type: 'ON-FULFILLMENT',
                amount: provider.basePrice.toString(),
                currency: provider.currency || 'INR',
              },
            });

            if (!confirmResult.success) {
              throw new Error('Failed to confirm booking');
            }

            // Wait for on_confirm
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Parse confirmation response
            const confirmData = 'data' in confirmResult ? parseConfirmResponse(confirmResult.data) : null;

            const newRide: RideBooking = {
              id: generateRideId(),
              providerId: provider.id,
              providerName: provider.name,
              type: provider.type,
              pickup: selectedPickup,
              destination: selectedDestination,
              price: provider.basePrice,
              estimatedTime: provider.estimatedTime,
              status: 'confirmed',
              driverName: confirmData?.driver?.name || 'Driver',
              driverPhone: confirmData?.driver?.phone || '+91 98765 43210',
              vehicleNumber: confirmData?.vehicle?.registration || 'KA-01-AB-1234',
              otp: confirmData?.otp || generateOTP(),
              bookedAt: Date.now(),
              dealId,
              transactionId: currentTransactionId,
              orderId: confirmData?.orderId,
              itemId: provider.itemId,
              fulfillmentId: provider.fulfillmentId,
              trackingUrl: confirmData?.tracking?.url,
              paymentStatus: confirmData?.payment?.status,
            };

            set({ activeRide: newRide });

            // Auto-update to "arriving" after 2 seconds
            setTimeout(() => {
              get().updateRideStatus(newRide.id, 'arriving');
            }, 2000);

            return newRide;
          } else {
            // Fallback to mock booking
            const newRide: RideBooking = {
              id: generateRideId(),
              providerId: provider.id,
              providerName: provider.name,
              type: provider.type,
              pickup: selectedPickup,
              destination: selectedDestination,
              price: provider.basePrice,
              estimatedTime: provider.estimatedTime,
              status: 'confirmed',
              driverName: ['Rajesh Kumar', 'Suresh Patel', 'Amit Singh'][Math.floor(Math.random() * 3)],
              driverPhone: '+91 98765 43210',
              vehicleNumber: `KA-${Math.floor(10 + Math.random() * 90)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
              otp: generateOTP(),
              bookedAt: Date.now(),
              dealId,
            };

            set({ activeRide: newRide });

            setTimeout(() => {
              get().updateRideStatus(newRide.id, 'arriving');
            }, 2000);

            return newRide;
          }
        } catch (error: any) {
          console.error('Booking error:', error);
          throw new Error(error.message || 'Failed to book ride');
        }
      },

      updateRideStatus: (rideId: string, status: RideStatus) => {
        set((state) => {
          if (state.activeRide?.id === rideId) {
            return {
              activeRide: {
                ...state.activeRide,
                status,
              },
            };
          }
          return state;
        });
      },

      completeRide: (rideId: string) => {
        set((state) => {
          if (state.activeRide?.id === rideId) {
            const completedRide = {
              ...state.activeRide,
              status: 'completed' as RideStatus,
              completedAt: Date.now(),
            };

            return {
              activeRide: null,
              rideHistory: [completedRide, ...state.rideHistory],
              selectedPickup: null,
              selectedDestination: null,
            };
          }
          return state;
        });
      },

      cancelRide: async (rideId: string) => {
        const state = get();
        
        if (state.activeRide?.id === rideId) {
          try {
            // If we have ONDC booking info, call cancel API
            if (state.activeRide.transactionId && state.activeRide.orderId) {
              const cancelResult = await ondcApi.cancel({
                transactionId: state.activeRide.transactionId,
                providerId: state.activeRide.providerId,
                orderId: state.activeRide.orderId,
                cancellationReasonId: '001', // User cancelled
              });

              if (!cancelResult.success) {
                console.error('ONDC cancel failed, proceeding with local cancel');
              }
            }

            const cancelledRide = {
              ...state.activeRide,
              status: 'cancelled' as RideStatus,
              completedAt: Date.now(),
            };

            set({
              activeRide: null,
              rideHistory: [cancelledRide, ...state.rideHistory],
              selectedPickup: null,
              selectedDestination: null,
            });

            return true;
          } catch (error) {
            console.error('Cancel error:', error);
            return false;
          }
        }
        
        return false;
      },

      clearBookingFlow: () => {
        set({
          selectedPickup: null,
          selectedDestination: null,
          currentTransactionId: null,
          searchError: null,
        });
      },

      refreshRideStatus: async (rideId: string) => {
        const state = get();
        
        if (state.activeRide?.id !== rideId) return;
        
        try {
          if (state.activeRide.transactionId && state.activeRide.orderId) {
            const statusResult = await ondcApi.status({
              transactionId: state.activeRide.transactionId,
              providerId: state.activeRide.providerId,
              orderId: state.activeRide.orderId,
            });

            if (statusResult.success && 'data' in statusResult) {
              // Parse status and update ride
              const statusData = statusResult.data;
              // Update ride status based on ONDC response
              // This would be implemented based on actual ONDC status codes
            }
          }
        } catch (error) {
          console.error('Status refresh error:', error);
        }
      },
    }),
    {
      name: 'uma-ride-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
