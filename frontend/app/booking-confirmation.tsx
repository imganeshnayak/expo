import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { CheckCircle, Share2, X, Clock, MapPin } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/store/walletStore';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeBookings } = useWalletStore();
  
  // Find booking from params or active bookings
  const bookingId = params.bookingId as string;
  const booking = activeBookings.find(b => b.id === bookingId);

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.back()}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My booking for ${booking.dealTitle} at ${booking.merchant}. Booking ID: ${booking.id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Success Icon */}
        <View style={styles.successContainer}>
          <View style={styles.successCircle}>
            <CheckCircle size={64} color={theme.colors.success} fill={theme.colors.success} />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Show this QR code at {booking.merchant} to claim your deal
          </Text>
        </View>

        {/* Deal Info */}
        <View style={styles.dealInfo}>
          <Text style={styles.dealTitle}>{booking.dealTitle}</Text>
          <Text style={styles.dealMerchant}>{booking.merchant}</Text>
          <View style={styles.dealMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>
                {new Date(booking.timestamp).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            {/* Decorative corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={booking.qrData}
                size={200}
                color={theme.colors.text}
                backgroundColor={theme.colors.surface}
                logoBackgroundColor={theme.colors.surface}
              />
            </View>
          </View>

          <Text style={styles.bookingId}>Booking ID: {booking.id.slice(0, 12)}</Text>
        </View>

        {/* Cashback Info */}
        {booking.cashbackAmount && (
          <View style={styles.cashbackBanner}>
            <Text style={styles.cashbackText}>
              ✨ Earn ₹{booking.cashbackAmount} cashback
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            activeOpacity={0.8}>
            <Share2 size={20} color={theme.colors.primary} />
            <Text style={styles.shareButtonText}>Share Booking</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to redeem:</Text>
          <Text style={styles.instructionsText}>
            1. Visit {booking.merchant}{'\n'}
            2. Show this QR code to the staff{'\n'}
            3. Enjoy your {booking.dealDiscount}% discount{'\n'}
            4. Cashback will be credited instantly
          </Text>
        </View>
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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
    marginBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successCircle: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
  dealInfo: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  dealMerchant: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  dealMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  topLeft: {
    top: 12,
    left: 12,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 12,
    right: 12,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 12,
    left: 12,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 12,
    right: 12,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  qrCodeWrapper: {
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  bookingId: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: 12,
    fontFamily: 'monospace',
  },
  cashbackBanner: {
    backgroundColor: 'rgba(0, 217, 163, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  cashbackText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  actions: {
    marginBottom: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  instructionsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  instructionsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.background,
  },
});
