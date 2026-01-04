/**
 * Battle Engine - Core game logic for in-app battles
 */

export interface BattlePlayer {
    id: string;
    name: string;
    avatar?: string;
    health: number;
    maxHealth: number;
    power: number;
    defense: number;
    energy: number;
    maxEnergy: number;
    isAI?: boolean;
}

export interface BattleState {
    phase: 'intro' | 'countdown' | 'fighting' | 'finished';
    player: BattlePlayer;
    opponent: BattlePlayer;
    timeRemaining: number; // seconds
    winner: 'player' | 'opponent' | null;
    playerScore: number;
    opponentScore: number;
    combo: number;
    maxCombo: number;
    perfectHits: number;
}

export interface BattleResult {
    won: boolean;
    playerScore: number;
    opponentScore: number;
    xpEarned: number;
    coinsEarned: number;
    streakBonus: number;
    perfectBonus: boolean;
    duration: number;
}

const BATTLE_DURATION = 60; // seconds
const BASE_XP_WIN = 100;
const BASE_XP_LOSS = 25;
const BASE_COINS_WIN = 50;
const COMBO_MULTIPLIER = 0.1;
const PERFECT_BONUS_THRESHOLD = 10;

export function createInitialState(
    playerName: string,
    opponentName: string,
    isAIOpponent: boolean = true
): BattleState {
    return {
        phase: 'intro',
        player: {
            id: 'player',
            name: playerName,
            health: 100,
            maxHealth: 100,
            power: 10,
            defense: 5,
            energy: 100,
            maxEnergy: 100,
        },
        opponent: {
            id: 'opponent',
            name: opponentName,
            health: 100,
            maxHealth: 100,
            power: 10,
            defense: 5,
            energy: 100,
            maxEnergy: 100,
            isAI: isAIOpponent,
        },
        timeRemaining: BATTLE_DURATION,
        winner: null,
        playerScore: 0,
        opponentScore: 0,
        combo: 0,
        maxCombo: 0,
        perfectHits: 0,
    };
}

export function calculateDamage(
    attacker: BattlePlayer,
    defender: BattlePlayer,
    combo: number,
    isPerfect: boolean
): number {
    const baseDamage = attacker.power - defender.defense / 2;
    const comboBonus = 1 + combo * COMBO_MULTIPLIER;
    const perfectBonus = isPerfect ? 1.5 : 1;
    const variance = 0.9 + Math.random() * 0.2;

    return Math.max(1, Math.floor(baseDamage * comboBonus * perfectBonus * variance));
}

export function playerAttack(
    state: BattleState,
    isPerfect: boolean = false
): BattleState {
    if (state.phase !== 'fighting') return state;

    const newCombo = state.combo + 1;
    const damage = calculateDamage(state.player, state.opponent, newCombo, isPerfect);

    const newOpponentHealth = Math.max(0, state.opponent.health - damage);
    const newMaxCombo = Math.max(newCombo, state.maxCombo);
    const newPerfectHits = isPerfect ? state.perfectHits + 1 : state.perfectHits;

    const newState = {
        ...state,
        opponent: { ...state.opponent, health: newOpponentHealth },
        playerScore: state.playerScore + damage,
        combo: newCombo,
        maxCombo: newMaxCombo,
        perfectHits: newPerfectHits,
    };

    if (newOpponentHealth <= 0) {
        return { ...newState, phase: 'finished', winner: 'player' };
    }

    return newState;
}

export function opponentAttack(state: BattleState): BattleState {
    if (state.phase !== 'fighting') return state;

    const damage = calculateDamage(state.opponent, state.player, 0, false);
    const newPlayerHealth = Math.max(0, state.player.health - damage);

    const newState = {
        ...state,
        player: { ...state.player, health: newPlayerHealth },
        opponentScore: state.opponentScore + damage,
        combo: 0, // Player's combo broken
    };

    if (newPlayerHealth <= 0) {
        return { ...newState, phase: 'finished', winner: 'opponent' };
    }

    return newState;
}

export function tickTime(state: BattleState): BattleState {
    if (state.phase !== 'fighting') return state;

    const newTime = state.timeRemaining - 1;

    if (newTime <= 0) {
        // Time's up - determine winner by score
        const winner: 'player' | 'opponent' =
            state.playerScore >= state.opponentScore ? 'player' : 'opponent';
        return { ...state, timeRemaining: 0, phase: 'finished', winner };
    }

    return { ...state, timeRemaining: newTime };
}

export function calculateResults(
    state: BattleState,
    stakeMultiplier: number = 1,
    streakMultiplier: number = 1
): BattleResult {
    const won = state.winner === 'player';
    const baseXP = won ? BASE_XP_WIN : BASE_XP_LOSS;
    const comboBonus = Math.floor(state.maxCombo * 2);
    const perfectBonus = state.perfectHits >= PERFECT_BONUS_THRESHOLD;
    const perfectXP = perfectBonus ? 50 : 0;

    const xpEarned = Math.floor((baseXP + comboBonus + perfectXP) * stakeMultiplier * streakMultiplier);
    const coinsEarned = won ? Math.floor(BASE_COINS_WIN * stakeMultiplier) : 0;

    return {
        won,
        playerScore: state.playerScore,
        opponentScore: state.opponentScore,
        xpEarned,
        coinsEarned,
        streakBonus: Math.floor((streakMultiplier - 1) * 100),
        perfectBonus,
        duration: BATTLE_DURATION - state.timeRemaining,
    };
}
