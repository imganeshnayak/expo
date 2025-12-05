import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, ChevronRight, Zap } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import { useUserStore } from '../../store/userStore';
import { getXPProgress, getNextRank } from '../../constants/gamification';
import { useRouter } from 'expo-router';

interface XPBarProps {
    compact?: boolean;
    height?: number;
    showText?: boolean;
}

export const XPBar = ({ compact = false, height, showText = true }: XPBarProps) => {
    const router = useRouter();
    const { gamification } = useUserStore();
    const { xp, rank, isUtopiaMode } = gamification;

    const progress = getXPProgress(xp.current);
    const nextRank = getNextRank(xp.current);

    // Utopia Mode colors (dark premium neon)
    const utopiaColors = {
        primary: '#00FFF0', // Cyan neon
        secondary: '#FF00FF', // Magenta neon
        background: 'rgba(0, 255, 240, 0.1)',
        border: 'rgba(0, 255, 240, 0.3)',
    };

    // Basic Mode colors
    const basicColors = {
        primary: '#FFD700', // Gold
        secondary: '#FFA500', // Orange
        background: 'rgba(255, 215, 0, 0.15)',
        border: 'rgba(255, 215, 0, 0.3)',
    };

    const colors = isUtopiaMode ? utopiaColors : basicColors;

    if (compact) {
        return (
            <TouchableOpacity
                style={[styles.compactContainer, {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                }]}
                onPress={() => router.push('../gamification')}
                activeOpacity={0.8}
            >
                <View style={styles.compactRankIcon}>
                    <Shield color={colors.primary} size={14} fill={colors.primary} />
                </View>
                <Text style={[styles.compactRankText, { color: colors.primary }]}>
                    {rank.tier}
                </Text>
                {isUtopiaMode && <Zap size={10} color={colors.secondary} fill={colors.secondary} />}
            </TouchableOpacity>
        );
    }

    if (!showText) {
        return (
            <View style={[styles.progressBarBg, isUtopiaMode && styles.utopiaProgressBg, height ? { height, borderRadius: height / 2 } : {}]}>
                <LinearGradient
                    colors={[colors.primary, colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progress.percentage}%` }]}
                />
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.container, isUtopiaMode && styles.utopiaContainer]}
            activeOpacity={0.9}
            onPress={() => router.push('../gamification')}
        >
            <View style={styles.content}>
                <View style={styles.rankIconContainer}>
                    <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.rankIconBackground}
                    >
                        <Shield color="#FFF" size={20} fill="#FFF" />
                    </LinearGradient>
                    <View style={[styles.tierBadge, isUtopiaMode && styles.utopiaTierBadge]}>
                        <Text style={styles.tierText}>{rank.tier}</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.textRow}>
                        <Text style={[styles.rankName, isUtopiaMode && styles.utopiaText]}>
                            {rank.name}
                        </Text>
                        <Text style={[styles.xpText, { color: colors.primary }]}>
                            {xp.current.toLocaleString()} XP
                        </Text>
                    </View>
                    <View style={[styles.progressBarBg, isUtopiaMode && styles.utopiaProgressBg, height ? { height, borderRadius: height / 2 } : {}]}>
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[styles.progressBarFill, { width: `${progress.percentage}%` }]}
                        />
                    </View>
                    {nextRank && (
                        <Text style={styles.nextRankText}>
                            {progress.current.toLocaleString()} / {progress.required.toLocaleString()} to {nextRank.name}
                        </Text>
                    )}
                    {!nextRank && (
                        <Text style={[styles.nextRankText, { color: colors.primary }]}>
                            ⭐ MAX RANK ACHIEVED
                        </Text>
                    )}
                </View>

                <ChevronRight color={theme.colors.textTertiary} size={20} />
            </View>

            {isUtopiaMode && (
                <View style={styles.utopiaGlow} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        marginHorizontal: 16,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        overflow: 'hidden',
    },
    utopiaContainer: {
        backgroundColor: '#0A0A0F',
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 240, 0.3)',
        shadowColor: '#00FFF0',
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    utopiaGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 255, 240, 0.05)',
        pointerEvents: 'none',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rankIconContainer: {
        position: 'relative',
    },
    rankIconBackground: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tierBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        width: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.surface,
    },
    utopiaTierBadge: {
        backgroundColor: '#0A0A0F',
        borderColor: '#00FFF0',
    },
    tierText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    progressContainer: {
        flex: 1,
        gap: 6,
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rankName: {
        fontSize: 14,
        fontWeight: '700',
        color: theme.colors.text,
    },
    utopiaText: {
        color: '#00FFF0',
        textShadowColor: 'rgba(0, 255, 240, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 8,
    },
    xpText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: 3,
        overflow: 'hidden',
    },
    utopiaProgressBg: {
        backgroundColor: 'rgba(0, 255, 240, 0.1)',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    nextRankText: {
        fontSize: 10,
        color: theme.colors.textTertiary,
        fontWeight: '500',
    },
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
        marginRight: 8,
    },
    compactRankIcon: {
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactRankText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFD700',
    },
});
