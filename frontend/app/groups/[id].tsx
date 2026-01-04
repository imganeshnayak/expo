import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, MoreVertical, Gift, Zap } from 'lucide-react-native';
import { useSocialStore, GroupMessage } from '../../store/socialStore';
import { theme } from '../../constants/theme';

export default function GroupDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { groups, sendGroupMessage } = useSocialStore();
    const [message, setMessage] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const group = groups.find(g => g.id === id);

    // Mock messages for now if none exist (since we just created the group)
    const messages = group?.chatMessages || [];

    const handleSend = async () => {
        if (!message.trim() || !group) return;

        await sendGroupMessage(group.id, message, 'text');
        setMessage('');
        // Scroll to bottom
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    };

    const renderMessage = ({ item }: { item: GroupMessage }) => {
        const isMe = item.userId === 'me' || item.userId === 'current-user-id'; // Replace with real ID check

        if (item.type === 'system') {
            return (
                <View style={styles.systemMessage}>
                    <Text style={styles.systemMessageText}>{item.message}</Text>
                </View>
            );
        }

        return (
            <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                {!isMe && (
                    <View style={styles.avatar}>
                        <Text>{item.userAvatar || '👤'}</Text>
                    </View>
                )}
                <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
                    {!isMe && <Text style={styles.senderName}>{item.userName}</Text>}
                    <Text style={[styles.messageText, isMe ? styles.messageTextMe : styles.messageTextOther]}>
                        {item.message}
                    </Text>
                    <Text style={[styles.messageTime, isMe ? styles.messageTimeMe : styles.messageTimeOther]}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    if (!group) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Group not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ArrowLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <View style={styles.groupIcon}>
                        <Text style={{ fontSize: 20 }}>{group.emoji}</Text>
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>{group.name}</Text>
                        <Text style={styles.headerSubtitle}>{group.members.length} members</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <MoreVertical size={24} color="#111827" />
                </TouchableOpacity>
            </View>

            {/* Active Mission Banner (if any) */}
            {group.activeMission && (
                <View style={styles.missionBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Zap size={16} color="#ffffff" fill="#ffffff" />
                        <Text style={styles.missionText}>Mission: {group.activeMission.missionName}</Text>
                    </View>
                    <Text style={styles.missionProgress}>{group.activeMission.progress}/{group.activeMission.target}</Text>
                </View>
            )}

            {/* Chat Area */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.chatContent}
                style={styles.chatList}
            />

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.attachButton}>
                        <Gift size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Message..."
                        value={message}
                        onChangeText={setMessage}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                        onPress={handleSend}
                        disabled={!message.trim()}
                    >
                        <Send size={20} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5', // WhatsApp-like background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    groupIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    missionBanner: {
        backgroundColor: theme.colors.primary,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    missionText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 13,
    },
    missionProgress: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    chatList: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        gap: 12,
    },
    systemMessage: {
        alignItems: 'center',
        marginVertical: 8,
    },
    systemMessageText: {
        backgroundColor: '#e5e7eb',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 12,
        color: '#4b5563',
        overflow: 'hidden',
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    messageRowMe: {
        justifyContent: 'flex-end',
    },
    messageRowOther: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#e5e7eb',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 2,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 12,
        borderRadius: 16,
    },
    messageBubbleMe: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    messageBubbleOther: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontSize: 11,
        color: theme.colors.primary,
        fontWeight: '600',
        marginBottom: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    messageTextMe: {
        color: '#ffffff',
    },
    messageTextOther: {
        color: '#1f2937',
    },
    messageTime: {
        fontSize: 10,
        marginTop: 4,
        alignSelf: 'flex-end',
    },
    messageTimeMe: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    messageTimeOther: {
        color: '#9ca3af',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 10,
    },
    attachButton: {
        padding: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
    },
    sendButton: {
        backgroundColor: theme.colors.primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#d1d5db',
    },
});
