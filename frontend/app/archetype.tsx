import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react-native';
import { useSocialStore } from '../store/socialStore';
import { theme } from '../constants/theme';

const ARCHETYPES = [
    {
        id: 'deal_hunter',
        title: 'The Deal Hunter',
        emoji: '🕵️‍♂️',
        description: 'You never pay full price. You know every coupon code and happy hour in town.',
        color: '#10b981',
    },
    {
        id: 'socialite',
        title: 'The Socialite',
        emoji: '🥂',
        description: 'You’re the life of the party. You love organizing group outings and sharing experiences.',
        color: '#f472b6',
    },
    {
        id: 'explorer',
        title: 'The Explorer',
        emoji: '🧭',
        description: 'You love trying new places. "Hidden gem" is your favorite phrase.',
        color: '#3b82f6',
    },
    {
        id: 'saver',
        title: 'The Saver',
        emoji: '💰',
        description: 'You’re building wealth. Every rupee saved is a rupee earned for your future.',
        color: '#f59e0b',
    },
];

import { useAppTheme } from '../store/themeStore';

export default function ArchetypeScreen() {
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const router = useRouter();
    const { myArchetype, setArchetype, fetchArchetype } = useSocialStore();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        fetchArchetype();
    }, []);

    useEffect(() => {
        if (myArchetype) {
            setSelectedId(myArchetype);
        }
    }, [myArchetype]);

    const handleSelect = async (id: string) => {
        setSelectedId(id);
        await setArchetype(id);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate('/(tabs)/social?tab=add')} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>Choose Your Persona</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.intro}>
                    <Sparkles size={48} color={theme.colors.primary} />
                    <Text style={styles.introTitle}>Who are you in Utopia?</Text>
                    <Text style={styles.introText}>
                        Select the archetype that best describes your spending and social style. This helps us personalize your experience!
                    </Text>
                </View>

                <View style={styles.grid}>
                    {ARCHETYPES.map((archetype) => {
                        const isSelected = selectedId === archetype.id;
                        return (
                            <TouchableOpacity
                                key={archetype.id}
                                style={[
                                    styles.card,
                                    isSelected && { borderColor: archetype.color, backgroundColor: archetype.color + '10' }
                                ]}
                                onPress={() => handleSelect(archetype.id)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: archetype.color + '20' }]}>
                                    <Text style={styles.emoji}>{archetype.emoji}</Text>
                                </View>
                                <Text style={styles.cardTitle}>{archetype.title}</Text>
                                <Text style={styles.cardDesc}>{archetype.description}</Text>

                                {isSelected && (
                                    <View style={styles.checkIcon}>
                                        <CheckCircle2 size={24} color={archetype.color} fill={theme.colors.background} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    intro: {
        alignItems: 'center',
        marginBottom: 30,
    },
    introTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    grid: {
        gap: 16,
    },
    card: {
        borderWidth: 2,
        borderColor: theme.colors.border,
        borderRadius: 20,
        padding: 20,
        backgroundColor: theme.colors.surface,
        position: 'relative',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 6,
    },
    cardDesc: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        lineHeight: 20,
    },
    checkIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
});
