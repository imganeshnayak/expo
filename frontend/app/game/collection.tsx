import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { gameService } from '../../services/gameService';
import { UserCollection } from '../../types/game';
import { ArrowLeft, RefreshCw, Filter, SortDesc, Sparkles, Star, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 3 - 16;

type RarityFilter = 'All' | 'Common' | 'Rare' | 'Epic' | 'Mythic' | 'Legendary';
type SortOption = 'recent' | 'power' | 'rarity' | 'name';

const RARITY_ORDER = ['Legendary', 'Mythic', 'Epic', 'Rare', 'Common'];
const RARITY_COLORS: Record<string, string> = {
    Common: '#4CAF50',
    Rare: '#2196F3',
    Epic: '#9C27B0',
    Mythic: '#F44336',
    Legendary: '#FFD700',
};

export default function CollectionScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [collection, setCollection] = useState<UserCollection[]>([]);
    const [rarityFilter, setRarityFilter] = useState<RarityFilter>('All');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItem, setSelectedItem] = useState<UserCollection | null>(null);

    useEffect(() => {
        loadCollection();
    }, []);

    const loadCollection = async () => {
        const data = await gameService.getMyCollection();
        setCollection(data);
    };

    // Filter and sort collection
    const filteredCollection = useMemo(() => {
        let filtered = [...collection];

        // Apply rarity filter
        if (rarityFilter !== 'All') {
            filtered = filtered.filter(item => item.archetypeId.rarity === rarityFilter);
        }

        // Apply sorting
        switch (sortBy) {
            case 'power':
                filtered.sort((a, b) => b.stats.power - a.stats.power);
                break;
            case 'rarity':
                filtered.sort((a, b) =>
                    RARITY_ORDER.indexOf(a.archetypeId.rarity) - RARITY_ORDER.indexOf(b.archetypeId.rarity)
                );
                break;
            case 'name':
                filtered.sort((a, b) =>
                    (a.nickname || a.archetypeId.name).localeCompare(b.nickname || b.archetypeId.name)
                );
                break;
            case 'recent':
            default:
                // Already sorted by recent from API
                break;
        }

        return filtered;
    }, [collection, rarityFilter, sortBy]);

    // Count stats
    const stats = useMemo(() => {
        const byRarity: Record<string, number> = {};
        let totalPower = 0;
        let shinyCount = 0;

        collection.forEach(item => {
            byRarity[item.archetypeId.rarity] = (byRarity[item.archetypeId.rarity] || 0) + 1;
            totalPower += item.stats.power;
            if (item.isShiny) shinyCount++;
        });

        return { byRarity, totalPower, shinyCount, total: collection.length };
    }, [collection]);

    const renderItem = ({ item }: { item: UserCollection }) => (
        <TouchableOpacity
            style={[styles.card, { borderColor: RARITY_COLORS[item.archetypeId.rarity] || '#fff' }]}
            onPress={() => {
                Haptics.selectionAsync();
                setSelectedItem(item);
            }}
            activeOpacity={0.8}
        >
            {/* Rarity Badge */}
            <View style={[styles.rarityBadge, { backgroundColor: RARITY_COLORS[item.archetypeId.rarity] || '#fff' }]}>
                <Text style={styles.rarityBadgeText}>{item.archetypeId.rarity[0]}</Text>
            </View>

            {/* Shiny indicator */}
            {item.isShiny && (
                <View style={styles.shinyBadge}>
                    <Sparkles size={12} color="#FFD700" />
                </View>
            )}

            <Image source={{ uri: item.archetypeId.visuals.spriteUrl }} style={styles.image} />
            <Text style={styles.name} numberOfLines={1}>{item.nickname || item.archetypeId.name}</Text>
            <Text style={styles.powerText}>⚡ {item.stats.power}</Text>
        </TouchableOpacity>
    );

    const getBadges = () => {
        const badges = [];
        if (stats.total > 0) badges.push({ id: '1', name: 'First Steps', icon: '👣', color: '#4CAF50' });
        if (stats.total >= 10) badges.push({ id: '2', name: 'Collector', icon: '🎒', color: '#2196F3' });
        if (stats.total >= 50) badges.push({ id: '6', name: 'Hoarder', icon: '📦', color: '#FF9800' });
        if (stats.byRarity['Legendary'] > 0) badges.push({ id: '3', name: 'Legend', icon: '👑', color: '#FFD700' });
        if (stats.byRarity['Mythic'] > 0) badges.push({ id: '4', name: 'Mythic Hunter', icon: '🔮', color: '#F44336' });
        if (stats.shinyCount > 0) badges.push({ id: '5', name: 'Shiny Hunter', icon: '✨', color: '#9C27B0' });
        return badges;
    };

    const badges = getBadges();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <LinearGradient
                colors={['#0a1628', '#1a2a4a', '#0f1f3a']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>MY COLLECTION</Text>
                <TouchableOpacity onPress={loadCollection}>
                    <RefreshCw color="#aaa" size={20} />
                </TouchableOpacity>
            </View>

            {/* Stats Summary */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.totalPower}</Text>
                    <Text style={styles.statLabel}>Power</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{stats.shinyCount}</Text>
                    <Text style={styles.statLabel}>Shiny</Text>
                </View>
            </View>

            {/* Rarity Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScrollView}
                contentContainerStyle={styles.filterContainer}
            >
                {(['All', 'Legendary', 'Mythic', 'Epic', 'Rare', 'Common'] as RarityFilter[]).map((rarity) => (
                    <TouchableOpacity
                        key={rarity}
                        style={[
                            styles.filterChip,
                            rarityFilter === rarity && styles.filterChipActive,
                            rarity !== 'All' && { borderColor: RARITY_COLORS[rarity] },
                        ]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            setRarityFilter(rarity);
                        }}
                    >
                        <Text style={[
                            styles.filterChipText,
                            rarityFilter === rarity && styles.filterChipTextActive,
                            rarity !== 'All' && rarityFilter === rarity && { color: RARITY_COLORS[rarity] },
                        ]}>
                            {rarity}
                            {rarity !== 'All' && stats.byRarity[rarity] ? ` (${stats.byRarity[rarity]})` : ''}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Sort Options */}
            <View style={styles.sortRow}>
                <Text style={styles.sortLabel}>Sort:</Text>
                {(['recent', 'power', 'rarity', 'name'] as SortOption[]).map((option) => (
                    <TouchableOpacity
                        key={option}
                        style={[styles.sortOption, sortBy === option && styles.sortOptionActive]}
                        onPress={() => setSortBy(option)}
                    >
                        <Text style={[styles.sortOptionText, sortBy === option && styles.sortOptionTextActive]}>
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        alert('Trade feature coming soon!');
                    }}
                >
                    <Text style={styles.actionText}>⚖️ TRADE</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#FF4757' }]}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        router.push('/arena' as any);
                    }}
                >
                    <Text style={styles.actionText}>⚔️ ARENA</Text>
                </TouchableOpacity>
            </View>

            {/* Badges Section */}
            {badges.length > 0 && (
                <View style={styles.badgesContainer}>
                    <Text style={styles.sectionTitle}>BADGES EARNED</Text>
                    <View style={styles.badgesRow}>
                        {badges.map(badge => (
                            <View key={badge.id} style={[styles.badgeItem, { borderColor: badge.color }]}>
                                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                <Text style={[styles.badgeName, { color: badge.color }]}>{badge.name}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Collection Grid */}
            <FlatList
                data={filteredCollection}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                numColumns={3}
                contentContainerStyle={styles.list}
                columnWrapperStyle={{ gap: 12 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🎣</Text>
                        <Text style={styles.emptyText}>
                            {rarityFilter === 'All'
                                ? 'No Utopians yet! Go hunting!'
                                : `No ${rarityFilter} Utopians found`
                            }
                        </Text>
                    </View>
                }
            />

            {/* Item Detail Modal */}
            {selectedItem && (
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: RARITY_COLORS[selectedItem.archetypeId.rarity] }]}>
                        <View style={[styles.modalHeader, { backgroundColor: RARITY_COLORS[selectedItem.archetypeId.rarity] + '20' }]}>
                            {selectedItem.isShiny && <Sparkles size={20} color="#FFD700" style={styles.modalShiny} />}
                            <Image source={{ uri: selectedItem.archetypeId.visuals.spriteUrl }} style={styles.modalImage} />
                        </View>

                        <Text style={styles.modalName}>{selectedItem.nickname || selectedItem.archetypeId.name}</Text>
                        <Text style={[styles.modalRarity, { color: RARITY_COLORS[selectedItem.archetypeId.rarity] }]}>
                            {selectedItem.archetypeId.rarity} {selectedItem.isShiny && '✨ SHINY'}
                        </Text>

                        <View style={styles.modalStats}>
                            <View style={styles.modalStatBox}>
                                <Zap size={16} color="#FFD700" />
                                <Text style={styles.modalStatValue}>{selectedItem.stats.power}</Text>
                                <Text style={styles.modalStatLabel}>Power</Text>
                            </View>
                            <View style={styles.modalStatBox}>
                                <Star size={16} color="#00D9A3" />
                                <Text style={styles.modalStatValue}>{selectedItem.level || 1}</Text>
                                <Text style={styles.modalStatLabel}>Level</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.modalClose}
                            onPress={() => setSelectedItem(null)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1628',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    backButton: {
        padding: 4,
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: 2,
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    statBox: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
    },
    statValue: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: '800',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        marginTop: 4,
    },
    filterScrollView: {
        maxHeight: 44,
        marginBottom: 12,
    },
    filterContainer: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    filterChipActive: {
        backgroundColor: 'rgba(255,255,255,0.15)',
    },
    filterChipText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
        fontWeight: '600',
    },
    filterChipTextActive: {
        color: '#FFF',
    },
    sortRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 12,
    },
    sortLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 12,
    },
    sortOption: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    sortOptionActive: {
        backgroundColor: 'rgba(0,217,163,0.2)',
    },
    sortOptionText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
    },
    sortOptionTextActive: {
        color: '#00D9A3',
        fontWeight: '600',
    },
    actionRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    },
    badgesContainer: {
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
        letterSpacing: 1,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    badgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: 'rgba(255,255,255,0.05)',
        gap: 4,
    },
    badgeIcon: {
        fontSize: 11,
    },
    badgeName: {
        fontSize: 9,
        fontWeight: 'bold',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        width: ITEM_WIDTH,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        marginBottom: 12,
    },
    rarityBadge: {
        position: 'absolute',
        top: 4,
        right: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    rarityBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    shinyBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        zIndex: 1,
    },
    image: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
        marginBottom: 6,
    },
    name: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
    },
    powerText: {
        color: '#FFD700',
        fontSize: 10,
        fontWeight: '600',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#1a2a4a',
        borderRadius: 20,
        width: '100%',
        maxWidth: 300,
        overflow: 'hidden',
        borderWidth: 2,
    },
    modalHeader: {
        padding: 20,
        alignItems: 'center',
    },
    modalShiny: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    modalImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    modalName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    modalRarity: {
        fontSize: 13,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    modalStats: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginBottom: 20,
    },
    modalStatBox: {
        alignItems: 'center',
        gap: 4,
    },
    modalStatValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
    },
    modalStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.5)',
    },
    modalClose: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    modalCloseText: {
        color: '#00D9A3',
        fontWeight: '600',
        fontSize: 14,
    },
});
