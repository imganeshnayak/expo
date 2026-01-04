import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MessageCircle, Users, ArrowLeft, Trophy, TrendingUp } from 'lucide-react-native';
import { useSocialStore, SocialGroup } from '../../store/socialStore';
import { theme } from '../../constants/theme';
import { DEMO_SQUADS } from '@/constants/demoData';

import { useAppTheme } from '../../store/themeStore';

// Convert demo squads to the expected format (using any for demo flexibility)
const DEMO_GROUPS = DEMO_SQUADS.map((squad, index) => ({
    id: squad._id,
    name: squad.name,
    description: `Squad goal: Save ₹${squad.totalSavings * 2} together!`,
    emoji: ['🎯', '🍕', '📚'][index] || '👥',
    type: 'savings',
    purpose: 'Save money together!',
    members: Array.from({ length: squad.members }, (_, i) => ({
        id: `member-${i}`,
        role: i === 0 ? 'admin' : 'member',
    })),
    chatMessages: [],
    createdBy: 'demo-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
        totalSavings: squad.totalSavings,
        weeklyXP: squad.weeklyXP,
        missionsCompleted: 5,
        dealsShared: 12,
    },
}));

export default function GroupsScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { groups: apiGroups, fetchGroups } = useSocialStore();

    // Use demo data if API returns empty
    const groups = apiGroups.length > 0 ? apiGroups : DEMO_GROUPS as any[];

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = () => {
        Alert.alert(
            'Create Squad',
            'Squad creation coming soon! For demo, use the pre-made squads.',
            [{ text: 'OK' }]
        );
    };

    const renderGroupItem = ({ item }: { item: SocialGroup }) => (
        <TouchableOpacity
            style={styles.groupCard}
            onPress={() => Alert.alert(item.name, `${item.members?.length || 0} members • ₹${item.stats?.totalSavings || 0} saved\n\nSquad chat coming soon!`)}
        >
            <View style={styles.groupIconContainer}>
                <Text style={styles.groupEmoji}>{item.emoji || '👥'}</Text>
            </View>

            <View style={styles.groupInfo}>
                <View style={styles.groupHeader}>
                    <Text style={styles.groupName}>{item.name}</Text>
                    <View style={styles.statsBadge}>
                        <TrendingUp size={12} color="#10B981" />
                        <Text style={styles.statsText}>+{(item.stats as any)?.weeklyXP || 0} XP</Text>
                    </View>
                </View>

                <Text style={styles.lastMessage} numberOfLines={1}>
                    {item.description || 'No messages yet'}
                </Text>

                <View style={styles.groupMeta}>
                    <View style={styles.metaItem}>
                        <Users size={12} color={theme.colors.textSecondary} />
                        <Text style={styles.metaText}>{item.members?.length || 0} members</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Trophy size={12} color="#F59E0B" />
                        <Text style={styles.metaText}>₹{item.stats?.totalSavings || 0} saved</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>My Squads</Text>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateGroup}
                >
                    <Plus size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={groups}
                renderItem={renderGroupItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerInfoText}>
                            🎯 Squad up with friends to unlock group challenges and compete together!
                        </Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <MessageCircle size={48} color={theme.colors.textSecondary} />
                        <Text style={styles.emptyText}>No groups yet</Text>
                        <Text style={styles.emptySubtext}>Create a squad to start planning!</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={handleCreateGroup}
                        >
                            <Text style={styles.emptyButtonText}>Create Group</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    createButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        padding: 16,
    },
    groupCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    groupIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    groupEmoji: {
        fontSize: 28,
    },
    groupInfo: {
        flex: 1,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    timeText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    lastMessage: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: 6,
    },
    groupMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    emptyButton: {
        marginTop: 20,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },
    statsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B98115',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    statsText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#10B981',
    },
    headerInfo: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerInfoText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        textAlign: 'center',
    },
});
