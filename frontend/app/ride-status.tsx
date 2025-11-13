import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  MapPin,
  Navigation,
  Clock,
  Phone,
  User,
  Car,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react-native';
import { useRideStore, type RideStatus } from '../store/rideStore';
import { theme } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function RideStatusScreen() {
  const activeRide = useRideStore((state) => state.activeRide);
  const updateRideStatus = useRideStore((state) => state.updateRideStatus);
  const completeRide = useRideStore((state) => state.completeRide);
  const cancelRide = useRideStore((state) => state.cancelRide);

  const [progress, setProgress] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (!activeRide) {
      router.replace('/(tabs)');
      return;
    }

    // Pulse animation for active status
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate ride progression
    if (activeRide.status === 'confirmed') {
      setTimeout(() => updateRideStatus(activeRide.id, 'arriving'), 3000);
    } else if (activeRide.status === 'arriving') {
      setTimeout(() => updateRideStatus(activeRide.id, 'ongoing'), 8000);
    } else if (activeRide.status === 'ongoing') {
      setTimeout(() => {
        completeRide(activeRide.id);
        router.push('/ride-complete');
      }, 12000);
    }

    // Progress bar animation
    const targetProgress = getProgressValue(activeRide.status);
    Animated.timing(progress, {
      toValue: targetProgress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [activeRide?.status]);

  const getProgressValue = (status: RideStatus) => {
    switch (status) {
      case 'confirmed':
        return 0.25;
      case 'arriving':
        return 0.5;
      case 'ongoing':
        return 0.75;
      case 'completed':
        return 1;
      default:
        return 0;
    }
  };

  const getStatusInfo = (status: RideStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          title: 'Ride Confirmed!',
          subtitle: 'Finding your driver...',
          icon: CheckCircle2,
          color: theme.colors.primary,
        };
      case 'arriving':
        return {
          title: 'Driver Arriving',
          subtitle: `${activeRide?.driverName} is on the way`,
          icon: Navigation,
          color: '#FFA500',
        };
      case 'ongoing':
        return {
          title: 'Ride in Progress',
          subtitle: 'Heading to destination',
          icon: Car,
          color: '#4CAF50',
        };
      default:
        return {
          title: 'Searching...',
          subtitle: 'Please wait',
          icon: Clock,
          color: theme.colors.textSecondary,
        };
    }
  };

  const handleCancelRide = () => {
    if (activeRide) {
      cancelRide(activeRide.id);
      router.back();
    }
  };

  if (!activeRide) {
    return null;
  }

  const statusInfo = getStatusInfo(activeRide.status);
  const StatusIcon = statusInfo.icon;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <Animated.View
          style={[
            styles.statusIconContainer,
            {
              backgroundColor: statusInfo.color + '20',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <StatusIcon size={40} color={statusInfo.color} />
        </Animated.View>
        <Text style={styles.statusTitle}>{statusInfo.title}</Text>
        <Text style={styles.statusSubtitle}>{statusInfo.subtitle}</Text>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressWidth,
                backgroundColor: statusInfo.color,
              },
            ]}
          />
        </View>
      </View>

      {/* Ride Details Card */}
      <View style={styles.detailsCard}>
        {/* Driver Info */}
        {activeRide.driverName && (
          <View style={styles.driverSection}>
            <View style={styles.driverAvatar}>
              <User size={32} color={theme.colors.text} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{activeRide.driverName}</Text>
              <Text style={styles.vehicleNumber}>{activeRide.vehicleNumber}</Text>
            </View>
            <Pressable style={styles.callButton}>
              <Phone size={20} color={theme.colors.primary} />
            </Pressable>
          </View>
        )}

        {/* OTP */}
        {activeRide.otp && activeRide.status === 'arriving' && (
          <View style={styles.otpContainer}>
            <AlertCircle size={16} color={theme.colors.primary} />
            <Text style={styles.otpLabel}>Share OTP with driver:</Text>
            <Text style={styles.otpValue}>{activeRide.otp}</Text>
          </View>
        )}

        {/* Route Info */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <View style={styles.routeIconContainer}>
              <Navigation size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.routeDetails}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>
                {activeRide.pickup.address}
              </Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={[styles.routeIconContainer, styles.destinationIconContainer]}>
              <MapPin size={16} color="#FF4444" />
            </View>
            <View style={styles.routeDetails}>
              <Text style={styles.routeLabel}>Destination</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>
                {activeRide.destination.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Ride Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Clock size={16} color={theme.colors.textSecondary} />
            <Text style={styles.statLabel}>ETA</Text>
            <Text style={styles.statValue}>{activeRide.estimatedTime} min</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.fareLabel}>Fare</Text>
            <Text style={styles.fareValue}>₹{activeRide.price}</Text>
          </View>
        </View>
      </View>

      {/* Provider Badge */}
      <View style={styles.providerBadge}>
        <Text style={styles.providerText}>
          Powered by {activeRide.providerName} via ONDC
        </Text>
      </View>

      {/* Cancel Button */}
      {(activeRide.status === 'confirmed' || activeRide.status === 'arriving') && (
        <Pressable style={styles.cancelButton} onPress={handleCancelRide}>
          <X size={18} color="#FF4444" />
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statusSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    marginBottom: theme.spacing.lg,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  driverName: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  vehicleNumber: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  otpLabel: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  otpValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  routeSection: {
    marginBottom: theme.spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  routeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationIconContainer: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: theme.colors.primary,
    marginLeft: 15,
    marginVertical: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#2A2A2A',
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
  },
  fareLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  fareValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  providerBadge: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  providerText: {
    fontSize: theme.fontSize.xs,
    color: '#A78BFA',
    textAlign: 'center',
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
    gap: theme.spacing.sm,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: '#FF4444',
  },
});
