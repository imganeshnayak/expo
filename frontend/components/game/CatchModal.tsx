import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Spawn } from '../../types/game';
import { Gamepad2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface CatchModalProps {
    visible: boolean;
    spawn: Spawn | null;
    onClose: () => void;
    onCatch: () => void;
    catchResult: 'success' | 'failed' | null;
    isCatching: boolean;
}

const RARITY_COLORS = {
    Common: '#4CAF50',
    Rare: '#2196F3',
    Epic: '#9C27B0',
    Mythic: '#F44336',
    Legendary: '#FFD700'
};

export default function CatchModal({ visible, spawn, onClose, onCatch, catchResult, isCatching }: CatchModalProps) {
    if (!spawn) return null;

    const color = RARITY_COLORS[spawn.archetype.rarity] || '#ffffff';

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.container}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.content}>
                    {catchResult === 'success' ? (
                        <View style={styles.resultContainer}>
                            <Text style={styles.successText}>CAUGHT!</Text>
                            <Image source={{ uri: spawn.archetype.visuals.spriteUrl }} style={styles.bigSprite} />
                            <Text style={styles.name}>{spawn.archetype.name}</Text>
                            <Text style={styles.xpText}>+20 XP</Text>
                            <TouchableOpacity onPress={onClose} style={[styles.button, { backgroundColor: color }]}>
                                <Text style={styles.buttonText}>Awesome!</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.badge, { backgroundColor: color }]}>
                                <Text style={styles.badgeText}>{spawn.archetype.rarity.toUpperCase()}</Text>
                            </View>

                            <Image source={{ uri: spawn.archetype.visuals.spriteUrl }} style={styles.sprite} />

                            <Text style={styles.name}>{spawn.archetype.name}</Text>
                            <Text style={styles.lore}>"{spawn.archetype.lore.backstory}"</Text>

                            <View style={styles.statsRow}>
                                <StatBox label="PWR" value={spawn.archetype.baseStats.power} color="#F44336" />
                                <StatBox label="CHM" value={spawn.archetype.baseStats.charm} color="#E91E63" />
                                <StatBox label="CHA" value={spawn.archetype.baseStats.chaos} color="#9C27B0" />
                            </View>

                            <Text style={styles.personality}>Personality: {spawn.archetype.lore.personality}</Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={onCatch}
                                disabled={isCatching}
                                style={[styles.catchButton, { borderColor: color }]}
                            >
                                <LinearGradient
                                    colors={['#1a1a1a', '#000']}
                                    style={styles.catchButtonGradient}
                                >
                                    {isCatching ? (
                                        <Text style={styles.catchText}>Attempting...</Text>
                                    ) : (
                                        <>
                                            <Gamepad2 size={24} color={color} />
                                            <Text style={[styles.catchText, { color }]}>CATCH</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={onClose} style={styles.fleeButton}>
                                <Text style={styles.fleeText}>Leave</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const StatBox = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <View style={styles.statBox}>
        <Text style={[styles.statLabel, { color }]}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        width: width * 0.85,
        backgroundColor: '#121212',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 16,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        letterSpacing: 1,
    },
    sprite: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 16,
    },
    bigSprite: {
        width: 160,
        height: 160,
        resizeMode: 'contain',
        marginBottom: 24,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        fontFamily: 'SpaceMono', // Assuming font exists, else fallback
    },
    lore: {
        fontSize: 14,
        color: '#aaa',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    statBox: {
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        padding: 10,
        borderRadius: 12,
        width: '30%',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    personality: {
        color: '#666',
        marginBottom: 24,
        fontSize: 12,
    },
    catchButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        marginBottom: 16,
        overflow: 'hidden',
    },
    catchButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    catchText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    fleeButton: {
        padding: 12,
    },
    fleeText: {
        color: '#666',
    },
    resultContainer: {
        alignItems: 'center',
        padding: 20,
    },
    successText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#4CAF50',
        marginBottom: 20,
        letterSpacing: 2,
    },
    xpText: {
        color: '#FFD700',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 20,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
