import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  MapPin,
  Navigation,
  Clock,
  Star,
  ArrowRight,
  ChevronLeft,
  Search,
  TrendingUp,
} from 'lucide-react-native';
import { useRideStore, type RideProvider } from '../store/rideStore';
import { useMissionStore } from '../store/missionStore';
import { theme } from '../constants/theme';

export default function RideBooking() {
  const params = useLocalSearchParams<{ dealId?: string; dealLocation?: string; dealTitle?: string }>();
  const [isBooking, setIsBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);

  const providers = useRideStore((state) => state.providers);
  const searchLoading = useRideStore((state) => state.searchLoading);
  const searchError = useRideStore((state) => state.searchError);
  const selectedPickup = useRideStore((state) => state.selectedPickup);
  const selectedDestination = useRideStore((state) => state.selectedDestination);
  const setPickup = useRideStore((state) => state.setPickup);
  const setDestination = useRideStore((state) => state.setDestination);
  const searchRides = useRideStore((state) => state.searchRides);
  const bookRide = useRideStore((state) => state.bookRide);

  // Animation
  const slideAnim = useState(new Animated.Value(50))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Set default locations if coming from a deal
    if (params.dealLocation && !selectedDestination) {
      setDestination({
        latitude: 12.9716,
        longitude: 77.5946,
        address: params.dealLocation,
      });
    }

    if (!selectedPickup) {
      // Mock current location
      setPickup({
        latitude: 12.9352,
        longitude: 77.6245,
        address: 'MG Road, Bengaluru',
      });
    }

    // Trigger ride search
    const performSearch = async () => {
      await searchRides();
    };
    
    performSearch();
  }, []);

  const handleBookRide = async (providerId: string) => {
    setIsBooking(true);
    setSelectedProvider(providerId);

    try {
      await bookRide(providerId, params.dealId);
      
      // Track mission progress - passes any ride booking
      useMissionStore.getState().trackRideBooking(providerId);
      
      router.push('/ride-status');
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsBooking(false);
      setSelectedProvider(null);
    }
  };

  const getRideTypeColor = (type: RideProvider['type']) => {
    switch (type) {
      case 'auto':
        return '#FFA500';
      case 'bus':
        return '#4CAF50';
      case 'car':
        return '#2196F3';
      default:
        return theme.colors.primary;
    }
  };

  const getRideTypeLabel = (type: RideProvider['type']) => {
    switch (type) {
      case 'auto':
        return 'Auto Rickshaw';
      case 'bus':
        return 'Bus';
      case 'car':
        return 'Car';
      default:
        return 'Ride';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Book a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Deal Info (if from deal) */}
        {params.dealTitle && (
          <Animated.View
            style={[
              styles.dealBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TrendingUp size={20} color={theme.colors.primary} />
            <View style={styles.dealBannerText}>
              <Text style={styles.dealBannerTitle}>Riding to your deal</Text>
              <Text style={styles.dealBannerSubtitle}>{params.dealTitle}</Text>
            </View>
          </Animated.View>
        )}

        {/* Location Cards */}
        <View style={styles.locationSection}>
          <View style={styles.locationCard}>
            <View style={styles.locationIconContainer}>
              <Navigation size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {selectedPickup?.address || 'Select pickup location'}
              </Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationCard}>
            <View style={[styles.locationIconContainer, styles.destinationIcon]}>
              <MapPin size={20} color="#FF4444" />
            </View>
            <View style={styles.locationDetails}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationAddress} numberOfLines={1}>
                {selectedDestination?.address || 'Select destination'}
              </Text>
            </View>
          </View>
        </View>

        {/* ONDC Providers Section */}
        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>Available Rides (ONDC)</Text>
          <Text style={styles.sectionSubtitle}>Open Network for Digital Commerce</Text>

          {searchLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Searching for rides...</Text>
            </View>
          )}

          {searchError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {searchError}</Text>
            </View>
          )}

          {!searchLoading && providers.map((provider, index) => (
            <Animated.View
              key={provider.id}
              style={[
                styles.providerCard,
                {
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 50],
                        outputRange: [0, 50 + index * 10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={styles.providerHeader}>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerLogo}>{provider.logo}</Text>
                  <View style={styles.providerDetails}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <View style={styles.providerMeta}>
                      <View
                        style={[
                          styles.rideTypeBadge,
                          { backgroundColor: getRideTypeColor(provider.type) + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.rideTypeText,
                            { color: getRideTypeColor(provider.type) },
                          ]}
                        >
                          {getRideTypeLabel(provider.type)}
                        </Text>
                      </View>
                      <View style={styles.rating}>
                        <Star size={12} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingText}>{provider.rating}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.providerPricing}>
                  <Text style={styles.price}>₹{provider.basePrice}</Text>
                  <View style={styles.eta}>
                    <Clock size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.etaText}>{provider.estimatedTime} min</Text>
                  </View>
                </View>
              </View>

              <Pressable
                style={[
                  styles.bookButton,
                  isBooking && selectedProvider === provider.id && styles.bookButtonLoading,
                ]}
                onPress={() => handleBookRide(provider.id)}
                disabled={isBooking}
              >
                {isBooking && selectedProvider === provider.id ? (
                  <ActivityIndicator color={theme.colors.background} />
                ) : (
                  <>
                    <Text style={styles.bookButtonText}>Book Ride</Text>
                    <ArrowRight size={18} color={theme.colors.background} />
                  </>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerText}>
            🌐 Powered by ONDC - Fair pricing, transparent rides
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dealBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    gap: theme.spacing.md,
  },
  dealBannerText: {
    flex: 1,
  },
  dealBannerTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dealBannerSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  locationSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationIcon: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  locationDetails: {
    flex: 1,
  },
  locationLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: theme.colors.primary,
    marginLeft: 35,
    marginVertical: 8,
  },
  providersSection: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  providerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  providerInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: theme.spacing.md,
  },
  providerLogo: {
    fontSize: 40,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rideTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rideTypeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  providerPricing: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  eta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  bookButtonLoading: {
    opacity: 0.7,
  },
  bookButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.background,
  },
  infoBanner: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  infoBannerText: {
    fontSize: theme.fontSize.sm,
    color: '#A78BFA',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorContainer: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: '#FF4444',
    textAlign: 'center',
  },
});
