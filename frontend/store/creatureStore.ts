/**
 * Creature Store
 * Manages player's creature collection and battle team
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    OwnedCreature,
    BattleTeam,
    CreatureRarity,
    statsAtLevel,
    xpForLevel
} from '@/types/creature';
import { getCreatureById, CREATURE_ROSTER } from '@/constants/creatureRoster';

interface CreatureState {
    // Collection
    collection: OwnedCreature[];

    // Battle team
    team: BattleTeam;

    // Stats
    totalCaught: number;
    uniqueCreatures: Set<string>;

    // Actions
    addCreature: (templateId: string, location?: { lat: number; lng: number }) => OwnedCreature | null;
    removeCreature: (instanceId: string) => void;

    // Team management
    setTeamSlot: (slot: 1 | 2 | 3, instanceId: string | null) => void;
    getTeamCreatures: () => (OwnedCreature | null)[];

    // Creature management
    addXP: (instanceId: string, amount: number) => { leveledUp: boolean; newLevel: number };
    toggleFavorite: (instanceId: string) => void;
    setNickname: (instanceId: string, nickname: string) => void;

    // Queries
    getCreatureByInstanceId: (instanceId: string) => OwnedCreature | undefined;
    getCreaturesByElement: (element: string) => OwnedCreature[];
    getCreaturesByRarity: (rarity: CreatureRarity) => OwnedCreature[];

    // Reset
    resetCollection: () => void;
}

// Generate unique ID
const generateInstanceId = () => `creature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useCreatureStore = create<CreatureState>()(
    persist(
        (set, get) => ({
            collection: [],
            team: { slot1: null, slot2: null, slot3: null },
            totalCaught: 0,
            uniqueCreatures: new Set(),

            addCreature: (templateId, location) => {
                const template = getCreatureById(templateId);
                if (!template) return null;

                const instanceId = generateInstanceId();
                const initialStats = statsAtLevel(template.baseStats, 1, template.rarity);

                const newCreature: OwnedCreature = {
                    instanceId,
                    templateId,
                    level: 1,
                    xp: 0,
                    xpToNextLevel: xpForLevel(2),
                    currentStats: initialStats,
                    caughtAt: new Date(),
                    caughtLocation: location,
                    isFavorite: false,
                    isInTeam: false,
                };

                set(state => ({
                    collection: [...state.collection, newCreature],
                    totalCaught: state.totalCaught + 1,
                    uniqueCreatures: new Set([...state.uniqueCreatures, templateId]),
                }));

                return newCreature;
            },

            removeCreature: (instanceId) => {
                set(state => {
                    const creature = state.collection.find(c => c.instanceId === instanceId);
                    if (!creature) return state;

                    // Remove from team if in team
                    const newTeam = { ...state.team };
                    if (state.team.slot1?.instanceId === instanceId) newTeam.slot1 = null;
                    if (state.team.slot2?.instanceId === instanceId) newTeam.slot2 = null;
                    if (state.team.slot3?.instanceId === instanceId) newTeam.slot3 = null;

                    return {
                        collection: state.collection.filter(c => c.instanceId !== instanceId),
                        team: newTeam,
                    };
                });
            },

            setTeamSlot: (slot, instanceId) => {
                set(state => {
                    const creature = instanceId
                        ? state.collection.find(c => c.instanceId === instanceId)
                        : null;

                    // Update collection to mark team status
                    const updatedCollection = state.collection.map(c => ({
                        ...c,
                        isInTeam: c.instanceId === instanceId ? true :
                            (c.teamSlot === slot ? false : c.isInTeam),
                        teamSlot: c.instanceId === instanceId ? slot :
                            (c.teamSlot === slot ? undefined : c.teamSlot),
                    }));

                    const newTeam = { ...state.team };
                    if (slot === 1) newTeam.slot1 = creature || null;
                    if (slot === 2) newTeam.slot2 = creature || null;
                    if (slot === 3) newTeam.slot3 = creature || null;

                    return { team: newTeam, collection: updatedCollection };
                });
            },

            getTeamCreatures: () => {
                const { team } = get();
                return [team.slot1, team.slot2, team.slot3];
            },

            addXP: (instanceId, amount) => {
                let leveledUp = false;
                let newLevel = 1;

                set(state => {
                    const updatedCollection = state.collection.map(c => {
                        if (c.instanceId !== instanceId) return c;

                        let creature = { ...c };
                        creature.xp += amount;

                        // Check for level ups
                        while (creature.xp >= creature.xpToNextLevel && creature.level < 100) {
                            creature.xp -= creature.xpToNextLevel;
                            creature.level += 1;
                            creature.xpToNextLevel = xpForLevel(creature.level + 1);
                            leveledUp = true;
                            newLevel = creature.level;

                            // Update stats
                            const template = getCreatureById(creature.templateId);
                            if (template) {
                                creature.currentStats = statsAtLevel(template.baseStats, creature.level, template.rarity);
                            }
                        }

                        return creature;
                    });

                    return { collection: updatedCollection };
                });

                return { leveledUp, newLevel };
            },

            toggleFavorite: (instanceId) => {
                set(state => ({
                    collection: state.collection.map(c =>
                        c.instanceId === instanceId ? { ...c, isFavorite: !c.isFavorite } : c
                    ),
                }));
            },

            setNickname: (instanceId, nickname) => {
                set(state => ({
                    collection: state.collection.map(c =>
                        c.instanceId === instanceId ? { ...c, nickname } : c
                    ),
                }));
            },

            getCreatureByInstanceId: (instanceId) => {
                return get().collection.find(c => c.instanceId === instanceId);
            },

            getCreaturesByElement: (element) => {
                return get().collection.filter(c => {
                    const template = getCreatureById(c.templateId);
                    return template?.element === element;
                });
            },

            getCreaturesByRarity: (rarity) => {
                return get().collection.filter(c => {
                    const template = getCreatureById(c.templateId);
                    return template?.rarity === rarity;
                });
            },

            resetCollection: () => {
                set({
                    collection: [],
                    team: { slot1: null, slot2: null, slot3: null },
                    totalCaught: 0,
                    uniqueCreatures: new Set(),
                });
            },
        }),
        {
            name: 'oops-creature-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                collection: state.collection,
                team: state.team,
                totalCaught: state.totalCaught,
                uniqueCreatures: Array.from(state.uniqueCreatures),
            }),
        }
    )
);
