import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
    TrendingUp,
    Users,
    ShoppingBag,
    ArrowRight,
    MoreHorizontal,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap
} from 'lucide-react-native';
import { useBusinessAnalyticsStore, formatCurrency } from '../store/businessAnalyticsStore';
import { useAuthStore } from '../store/authStore';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');

// ----------------------------------------------------------------------
// Constants & Types
// ----------------------------------------------------------------------

const DASHBOARD_CONFIG = {
    animationDuration: 300,
    pollingInterval: 30000, // 30s
    refreshThreshold: 60,
};

type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

// 1. Hero Metric (The "North Star")
const HeroMetric = ({ label, value, trend, trendValue, theme }: any) => (
    <View style={styles(theme).heroMetricContainer}>
        <View>
            <Text style={styles(theme).heroLabel}>{label}</Text>
            <Text style={styles(theme).heroValue}>{value}</Text>
        </View>
        <View style={[styles(theme).trendBadge, { backgroundColor: trend === 'up' ? theme.colors.success + '20' : theme.colors.error + '20' }]}>
            <TrendingUp size={16} color={trend === 'up' ? theme.colors.success : theme.colors.error} />
            <Text style={[styles(theme).trendText, { color: trend === 'up' ? theme.colors.success : theme.colors.error }]}>
                {trendValue}
            </Text>
        </View>
    </View>
);

