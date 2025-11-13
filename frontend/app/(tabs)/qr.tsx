import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Camera, Share2, Download, Sparkles } from 'lucide-react-native';
import { theme } from '@/constants/theme';

// Mock user data - replace with actual auth
const mockUser = {
  userId: 'user_12345',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
};

export default function QRCodeScreen() {
  const router = useRouter();
  const [qrData] = useState({
    userId: mockUser.userId,
    timestamp: Date.now(),
    type: 'user',
  });

  const qrDataString = JSON.stringify(qrData);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Scan my UMA QR code to connect! User: ${mockUser.name}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleScanMerchant = () => {
    router.push('/scanner');
  };

  const handleDownload = () => {
    Alert.alert('Download QR', 'QR code saved to gallery', [{ text: 'OK' }]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My QR Code</Text>
          <Text style={styles.subtitle}>
            Share this code to claim rewards and connect with merchants
          </Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            {/* Decorative corners */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* QR Code */}
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrDataString}
                size={220}
                color={theme.colors.text}
                backgroundColor={theme.colors.surface}
                logo={require('@/assets/images/icon.png')}
                logoSize={40}
                logoBackgroundColor={theme.colors.surface}
                logoBorderRadius={10}
              />
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{mockUser.name}</Text>
              <Text style={styles.userEmail}>{mockUser.email}</Text>
            </View>
          </View>

          {/* Scan Message */}
          <View style={styles.messageContainer}>
            <Sparkles size={16} color={theme.colors.primary} />
            <Text style={styles.messageText}>Scan to claim rewards</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleShare}
            activeOpacity={0.7}>
            <View style={styles.iconButtonInner}>
              <Share2 size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.iconButtonLabel}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleDownload}
            activeOpacity={0.7}>
            <View style={styles.iconButtonInner}>
              <Download size={20} color={theme.colors.text} />
            </View>
            <Text style={styles.iconButtonLabel}>Download</Text>
          </TouchableOpacity>
        </View>

        {/* Primary Action */}
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScanMerchant}
          activeOpacity={0.9}>
          <Camera size={22} color={theme.colors.background} strokeWidth={2} />
          <Text style={styles.scanButtonText}>Scan Merchant QR</Text>
        </TouchableOpacity>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoText}>
              • Show this QR code to merchants to claim rewards{'\n'}
              • Scan merchant QR codes to unlock exclusive deals{'\n'}
              • Earn points with every transaction
            </Text>
          </View>
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
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: theme.colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
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
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userEmail: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(0, 217, 163, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  messageText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 24,
  },
  iconButton: {
    alignItems: 'center',
    gap: 8,
  },
  iconButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.background,
    letterSpacing: -0.2,
  },
  infoSection: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
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
    lineHeight: 20,
  },
});
