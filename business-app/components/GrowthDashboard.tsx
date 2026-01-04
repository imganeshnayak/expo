import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, Zap } from 'lucide-react-native';
import { useGrowthStore } from '@/store/growthStore';
// Use local theme or store if available, or fallback to constants
const theme = {
    colors: {
        primary: '#2DD4BF',
        background: '#0F1115',
        surface: '#181A20',
        text: '#FFFFFF',
        textSecondary: '#9CA3AF',
        success: '#34D399',
        warning: '#FBBF24',
        error: '#EF4444',
    }
};

export const GrowthDashboard = () => {
    const { healthScore, insights, suggestions } = useGrowthStore();

    const getScoreColor = (score: number) => {
        if (score >= 80) return theme.colors.success;
        if (score >= 60) return theme.colors.warning;
        return theme.colors.error;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <Sparkles size={20} color={theme.colors.primary} />
                    <Text style={styles.title}>Growth AI</Text>
                </View>
                <View style={styles.scoreContainer}>
                    <Text style={[styles.score, { color: getScoreColor(healthScore) }]}>{healthScore}</Text>
                    <Text style={styles.scoreLabel}>Health Score</Text>
                </View>
            </View>

            {/* Insights Carousel */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {insights.map(insight => (
                    <View key={insight.id} style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <TrendingUp size={16} color={insight.trend === 'positive' ? theme.colors.success : theme.colors.warning} />
                            <Text style={[styles.insightSeverity, { color: insight.severity === 'high' ? theme.colors.error : theme.colors.textSecondary }]}>
                                {insight.severity.toUpperCase()} PRIORITY
                            </Text>
                        </View>
                        <Text style={styles.insightText}>{insight.message}</Text>
                    </View>
                ))}
            </ScrollView>

            {/* Actionable Suggestions */}
            <View style={styles.suggestionsList}>
                <Text style={styles.sectionTitle}>Recommended Actions</Text>
                {suggestions.map(suggestion => (
                    <View key={suggestion.id} style={styles.suggestionCard}>
                        <View style={styles.suggestionHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(45, 212, 191, 0.1)' }]}>
                                <Zap size={18} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                                <Text style={styles.suggestionImpact}>{suggestion.predictedImpact}</Text>
                            </View>
                        </View>

                        <Text style={styles.suggestionDesc}>{suggestion.description}</Text>

                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionButtonText}>{suggestion.recommendedAction}</Text>
                            <ArrowRight size={16} color="#000" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 24,
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    score: {
        fontSize: 24,
        fontWeight: '800',
    },
    scoreLabel: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    carousel: {
        marginBottom: 24,
    },
    insightCard: {
        width: 200,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    insightHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    insightSeverity: {
        fontSize: 10,
        fontWeight: '700',
    },
    insightText: {
        fontSize: 13,
        color: theme.colors.text,
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    suggestionsList: {
        gap: 16,
    },
    suggestionCard: {
        backgroundColor: '#22252D',
        borderRadius: 16,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    suggestionHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    suggestionImpact: {
        fontSize: 12,
        color: theme.colors.success,
        fontWeight: '600',
    },
    suggestionDesc: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 16,
        lineHeight: 20,
    },
    actionButton: {
        backgroundColor: theme.colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#000',
        fontWeight: '700',
        fontSize: 14,
    },
});