// 2. Action Card (Micro-Interactions)
const ActionCard = ({ title, subtitle, icon: Icon, color, theme, onPress }: any) => (
    <TouchableOpacity
        style={[styles(theme).actionCard, { borderLeftColor: color }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={[styles(theme).actionIcon, { backgroundColor: color + '20' }]}>
            <Icon size={20} color={color} strokeWidth={2.5} />
        </View>
        <View style={styles(theme).actionContent}>
            <Text style={styles(theme).actionTitle}>{title}</Text>
            <Text style={styles(theme).actionSubtitle}>{subtitle}</Text>
        </View>
        <ArrowRight size={16} color={theme.colors.textTertiary} />
    </TouchableOpacity>
);

// 3. Insight Chip (AI Integration)
const InsightChip = ({ message, type, theme }: any) => (
    <LinearGradient
        colors={type === 'warning' ? ['#FFF4E5', '#FFE0B2'] : ['#E8F5E9', '#C8E6C9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles(theme).insightChip}
    >
        <Zap size={14} color={type === 'warning' ? '#F57C00' : '#2E7D32'} fill={type === 'warning' ? '#F57C00' : '#2E7D32'} />
        <Text style={[styles(theme).insightText, { color: type === 'warning' ? '#EF6C00' : '#2E7D32' }]}>
            {message}
        </Text>
    </LinearGradient>
);

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

import { useRouter } from 'expo-router';

export const ModernDashboard = () => {
    const router = useRouter();
    const theme = useAppTheme();
    const { analytics, initializeAnalytics, isLoading } = useBusinessAnalyticsStore();
    const { user } = useAuthStore();
    const [refreshing, setRefreshing] = useState(false);

    // Initial Load & Polling
    useEffect(() => {
        if (user?.merchantId) {
            initializeAnalytics(user.merchantId);

            const interval = setInterval(() => {
                initializeAnalytics(user.merchantId);
            }, DASHBOARD_CONFIG.pollingInterval);

            return () => clearInterval(interval);
        }
    }, [user?.merchantId]);

    const onRefresh = async () => {
        setRefreshing(true);
        if (user?.merchantId) await initializeAnalytics(user.merchantId);
        setRefreshing(false);
    };

    // Derived Data
    const revenue = analytics?.overview?.totalRevenue || 0;
    const orders = analytics?.campaignPerformance?.activeCampaigns?.reduce((acc: any, c: any) => acc + c.conversions, 0) || 0;
    const pendingActions = 3; // Mock - Replace with real state

    return (
        <SafeAreaView style={styles(theme).container} edges={['top']}>
            <ScrollView
                contentContainerStyle={styles(theme).scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
            >
                {/* Header Section */}
                <View style={styles(theme).header}>
                    <View>
                        <Text style={styles(theme).greeting}>Good Afternoon,</Text>
                        <Text style={styles(theme).merchantName}>{user?.businessName || 'Business Owner'}</Text>
                    </View>
                    <TouchableOpacity style={styles(theme).profileButton}>
                        <View style={styles(theme).avatarFallback}>
                            <Text style={styles(theme).avatarText}>{user?.businessName?.[0] || 'B'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* AI Insight (Contextual) */}
                <View style={styles(theme).insightContainer}>
                    <InsightChip message="Traffic is up 15% vs last Tuesday." type="success" theme={theme} />
                </View>

                {/* Live Customer Pulse (New Relationship Layer) */}
                <View style={styles(theme).pulseSection}>
                    <View style={styles(theme).pulseHeader}>
                        <View style={styles(theme).pulseDot} />
                        <Text style={styles(theme).pulseTitle}>Live Now • 3 Customers Viewing</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles(theme).pulseScroll}>
                        {/* Mock Live Users - simulating User App connection */}
                        <View style={styles(theme).pulseCard}>
                            <View style={[styles(theme).pulseAvatar, { borderColor: '#E5E7EB' }]}>
                                <Text style={styles(theme).pulseAvatarText}>A</Text>
                            </View>
                            <View>
                                <Text style={styles(theme).pulseUser}>Aksha (Silver)</Text>
                                <Text style={styles(theme).pulseAction}>Viewing Menu</Text>
                            </View>
                        </View>
                        <View style={styles(theme).pulseCard}>
                            <View style={[styles(theme).pulseAvatar, { borderColor: '#FFD700' }]}>
                                <Text style={styles(theme).pulseAvatarText}>J</Text>
                            </View>
                            <View>
                                <Text style={styles(theme).pulseUser}>John (Gold)</Text>
                                <Text style={styles(theme).pulseAction}>Claimed Offer</Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Hero Metrics (The Command Center) */}
                <View style={styles(theme).heroSection}>
                    <TouchableOpacity
                        style={styles(theme).heroMetricContainer}
                        onPress={() => router.push('/(tabs)/analytics' as any)}
                    >
                        <HeroMetric
                            label="Total Revenue"
                            value={formatCurrency(revenue)}
                            trend="up"
                            trendValue="+12.5%"
                            theme={theme}
                        />
                    </TouchableOpacity>
                    <View style={styles(theme).heroDivider} />
                    <TouchableOpacity
                        style={styles(theme).heroMetricContainer}
                        onPress={() => router.push('/(tabs)/analytics/orders' as any)}
                    >
                        <HeroMetric
                            label="Active Orders"
                            value={orders}
                            trend="down"
                            trendValue="-2.1%"
                            theme={theme}
                        />
                    </TouchableOpacity>
                </View>

                {/* Critical Actions (The "Is something burning?" check) */}
                <View style={styles(theme).section}>
                    <Text style={styles(theme).sectionTitle}>Needs Attention</Text>
                    <ActionCard
                        title="3 Campaigns Ending"
                        subtitle="Review performance before archival"
                        icon={Clock}
                        color={theme.colors.warning}
                        theme={theme}
                        onPress={() => router.push('/(tabs)/campaigns')}
                    />
                    <ActionCard
                        title="New Reviews"
                        subtitle="2 customers left feedback"
                        icon={Users}
                        color={theme.colors.info}
                        theme={theme}
                        onPress={() => router.push('/(tabs)/crm')}
                    />
                </View>

                {/* Quick Actions (The "Next Move") */}
                <View style={styles(theme).section}>
                    <View style={styles(theme).sectionHeader}>
                        <Text style={styles(theme).sectionTitle}>Quick Actions</Text>
                        <TouchableOpacity>
                            <MoreHorizontal size={20} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles(theme).grid}>
                        <TouchableOpacity
                            style={[styles(theme).gridItem, { backgroundColor: theme.colors.primary + '10' }]}
                            onPress={() => router.push('/(tabs)/campaign-creator-modal')}
                        >
                            <Zap size={24} color={theme.colors.primary} />
                            <Text style={[styles(theme).gridLabel, { color: theme.colors.primary }]}>Boost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles(theme).gridItem, { backgroundColor: theme.colors.secondary + '10' }]}
                            onPress={() => router.push('/(tabs)/menu')}
                        >
                            <ShoppingBag size={24} color={theme.colors.secondary} />
                            <Text style={[styles(theme).gridLabel, { color: theme.colors.secondary }]}>Products</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles(theme).gridItem, { backgroundColor: theme.colors.warning + '10' }]}
                            onPress={() => router.push('/(tabs)/profile/support')}
                        >
                            <AlertTriangle size={24} color={theme.colors.warning} />
                            <Text style={[styles(theme).gridLabel, { color: theme.colors.warning }]}>Support</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles(theme).gridItem, { backgroundColor: theme.colors.text + '05' }]}>
                            <MoreHorizontal size={24} color={theme.colors.text} />
                            <Text style={[styles(theme).gridLabel, { color: theme.colors.text }]}>More</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Spacer for bottom tab bar */}
                <View style={{ height: 100 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    greeting: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily.primary,
        marginBottom: 4,
    },
    merchantName: {
        fontSize: 24,
        color: theme.colors.text,
        fontFamily: theme.fontFamily.heading,
        letterSpacing: -0.5,
    },
    profileButton: {
        padding: 4,
    },
    avatarFallback: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: theme.fontFamily.heading,
    },
    insightContainer: {
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    insightChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    insightText: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
    pulseSection: {
        marginBottom: 24,
    },
    pulseHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    pulseDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.success,
    },
    pulseTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.success,
        fontFamily: theme.fontFamily.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    pulseScroll: {
        flexDirection: 'row',
    },
    pulseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 12,
        borderRadius: 12,
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        gap: 12,
    },
    pulseAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderWidth: 2,
    },
    pulseAvatarText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
    },
    pulseUser: {
        fontSize: 13,
        fontWeight: '600',
        color: theme.colors.text,
        fontFamily: theme.fontFamily.primary,
    },
    pulseAction: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily.primary,
    },
    heroSection: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
    },
    heroMetricContainer: {
        flex: 1,
        gap: 12,
    },
    heroLabel: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
    heroValue: {
        fontSize: 28,
        color: theme.colors.text,
        fontFamily: theme.fontFamily.heading,
        letterSpacing: -1,
    },
    heroDivider: {
        width: 1,
        backgroundColor: theme.colors.surfaceLight,
        marginHorizontal: 24,
    },
    trendBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    trendText: {
        fontSize: 12,
        fontWeight: '700',
        fontFamily: theme.fontFamily.primary,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: theme.fontFamily.heading,
        marginBottom: 16,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        borderLeftWidth: 4, // Accent border
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 4,
        fontFamily: theme.fontFamily.primary,
    },
    actionSubtitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        fontFamily: theme.fontFamily.primary,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
    },
    gridItem: {
        flex: 1,
        aspectRatio: 1,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    gridLabel: {
        fontSize: 13,
        fontWeight: '600',
        fontFamily: theme.fontFamily.primary,
    },
});
