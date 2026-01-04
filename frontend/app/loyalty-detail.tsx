import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    StatusBar,
    Animated,
    Easing,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ArrowLeft,
    Gift,
    CheckCircle2,
    RefreshCw,
    Info,
    History,
    CreditCard,
    Zap,
    Lock,
    Star,
    QrCode
} from 'lucide-react-native';
import { useExternalLoyaltyStore } from '@/store/externalLoyaltyStore';
import { useAppTheme } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';

export default function LoyaltyDetailScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const params = useLocalSearchParams();
    const programId = params.programId as string;

    const { programs } = useExternalLoyaltyStore();
    const program = programs.find(p => p.id === programId);
    const { gamification, canAccessFeature } = useUserStore();
    const isLoyaltyUnlocked = canAccessFeature('LOYALTY_CARDS');

    const [isSyncing, setIsSyncing] = useState(false);
    const [activeReward, setActiveReward] = useState(false);

    // Animation for pulsing badge
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        if (activeReward) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [activeReward]);

    const simulateSync = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            // If reward is active, simulate redemption at POS
            if (activeReward) {
                setActiveReward(false);
                Alert.alert("Reward Redeemed!", `You saved on your purchase at ${program?.merchantName || 'the store'}.`);
            }
        }, 2000);
    };

    // LOCKED STATE
    if (!isLoyaltyUnlocked) {
        return (
            <View style={styles.container}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={[styles.header, { justifyContent: 'flex-start', gap: 16 }]}>
                        <TouchableOpacity onPress={() => router.back()}>
                            <ArrowLeft size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Loyalty Program</Text>
                    </View>
                    <View style={styles.lockedContainer}>
                        <View style={styles.lockedIconBg}>
                            <Lock size={48} color={theme.colors.textSecondary} />
                        </View>
                        <Text style={styles.lockedTitle}>Locked Feature</Text>
                        <Text style={styles.lockedText}>
                            You need to reach Silver Rank to access this loyalty card.
                        </Text>
                        <TouchableOpacity style={styles.lockedButton} onPress={() => router.push('/(tabs)/profile' as any)}>
                            <Text style={styles.lockedButtonText}>Check My Rank</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    if (!program) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Program not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Logic
    const rawProgress = program.currentProgress;
    const target = program.requiredForReward;
    const rewardsEarned = Math.floor(rawProgress / target);
    const currentLevelProgress = rawProgress % target;
    const percent = (currentLevelProgress / target) * 100;

    const handleActivate = () => {
        if (rewardsEarned < 1) return;
        setActiveReward(true);
        Alert.alert("Auto-Sync Activated", "Your reward will automatically apply next time you pay at the store!");
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                        <ArrowLeft size={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{program.merchantName}</Text>
                    <TouchableOpacity onPress={simulateSync} style={styles.iconButton}>
                        <RefreshCw size={20} color={isSyncing ? theme.colors.primary : theme.colors.textSecondary} style={isSyncing ? { transform: [{ rotate: '45deg' }] } : {}} />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                    {/* Card Mockup */}
                    <View style={styles.cardContainer}>
                        <View style={[styles.loyaltyCard, { backgroundColor: theme.colors.surface }]}>
                            {/* Card Header */}
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Text style={styles.merchantLogo}>{program.merchantLogo || '🏬'}</Text>
                                    <View>
                                        <Text style={styles.cardLabel}>Loyalty Member</Text>
                                        <Text style={styles.cardNumber}>•••• {program.cardNumber?.slice(-4) || '8842'}</Text>
                                    </View>
                                </View>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png' }}
                                    style={styles.cardNetwork}
                                />
                            </View>

                            {/* DUAL UI: STAMPS OR POINTS */}
                            <View style={styles.cardBody}>
                                {program.programType === 'stamps' ? (
                                    <View style={styles.stampGrid}>
                                        {Array.from({ length: target }).map((_, idx) => (
                                            <View key={idx} style={[
                                                styles.stampSlot,
                                                idx < currentLevelProgress && styles.stampFilled
                                            ]}>
                                                {idx < currentLevelProgress && <Star size={16} color="#FFF" fill="#FFF" />}
                                            </View>
                                        ))}
                                    </View>
                                ) : (
                                    <View>
                                        <View style={styles.pointsRow}>
                                            <Text style={styles.pointsValue}>
                                                {currentLevelProgress}
                                                <Text style={styles.pointsTarget}> / {target}</Text>
                                            </Text>
                                            <Text style={styles.pointsLabel}>Points</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                                        </View>
                                    </View>
                                )}
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.progressHint}>
                                    {target - currentLevelProgress} more to next reward
                                </Text>
                                {activeReward && (
                                    <Animated.View style={[styles.activeBadge, { transform: [{ scale: pulseAnim }] }]}>
                                        <CheckCircle2 size={12} color="#FFF" />
                                        <Text style={styles.activeBadgeText}>Auto-Sync Active</Text>
                                    </Animated.View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Action Area */}
                    <View style={styles.actionArea}>
                        {rewardsEarned > 0 ? (
                            <View style={styles.rewardsAvailable}>
                                <View>
                                    <Text style={styles.rewardsTitle}>{rewardsEarned} Reward Unlocked!</Text>
                                    <Text style={styles.rewardsSubtitle}>{program.reward}</Text>
                                </View>
                                {!activeReward ? (
                                    <TouchableOpacity style={styles.activateButton} onPress={handleActivate}>
                                        <Text style={styles.activateButtonText}>Activate</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.activatedState}>
                                        <Text style={styles.activatedText}>Ready to use at POS</Text>
                                    </View>
                                )}
                            </View>
                        ) : (
                            <View style={styles.keepGoing}>
                                <Text style={styles.keepGoingText}>Keep visiting to earn rewards!</Text>
                            </View>
                        )}
                    </View>

                    {/* My Journey / Gamification Link */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Journey</Text>
                            <Info size={16} color={theme.colors.textSecondary} />
                        </View>
                        <View style={styles.journeyCard}>
                            <View style={[styles.xpBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                                <Zap size={16} color={theme.colors.primary} />
                                <Text style={styles.xpText}>+10 XP per Visit</Text>
                            </View>
                            <Text style={styles.journeyText}>
                                This program contributes to your "Smart Shopper" archetype scaling.
                            </Text>
                        </View>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const getStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
    },
    iconButton: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
    },

    // Card
    cardContainer: {
        marginVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    loyaltyCard: {
        borderRadius: 24,
        padding: 24,
        minHeight: 220,
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    merchantLogo: {
        fontSize: 32,
        marginRight: 8,
    },
    cardLabel: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cardNumber: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        letterSpacing: 2,
        fontSize: 16,
        fontWeight: '600',
    },
    cardNetwork: {
        width: 48,
        height: 32,
        resizeMode: 'contain',
        opacity: 0.8,
    },

    // Dual UI
    cardBody: {
        marginVertical: 24,
    },
    // Stamps
    stampGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'center',
    },
    stampSlot: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stampFilled: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        borderStyle: 'solid',
    },

    // Points
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
        gap: 8,
    },
    pointsValue: {
        fontSize: 36,
        fontWeight: '800',
        color: theme.colors.primary,
    },
    pointsTarget: {
        fontSize: 18,
        color: theme.colors.textSecondary,
        fontWeight: '500',
    },
    pointsLabel: {
        fontSize: 16,
        color: theme.colors.text,
        fontWeight: '500',
    },
    progressBarBg: {
        height: 10,
        backgroundColor: theme.colors.surfaceHighlight || '#333',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 5,
    },

    // Footer
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressHint: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#22C55E', // Green
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activeBadgeText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
    },

    // Action Area
    actionArea: {
        marginBottom: 24,
    },
    rewardsAvailable: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    rewardsTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    rewardsSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
    },
    activateButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    activateButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 13,
    },
    activatedState: {
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    activatedText: {
        color: '#22C55E',
        fontWeight: '600',
        fontSize: 13,
    },
    keepGoing: {
        alignItems: 'center',
        padding: 16,
    },
    keepGoingText: {
        color: theme.colors.textSecondary,
        fontStyle: 'italic',
    },

    // Sections
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 12,
    },
    journeyCard: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    xpBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
        marginBottom: 12,
    },
    xpText: {
        color: theme.colors.primary,
        fontWeight: '700',
        fontSize: 13,
    },
    journeyText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },

    // Locked State
    lockedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        marginTop: -80,
    },
    lockedIconBg: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 24,
    },
    lockedTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 12,
    },
    lockedText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    lockedButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    lockedButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
    },

    errorText: {
        color: theme.colors.text,
        fontSize: 16,
        marginBottom: 16,
    },
    backButton: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFF',
        fontWeight: '600',
    }

});
