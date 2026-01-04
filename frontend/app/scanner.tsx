import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CameraView, Camera } from 'expo-camera';
import { X, CheckCircle, AlertCircle, Zap, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useWalletStore } from '@/store/walletStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';
import { useMissionStore } from '@/store/missionStore';
import { useUserStore } from '@/store/userStore';
import { canAccessFeature } from '@/constants/gamification';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

type ScanState = 'scanning' | 'success' | 'error';

export default function ScannerScreen() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [scanData, setScanData] = useState<any>(null);
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;
  const successAnim = React.useRef(new Animated.Value(0)).current;

  const { processCashback, activeBookings } = useWalletStore();
  const { gamification } = useUserStore();
  const canAccessLoyaltyCards = canAccessFeature(gamification.xp.current, 'LOYALTY_CARDS');

  useEffect(() => {
    getCameraPermissions();
    startScanAnimation();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;

    setScanned(true);

    try {
      const parsedData = JSON.parse(data);

      // Validate QR data
      if (parsedData.type === 'merchant' || parsedData.type === 'user' || parsedData.type === 'booking') {
        setScanData(parsedData);
        setScanState('success');

        // Success animation
        Animated.spring(successAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }).start();

        // Process the scan
        setTimeout(() => {
          handleScanSuccess(parsedData);
        }, 1500);
      } else {
        throw new Error('Invalid QR code type');
      }
    } catch (error) {
      setScanState('error');
      Alert.alert(
        'Invalid QR Code',
        'This QR code is not recognized by Utopia. Please scan a valid merchant or user QR code.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setScanned(false);
              setScanState('scanning');
            },
          },
        ]
      );
    }
  };

  const handleScanSuccess = async (data: any) => {
    if (data.type === 'booking') {
      // This is a booking QR - simulate merchant scanning it
      const booking = activeBookings.find(b => b.id === data.bookingId);

      if (booking && booking.status === 'active') {
        const cashbackAmount = booking.cashbackAmount || 0;

        // Process cashback
        processCashback(data.bookingId, cashbackAmount, data.merchant);

        // Earn loyalty stamp for booking redemption
        const stampEarned = useLoyaltyStore.getState().earnStamp(
          booking.merchant,
          booking.dealId,
          'Merchant Location'
        );

        // Track mission progress for QR scan
        useMissionStore.getState().trackQRScan(data.merchantId || data.merchant);

        const stampMessage = stampEarned ? '\n🎯 +1 Loyalty Stamp earned!' : '';

        Alert.alert(
          '🎉 Cashback Credited!',
          `Congratulations! ₹${cashbackAmount.toFixed(2)} has been added to your wallet as cashback from ${data.merchant}.${stampMessage}`,
          [
            {
              text: stampEarned ? 'View Loyalty' : 'View Wallet',
              onPress: () => {
                router.replace(stampEarned ? '/loyalty' : '/(tabs)/profile');
              },
            },
            {
              text: 'Great!',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Booking Not Found',
          'This booking has already been redeemed or is no longer active.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } else if (data.type === 'merchant') {
      // Earn loyalty stamp for merchant scan
      const stampEarned = useLoyaltyStore.getState().earnStamp(
        data.merchantId,
        undefined,
        data.location
      );

      // Track mission progress for merchant QR scan
      useMissionStore.getState().trackQRScan(data.merchantId || data.merchantName);

      const message = stampEarned
        ? `Connected to ${data.merchantName || 'Merchant'}! \n🎯 Stamp earned on your loyalty card!`
        : `Connected to ${data.merchantName || 'Merchant'}. Check your wallet for new deals!`;

      const buttons = [
        {
          text: stampEarned ? 'View Loyalty Cards' : 'View Wallet',
          onPress: () => {
            if (stampEarned && !canAccessLoyaltyCards) {
              Alert.alert(
                'Feature Locked',
                'Unlock Loyalty Cards at Silver I rank (750 XP). Complete missions to earn XP!',
                [
                  { text: 'OK' },
                ]
              );
            } else {
              router.push(stampEarned ? '/loyalty' : '/(tabs)/profile');
            }
          },
        },
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ];

      Alert.alert(
        stampEarned ? 'Stamp Earned! 🎯' : 'Merchant Scanned!',
        message,
        buttons
      );
    } else if (data.type === 'user') {
      // Send friend request
      try {
        const identifier = data.email || data.username;
        if (!identifier) throw new Error('Invalid user QR code');

        // Import dynamically to avoid circular deps if any, or just use the service
        const { socialService } = require('@/services/api/socialService');

        const res = await socialService.sendRequest(identifier);

        if (res.error) {
          Alert.alert('Error', res.error, [{ text: 'OK', onPress: () => setScanned(false) }]);
        } else {
          Alert.alert(
            'Friend Request Sent! 👋',
            `Request sent to ${data.name || identifier}`,
            [{ text: 'Great!', onPress: () => router.back() }]
          );
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to process friend code', [{ text: 'OK', onPress: () => setScanned(false) }]);
      }
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Requesting camera permission...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.messageContainer}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={styles.messageTitle}>Camera Access Required</Text>
          <Text style={styles.messageText}>
            Please grant camera permission in settings to scan QR codes.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCAN_AREA_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Top Bar */}
          <SafeAreaView style={styles.topBar}>
            <View style={styles.topBarContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.title}>Scan QR Code</Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>

          {/* Scan Area */}
          <View style={styles.scanAreaContainer}>
            <View style={styles.scanArea}>
              {/* Corner Markers */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Scan Line */}
              {scanState === 'scanning' && (
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslateY }],
                    },
                  ]}
                />
              )}

              {/* Success Indicator */}
              {scanState === 'success' && (
                <Animated.View
                  style={[
                    styles.successIndicator,
                    {
                      opacity: successAnim,
                      transform: [
                        {
                          scale: successAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1],
                          }),
                        },
                      ],
                    },
                  ]}>
                  <CheckCircle size={64} color={theme.colors.primary} fill={theme.colors.primary} />
                </Animated.View>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <Zap size={20} color={theme.colors.primary} />
              <Text style={styles.instructions}>
                {scanState === 'scanning' && 'Align QR code within the frame'}
                {scanState === 'success' && 'QR code scanned successfully!'}
                {scanState === 'error' && 'Invalid QR code'}
              </Text>
            </View>
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Scan merchant QR codes to:</Text>
              <Text style={styles.infoText}>
                • Unlock exclusive deals{'\n'}
                • Earn loyalty points{'\n'}
                • Get instant rewards
              </Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBar: {
    backgroundColor: 'transparent',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: theme.colors.primary,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  successIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -32,
    marginLeft: -32,
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 10,
  },
  instructions: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  bottomInfo: {
    padding: 20,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 163, 0.2)',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  messageText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.background,
  },
});
