import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Share,
    Alert,
    ScrollView,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { Share2, Download, Sparkles, ArrowLeft, ScanLine } from 'lucide-react-native';
import { useAppTheme } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';

const mockUser = {
    userId: 'user_12345',
    name: 'Guest User',
    email: 'guest@example.com',
};

export default function MyCodeScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { user } = useUserStore();

    const userData = user ? {
        userId: user._id,
        name: user.profile?.name || 'User',
        email: user.email,
    } : mockUser;

    const [qrData] = useState({
        userId: userData.userId,
        timestamp: Date.now(),
        type: 'user',
    });

    const qrDataString = JSON.stringify(qrData);

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Scan my Utopia QR code to add me to your squad! User: ${userData.name}`,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const handleDownload = () => {
        Alert.alert('Success', 'QR code saved to gallery', [{ text: 'OK' }]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Code</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Main QR Card */}
                <View style={styles.mainCard}>
                    <View style={styles.qrWrapper}>
                        {/* Decorative corners */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        <View style={styles.qrCodeSurface}>
                            <QRCode
                                value={qrDataString}
                                size={200}
                                color="#000000"
                                backgroundColor="#FFFFFF"
                                quietZone={10}
                            />
                        </View>

                        <View style={styles.userInfo}>
                            <Text style={styles.userName}>{userData.name}</Text>
                            <Text style={styles.userEmail}>Scan to add friend</Text>
                        </View>
                    </View>

                    {/* Quick Actions Row */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                            <Share2 size={20} color={theme.colors.text} />
                            <Text style={styles.actionLabel}>Share</Text>
                        </TouchableOpacity>
                        <View style={styles.divider} />
                        <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                            <Download size={20} color={theme.colors.text} />
                            <Text style={styles.actionLabel}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Scan Button */}
                <TouchableOpacity
                    style={styles.scanButton}
                    onPress={() => router.push('/scanner')}
                    activeOpacity={0.9}
                >
                    <View style={styles.scanIconBox}>
                        <ScanLine size={24} color="#FFF" />
                    </View>
                    <View style={styles.scanContent}>
                        <Text style={styles.scanTitle}>Scan Merchant</Text>
                        <Text style={styles.scanSubtitle}>Check-in & View Menu</Text>
                    </View>
                    <Sparkles size={16} color={theme.colors.background} style={{ opacity: 0.5 }} />
                </TouchableOpacity>

                {/* Instructions */}
                <View style={styles.infoBox}>
                    <Text style={styles.infoText}>
                        Show this code to friends so they can add you to their Squad, or use it to identify yourself at events.
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },

    // Main Card
    mainCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 20,
        width: '100%',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    qrWrapper: {
        padding: 24,
        position: 'relative',
        alignItems: 'center',
        width: '100%',
    },
    corner: {
        position: 'absolute',
        width: 24,
        height: 24,
        borderColor: theme.colors.primary,
        borderWidth: 4,
        borderRadius: 2,
    },
    topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
    topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
    bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
    bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },

    qrCodeSurface: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
    },
    userInfo: {
        alignItems: 'center',
        gap: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.colors.text,
    },
    userEmail: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },

    // Action Row
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: theme.colors.background,
        marginTop: 8,
        paddingTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 8,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.text,
    },
    divider: {
        width: 1,
        height: '100%',
        backgroundColor: theme.colors.background,
        marginHorizontal: 4,
    },

    // Scan Button
    scanButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        borderRadius: 16,
        padding: 12,
        width: '100%',
        marginBottom: 20,
    },
    scanIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    scanContent: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    scanTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.background, // Assuming dark text on primary
    },
    scanSubtitle: {
        fontSize: 12,
        color: theme.colors.background,
        opacity: 0.8,
    },

    // Info
    infoBox: {
        paddingHorizontal: 10,
    },
    infoText: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
});
