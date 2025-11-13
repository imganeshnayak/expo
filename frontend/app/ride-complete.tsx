import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { CheckCircle2, Star, Home } from 'lucide-react-native';
import { useRideStore } from '../store/rideStore';
import { useWalletStore } from '../store/walletStore';
import { theme } from '../constants/theme';

export default function RideComplete() {
  const rideHistory = useRideStore((state) => state.rideHistory);
  const addMoney = useWalletStore((state) => state.addMoney);
  
  const [scaleAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));

  const completedRide = rideHistory[0]; // Latest ride

  useEffect(() => {
    // Success animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate payment and cashback credit
    if (completedRide?.dealId) {
      // If ride was for a deal, give 5% cashback
      const cashback = Math.round(completedRide.price * 0.05);
      setTimeout(() => {
        addMoney(cashback, 'CASHBACK', `Ride to ${completedRide.destination.address.split(',')[0]}`);
      }, 2000);
    }
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  if (!completedRide) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <Animated.View
          style={[
            styles.successIconContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <CheckCircle2 size={80} color={theme.colors.primary} strokeWidth={2} />
        </Animated.View>

        <Animated.View style={[styles.textContent, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Ride Completed!</Text>
          <Text style={styles.subtitle}>
            You've reached your destination safely
          </Text>

          {/* Ride Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ride Type</Text>
              <Text style={styles.summaryValue}>{completedRide.providerName}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Fare</Text>
              <Text style={styles.fareValue}>₹{completedRide.price}</Text>
            </View>
            {completedRide.dealId && (
              <>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cashback Earned</Text>
                  <Text style={styles.cashbackValue}>
                    +₹{Math.round(completedRide.price * 0.05)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text style={styles.ratingTitle}>How was your ride?</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} style={styles.starButton}>
                  <Star size={32} color="#FFD700" fill="#FFD700" />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <Pressable style={styles.homeButton} onPress={handleGoHome}>
            <Home size={20} color={theme.colors.background} />
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </Pressable>

          <Text style={styles.ondcBadge}>🌐 Powered by ONDC</Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  successIconContainer: {
    marginBottom: theme.spacing.xl,
  },
  textContent: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  fareValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
  },
  cashbackValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: theme.spacing.md,
  },
  ratingSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  ratingTitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  starButton: {
    padding: theme.spacing.xs,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  homeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.background,
  },
  ondcBadge: {
    fontSize: theme.fontSize.sm,
    color: '#A78BFA',
    textAlign: 'center',
    fontWeight: '600',
  },
});
