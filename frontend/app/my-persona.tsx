import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, BrainCircuit, Sparkles, Sun, Moon, CloudRain, Cloud, Zap, Coffee, PartyPopper, Armchair, Briefcase } from 'lucide-react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle } from 'react-native-svg';
import { useAppTheme } from '@/store/themeStore';
import { usePersonaStore, Mood } from '@/store/personaStore';
import { contextDetector } from '@/services/contextDetector';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Helper to calculate polygon points
const calculatePoints = (data: any, size: number, maxVal: number) => {
    const keys = Object.keys(data);
    const total = keys.length;
    const angleSlice = (Math.PI * 2) / total;
    const center = size / 2;
    const radius = (size / 2) * 0.8; // Use 80% of space

    const points = keys.map((key, i) => {
        const value = data[key];
        const angle = i * angleSlice - Math.PI / 2; // Start from top
        const r = (value / maxVal) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
            labelX: center + (radius + 20) * Math.cos(angle),
            labelY: center + (radius + 20) * Math.sin(angle),
            v: value,
            k: key
        };
    });

    return points;
};

export default function MyPersonaScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const { archetypes, currentMood, context, setMood, updateContext, generatePredictions, predictions } = usePersonaStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContext();
    }, []);

    const loadContext = async () => {
        const ctx = await contextDetector.analyzeCurrentContext();
        updateContext(ctx);
        generatePredictions();
        setLoading(false);
    };

    // --- Visuals ---
    const MoodChip = ({ mood, icon: Icon, label }: { mood: Mood; icon: any; label: string }) => {
        const isSelected = currentMood === mood;
        return (
            <TouchableOpacity
                style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                onPress={() => {
                    setMood(mood);
                    generatePredictions();
                }}
                activeOpacity={0.8}
            >
                <Icon size={18} color={isSelected ? '#FFF' : theme.colors.textSecondary} />
                <Text style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    const chartSize = SCREEN_WIDTH - 60;
    const points = calculatePoints(archetypes, chartSize, 100);
    const polyString = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <BrainCircuit size={20} color={theme.colors.primary} />
                    <Text style={styles.headerTitle}>My Persona</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.greeting}>
                        {context.timeOfDay === 'morning' ? 'Good Morning' :
                            context.timeOfDay === 'afternoon' ? 'Good Afternoon' :
                                context.timeOfDay === 'evening' ? 'Good Evening' : 'Late Night Vibes'}
                    </Text>
                    <Text style={styles.subGreeting}>
                        Utopia AI has customized your experience.
                    </Text>
                </View>

                {/* System Pulse (Context) */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>System Pulse</Text>
                    <View style={styles.pulseRow}>
                        <View style={styles.pulseItem}>
                            {context.weather === 'clear' ? <Sun size={24} color="#F39C12" /> :
                                context.weather === 'rain' ? <CloudRain size={24} color="#3498DB" /> :
                                    <Cloud size={24} color="#95A5A6" />}
                            <Text style={styles.pulseText}>{context.weather.toUpperCase()}</Text>
                        </View>
                        <View style={styles.vertDivider} />
                        <View style={styles.pulseItem}>
                            <Text style={styles.pulseValue}>{context.isWeekend ? 'WEEKEND' : 'WEEKDAY'}</Text>
                            <Text style={styles.pulseText}>MODE</Text>
                        </View>
                        <View style={styles.vertDivider} />
                        <View style={styles.pulseItem}>
                            <Zap size={24} color={theme.colors.primary} />
                            <Text style={styles.pulseText}>ONLINE</Text>
                        </View>
                    </View>
                </View>

                {/* Mood Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How are you feeling?</Text>
                    <View style={styles.moodGrid}>
                        <MoodChip mood="energetic" icon={Zap} label="Energetic" />
                        <MoodChip mood="relaxed" icon={Armchair} label="Relaxed" />
                        <MoodChip mood="focused" icon={Briefcase} label="Focused" />
                        <MoodChip mood="celebratory" icon={PartyPopper} label="Party" />
                        <MoodChip mood="adventurous" icon={Sparkles} label="Exploring" />
                    </View>
                </View>

                {/* Prediction */}
                <View style={styles.predictionCard}>
                    <View style={styles.predictionHeader}>
                        <Sparkles size={16} color="#FFF" />
                        <Text style={styles.predictionTitle}>AI PREDICTION</Text>
                    </View>
                    <Text style={styles.predictionText}>
                        Based on your {currentMood} mood and {context.timeOfDay} patterns, you might enjoy:
                    </Text>
                    <Text style={styles.predictionHighlight}>{predictions.nextLikelyActivity}</Text>
                </View>

                {/* Archetype Radar */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Archetype DNA</Text>
                    <View style={styles.chartContainer}>
                        <Svg height={chartSize} width={chartSize}>
                            {/* Grid Lines */}
                            {[0.2, 0.4, 0.6, 0.8, 1].map(r => (
                                <Circle
                                    key={r}
                                    cx={chartSize / 2}
                                    cy={chartSize / 2}
                                    r={(chartSize / 2 * 0.8) * r}
                                    stroke={theme.colors.surfaceLight}
                                    strokeWidth="1"
                                    fill="none"
                                />
                            ))}

                            {/* Axes */}
                            {points.map((p, i) => (
                                <Line
                                    key={i}
                                    x1={chartSize / 2}
                                    y1={chartSize / 2}
                                    x2={p.x}
                                    y2={p.y}
                                    stroke={theme.colors.surfaceLight}
                                    strokeWidth="1"
                                />
                            ))}

                            {/* Data Polygon */}
                            <Polygon
                                points={polyString}
                                fill={theme.colors.primary}
                                fillOpacity="0.2"
                                stroke={theme.colors.primary}
                                strokeWidth="2"
                            />

                            {/* Data Points */}
                            {points.map((p, i) => (
                                <Circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r="4"
                                    fill={theme.colors.primary}
                                />
                            ))}

                            {/* Labels */}
                            {points.map((p, i) => (
                                <SvgText
                                    key={i}
                                    x={p.labelX}
                                    y={p.labelY}
                                    fill={theme.colors.textSecondary}
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                >
                                    {p.k.toUpperCase()} ({p.v})
                                </SvgText>
                            ))}
                        </Svg>
                    </View>
                    <Text style={styles.chartCaption}>Points accumulate based on your visits and redemptions.</Text>
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
        padding: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    heroSection: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        color: theme.colors.text,
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },

    // Card Styles
    card: {
        marginHorizontal: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textTertiary,
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    pulseRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pulseItem: {
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    pulseValue: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.text,
    },
    pulseText: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    vertDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.colors.surfaceLight,
    },

    // Mood
    section: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme.colors.text,
        marginBottom: 16,
    },
    moodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    moodChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.surfaceLight,
        gap: 8,
    },
    moodChipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    moodLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textSecondary,
    },
    moodLabelSelected: {
        color: '#FFF',
    },

    // Prediction
    predictionCard: {
        marginHorizontal: 20,
        borderRadius: 20,
        padding: 20,
        backgroundColor: '#9B59B6', // Purple for Magic/AI
        marginBottom: 32,
        overflow: 'hidden',
    },
    predictionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    predictionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.8)',
        letterSpacing: 1,
    },
    predictionText: {
        fontSize: 15,
        color: '#FFF',
        lineHeight: 22,
        marginBottom: 8,
    },
    predictionHighlight: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
    },

    // Chart
    chartContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
    },
    chartCaption: {
        textAlign: 'center',
        fontSize: 12,
        color: theme.colors.textTertiary,
        marginTop: -20,
    },
});
