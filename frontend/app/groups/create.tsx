import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, Search } from 'lucide-react-native';
import { useSocialStore, Friend } from '../../store/socialStore';
import { theme } from '../../constants/theme';

const EMOJI_OPTIONS = ['🎉', '🍕', '🍻', '🎬', '✈️', '🎮', '⚽', '🎵', '💼', '🏠'];

import { useAppTheme } from '../../store/themeStore';

export default function CreateGroupScreen() {
    const router = useRouter();
    const theme = useAppTheme();
    const styles = getStyles(theme);
    const { friends, createGroup, fetchFriends } = useSocialStore();
    const [name, setName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('👥');
    const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchFriends();
    }, []);

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Missing Name', 'Please give your group a name');
            return;
        }
        if (selectedFriends.length === 0) {
            Alert.alert('No Members', 'Please select at least one friend');
            return;
        }

        try {
            await createGroup(name, 'custom', selectedFriends, selectedEmoji);
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to create group');
        }
    };

    const toggleFriend = (id: string) => {
        if (selectedFriends.includes(id)) {
            setSelectedFriends(prev => prev.filter(fid => fid !== id));
        } else {
            setSelectedFriends(prev => [...prev, id]);
        }
    };

    const filteredFriends = friends.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderFriendItem = ({ item }: { item: Friend }) => {
        const isSelected = selectedFriends.includes(item.id);
        return (
            <TouchableOpacity
                style={[styles.friendItem, isSelected && styles.friendItemSelected]}
                onPress={() => toggleFriend(item.id)}
            >
                <View style={styles.avatar}>
                    <Text style={{ fontSize: 20 }}>{item.avatar || '👤'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.friendName}>{item.name}</Text>
                    <Text style={styles.friendPhone}>{item.phone}</Text>
                </View>
                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Check size={14} color="#ffffff" />}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>New Squad</Text>
                <TouchableOpacity onPress={handleCreate} disabled={!name.trim() || selectedFriends.length === 0}>
                    <Text style={[styles.createButtonText, (!name.trim() || selectedFriends.length === 0) && { opacity: 0.5 }]}>
                        Create
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={styles.inputSection}>
                <View style={styles.emojiSelector}>
                    <Text style={styles.selectedEmoji}>{selectedEmoji}</Text>
                </View>
                <TextInput
                    style={styles.nameInput}
                    placeholder="Group Name (e.g. Weekend Plans)"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />
            </View>

            <View style={styles.emojiListContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
                    {EMOJI_OPTIONS.map(emoji => (
                        <TouchableOpacity
                            key={emoji}
                            onPress={() => setSelectedEmoji(emoji)}
                            style={[styles.emojiOption, selectedEmoji === emoji && styles.emojiOptionSelected]}
                        >
                            <Text style={{ fontSize: 20 }}>{emoji}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.membersSection}>
                <Text style={styles.sectionTitle}>Add Members ({selectedFriends.length})</Text>

                <View style={styles.searchBar}>
                    <Search size={20} color={theme.colors.textSecondary} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search friends..."
                        placeholderTextColor={theme.colors.textSecondary}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <FlatList
                    data={filteredFriends}
                    renderItem={renderFriendItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.friendsList}
                />
            </View>
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
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    createButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    emojiSelector: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedEmoji: {
        fontSize: 30,
    },
    nameInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500',
        color: theme.colors.text,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingVertical: 8,
    },
    emojiListContainer: {
        height: 50,
        marginBottom: 20,
    },
    emojiOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emojiOptionSelected: {
        backgroundColor: theme.colors.primary + '20',
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    membersSection: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginLeft: 20,
        marginBottom: 12,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        marginHorizontal: 20,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
        color: theme.colors.text,
    },
    friendsList: {
        padding: 20,
        paddingTop: 0,
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: theme.colors.background,
        borderRadius: 12,
        marginBottom: 8,
    },
    friendItemSelected: {
        backgroundColor: theme.colors.primary + '10',
        borderColor: theme.colors.primary,
        borderWidth: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    friendName: {
        fontSize: 15,
        fontWeight: '500',
        color: theme.colors.text,
    },
    friendPhone: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
});
