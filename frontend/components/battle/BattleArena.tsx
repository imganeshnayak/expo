import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Swords, Heart, Zap, Shield, Trophy, X } from 'lucide-react-native';
import {
    BattleState,
    BattleResult,
    createInitialState,
    playerAttack,
    opponentAttack,
    tickTime,
    calculateResults,
} from '@/services/battleEngine';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BattleArenaProps {
    playerName: string;
    opponentName: string;
    opponentAvatar?: string;
    stake?: { type: string; amount: number };
    streakMultiplier?: number;
    onBattleEnd: (result: BattleResult) => void;
    onExit: () => void;
}

export default function BattleArena({
    playerName,
    opponentName,
    stake,
    streakMultiplier = 1,
    onBattleEnd,
    onExit,
}: BattleArenaProps) {
    const [battleState, setBattleState] = useState<BattleState>(() =>
        createInitialState(playerName, opponentName, true)
    );
    const [countdown, setCountdown] = useState(3);
    const [showDamage, setShowDamage] = useState<{ amount: number; isPlayer: boolean } | null>(null);

    const attackScale = useRef(new Animated.Value(1)).current;
    const damageAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const aiIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastDamage = useRef(0);

    // Countdown phase
    useEffect(() => {
        if (battleState.phase === 'intro') {
            const timer = setTimeout(() => {
                setBattleState(s => ({ ...s, phase: 'countdown' }));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [battleState.phase]);

    useEffect(() => {
        if (battleState.phase === 'countdown') {
            if (countdown > 0) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setBattleState(s => ({ ...s, phase: 'fighting' }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        }
    }, [battleState.phase, countdown]);

    // Battle timer
    useEffect(() => {
        if (battleState.phase === 'fighting') {
            timerRef.current = setInterval(() => {
                setBattleState(s => tickTime(s));
            }, 1000);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [battleState.phase]);

    // AI opponent attacks
    useEffect(() => {
        if (battleState.phase === 'fighting' && battleState.opponent.isAI) {
            // AI attacks randomly every 1.5-3 seconds
            const scheduleAIAttack = () => {
                const delay = 1500 + Math.random() * 1500;
                aiIntervalRef.current = setTimeout(() => {
                    setBattleState(s => {
                        if (s.phase !== 'fighting') return s;
                        const newState = opponentAttack(s);
                        if (newState.player.health < s.player.health) {
                            lastDamage.current = s.player.health - newState.player.health;
                            setShowDamage({ amount: lastDamage.current, isPlayer: true });
                            shake();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }
                        return newState;
                    });
                    if (battleState.phase === 'fighting') {
                        scheduleAIAttack();
                    }
                }, delay);
            };
            scheduleAIAttack();
            return () => {
                if (aiIntervalRef.current) clearTimeout(aiIntervalRef.current);
            };
        }
    }, [battleState.phase]);

    // Battle end
    useEffect(() => {
        if (battleState.phase === 'finished') {
            if (timerRef.current) clearInterval(timerRef.current);
            if (aiIntervalRef.current) clearTimeout(aiIntervalRef.current);

            const result = calculateResults(battleState, stake?.amount ? stake.amount / 10 : 1, streakMultiplier);

            if (result.won) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }

            setTimeout(() => {
                onBattleEnd(result);
            }, 2000);
        }
    }, [battleState.phase]);

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleTap = useCallback(() => {
        if (battleState.phase !== 'fighting') return;

        // Determine if it's a "perfect" hit (tap in center zone)
        const isPerfect = Math.random() < 0.15; // 15% chance for perfect

        setBattleState(s => {
            const newState = playerAttack(s, isPerfect);
            if (newState.opponent.health < s.opponent.health) {
                lastDamage.current = s.opponent.health - newState.opponent.health;
                setShowDamage({ amount: lastDamage.current, isPlayer: false });
            }
            return newState;
        });

        Haptics.impactAsync(isPerfect ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);

        // Attack animation
        Animated.sequence([
            Animated.timing(attackScale, { toValue: 0.9, duration: 50, useNativeDriver: true }),
            Animated.timing(attackScale, { toValue: 1.1, duration: 100, useNativeDriver: true }),
            Animated.timing(attackScale, { toValue: 1, duration: 50, useNativeDriver: true }),
        ]).start();
    }, [battleState.phase]);

    // Clear damage popup
    useEffect(() => {
        if (showDamage) {
            const timer = setTimeout(() => setShowDamage(null), 500);
            return () => clearTimeout(timer);
        }
    }, [showDamage]);

    const healthPercentPlayer = (battleState.player.health / battleState.player.maxHealth) * 100;
    const healthPercentOpponent = (battleState.opponent.health / battleState.opponent.maxHealth) * 100;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#0A0A0F', '#1A0A1F', '#0A1A2F']}
                style={StyleSheet.absoluteFill}
            />

            {/* Exit Button */}
            <TouchableOpacity style={styles.exitButton} onPress={onExit}>
                <X size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <Text style={styles.timer}>{battleState.timeRemaining}s</Text>
            </View>

            {/* Opponent Section */}
            <View style={styles.playerSection}>
                <View style={styles.playerInfo}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatarEmoji}>👿</Text>
                    </View>
                    <View style={styles.playerDetails}>
                        <Text style={styles.playerName}>{battleState.opponent.name}</Text>
                        <View style={styles.healthBarContainer}>
                            <View style={[styles.healthBar, { width: `${healthPercentOpponent}%`, backgroundColor: '#EF4444' }]} />
                        </View>
                        <Text style={styles.healthText}>
                            {battleState.opponent.health}/{battleState.opponent.maxHealth}
                        </Text>
                    </View>
                </View>
                {showDamage && !showDamage.isPlayer && (
                    <Animated.View style={styles.damagePopup}>
                        <Text style={styles.damageText}>-{showDamage.amount}</Text>
                    </Animated.View>
                )}
            </View>

            {/* Battle Area */}
            <Animated.View
                style={[
                    styles.battleArea,
                    { transform: [{ translateX: shakeAnim }] }
                ]}
            >
                {battleState.phase === 'intro' && (
                    <View style={styles.phaseOverlay}>
                        <Swords size={64} color="#FF6B35" />
                        <Text style={styles.phaseTitle}>Battle Starting...</Text>
                    </View>
                )}

                {battleState.phase === 'countdown' && (
                    <View style={styles.phaseOverlay}>
                        <Text style={styles.countdownText}>{countdown || 'FIGHT!'}</Text>
                    </View>
                )}

                {battleState.phase === 'fighting' && (
                    <TouchableOpacity
                        style={styles.attackZone}
                        onPress={handleTap}
                        activeOpacity={0.8}
                    >
                        <Animated.View style={[styles.attackButton, { transform: [{ scale: attackScale }] }]}>
                            <LinearGradient
                                colors={['#FF6B35', '#F7931A']}
                                style={styles.attackButtonGradient}
                            >
                                <Swords size={48} color="#FFF" />
                                <Text style={styles.attackText}>TAP TO ATTACK!</Text>
                            </LinearGradient>
                        </Animated.View>

                        {battleState.combo > 2 && (
                            <View style={styles.comboContainer}>
                                <Text style={styles.comboText}>{battleState.combo}x COMBO!</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                )}

                {battleState.phase === 'finished' && (
                    <View style={styles.phaseOverlay}>
                        <Trophy size={64} color={battleState.winner === 'player' ? '#FFD700' : '#8B949E'} />
                        <Text style={[styles.phaseTitle, { color: battleState.winner === 'player' ? '#00D9A3' : '#EF4444' }]}>
                            {battleState.winner === 'player' ? 'VICTORY!' : 'DEFEAT'}
                        </Text>
                        <Text style={styles.scoreText}>
                            {battleState.playerScore} - {battleState.opponentScore}
                        </Text>
                    </View>
                )}
            </Animated.View>

            {/* Player Section */}
            <View style={styles.playerSection}>
                <View style={styles.playerInfo}>
                    <View style={[styles.avatarContainer, { backgroundColor: '#00D9A3' }]}>
                        <Text style={styles.avatarEmoji}>🦸</Text>
                    </View>
                    <View style={styles.playerDetails}>
                        <Text style={styles.playerName}>{battleState.player.name}</Text>
                        <View style={styles.healthBarContainer}>
                            <View style={[styles.healthBar, { width: `${healthPercentPlayer}%`, backgroundColor: '#00D9A3' }]} />
                        </View>
                        <Text style={styles.healthText}>
                            {battleState.player.health}/{battleState.player.maxHealth}
                        </Text>
                    </View>
                </View>
                {showDamage && showDamage.isPlayer && (
                    <Animated.View style={styles.damagePopup}>
                        <Text style={[styles.damageText, { color: '#EF4444' }]}>-{showDamage.amount}</Text>
                    </Animated.View>
                )}
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Zap size={16} color="#FFD700" />
                    <Text style={styles.statText}>Combo: {battleState.combo}</Text>
                </View>
                <View style={styles.statItem}>
                    <Trophy size={16} color="#00D9A3" />
                    <Text style={styles.statText}>Max: {battleState.maxCombo}</Text>
                </View>
                <View style={styles.statItem}>
                    <Shield size={16} color="#8B5CF6" />
                    <Text style={styles.statText}>Perfect: {battleState.perfectHits}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    exitButton: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 100,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerContainer: {
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 100,
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    timer: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFF',
    },
    playerSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EF4444',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEmoji: {
        fontSize: 28,
    },
    playerDetails: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFF',
        marginBottom: 4,
    },
    healthBarContainer: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
    },
    healthBar: {
        height: '100%',
        borderRadius: 6,
    },
    healthText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        marginTop: 2,
    },
    damagePopup: {
        position: 'absolute',
        right: 20,
        top: 0,
    },
    damageText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FF6B35',
    },
    battleArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    phaseOverlay: {
        alignItems: 'center',
        gap: 16,
    },
    phaseTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFF',
    },
    countdownText: {
        fontSize: 72,
        fontWeight: '900',
        color: '#FF6B35',
    },
    attackZone: {
        width: '100%',
        alignItems: 'center',
    },
    attackButton: {
        width: SCREEN_WIDTH - 80,
        height: 160,
        borderRadius: 24,
        overflow: 'hidden',
    },
    attackButtonGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    attackText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFF',
    },
    comboContainer: {
        marginTop: 16,
        paddingHorizontal: 24,
        paddingVertical: 8,
        backgroundColor: '#FFD700',
        borderRadius: 20,
    },
    comboText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#000',
    },
    scoreText: {
        fontSize: 24,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.6)',
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        marginHorizontal: 20,
        borderRadius: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.8)',
    },
});
