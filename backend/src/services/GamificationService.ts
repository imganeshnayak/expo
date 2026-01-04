import User, { IUser } from '../models/User';

export const RANKS = [
    // Bronze (The Rookie) - ~0 to 1 Year
    { name: 'Bronze I', minXp: 0, league: 'Bronze', tier: 1 },         // Day 1
    { name: 'Bronze II', minXp: 2500, league: 'Bronze', tier: 2 },     // ~3 Months (at ~30XP/day)
    { name: 'Bronze III', minXp: 5000, league: 'Bronze', tier: 3 },    // ~6 Months

    // Silver (The Regular) - ~1 to 5 Years
    { name: 'Silver I', minXp: 10000, league: 'Silver', tier: 1 },     // ~1 Year
    { name: 'Silver II', minXp: 20000, league: 'Silver', tier: 2 },    // ~2 Years
    { name: 'Silver III', minXp: 35000, league: 'Silver', tier: 3 },   // ~3.5 Years

    // Gold (The Pro) - ~5 to 15 Years
    { name: 'Gold I', minXp: 50000, league: 'Gold', tier: 1 },         // ~5 Years
    { name: 'Gold II', minXp: 75000, league: 'Gold', tier: 2 },
    { name: 'Gold III', minXp: 100000, league: 'Gold', tier: 3 },

    // Platinum (The Elite) - ~15 to 50 Years
    { name: 'Platinum I', minXp: 150000, league: 'Platinum', tier: 1 },
    { name: 'Platinum II', minXp: 250000, league: 'Platinum', tier: 2 },
    { name: 'Platinum III', minXp: 400000, league: 'Platinum', tier: 3 },

    // Diamond (The Legend) - Lifetime Achievement
    { name: 'Diamond I', minXp: 600000, league: 'Diamond', tier: 1 },
    { name: 'Diamond II', minXp: 800000, league: 'Diamond', tier: 2 },
    { name: 'Diamond III', minXp: 1000000, league: 'Diamond', tier: 3 },

    // Legendary - Beyond Godlike
    { name: 'Legendary', minXp: 2000000, league: 'Legendary', tier: 1 },
];

export const FEATURES = {
    // Bronze Unlocks
    DAILY_SCRATCH_CARD: { id: 'scratch_card', minRank: 'Bronze I', minXp: 0 },
    CUSTOM_ICONS: { id: 'custom_icons', minRank: 'Bronze III', minXp: 5000 },

    // Silver Unlocks
    SQUAD_WARS: { id: 'squad_wars', minRank: 'Silver I', minXp: 10000 },
    DEAL_RADAR: { id: 'deal_radar', minRank: 'Silver II', minXp: 20000 },
    AVATAR_FRAMES: { id: 'avatar_frames', minRank: 'Silver III', minXp: 35000 },

    // Gold Unlocks
    FLASH_DROPS: { id: 'flash_drops', minRank: 'Gold I', minXp: 50000 },
    XP_MULTIPLIER: { id: 'xp_multiplier', minRank: 'Gold II', minXp: 75000 },
    NEON_MODE: { id: 'neon_mode', minRank: 'Gold III', minXp: 100000 },

    // Platinum Unlocks
    BLACK_CARD_UI: { id: 'black_card_ui', minRank: 'Platinum I', minXp: 150000 },
    SECRET_MENU: { id: 'secret_menu', minRank: 'Platinum II', minXp: 250000 },

    // Diamond Unlocks
    GOD_MODE: { id: 'god_mode', minRank: 'Diamond I', minXp: 600000 },
    VERIFIED_BADGE: { id: 'verified_badge', minRank: 'Diamond I', minXp: 600000 },
    LEGENDARY_SKINS: { id: 'legendary_skins', minRank: 'Diamond II', minXp: 800000 },
};

export const calculateRank = (xp: number) => {
    // Find the highest rank where minXp <= xp
    let currentRank = RANKS[0];
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].minXp) {
            currentRank = RANKS[i];
            break;
        }
    }
    return currentRank;
};

export const checkUnlocks = (xp: number): string[] => {
    const unlocked: string[] = [];
    Object.values(FEATURES).forEach((feature) => {
        if (xp >= feature.minXp) {
            unlocked.push(feature.id);
        }
    });
    return unlocked;
};

export const addXP = async (userId: string, amount: number, source: string) => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Initialize gamification if missing (migration safety)
    if (!user.gamification) {
        user.gamification = {
            xp: { current: 0, lifetime: 0 },
            rank: { league: 'Bronze', tier: 1, displayName: 'Bronze I' },
            streak: { current: 0, lastActiveDate: new Date() },
            unlockedFeatures: [],
            skillTree: new Map(),
            pendingRewards: [],
        };
    }

    const oldXp = Number(user.gamification.xp.current || 0);
    const amountNum = Number(amount);
    const newXp = oldXp + amountNum;

    user.gamification.xp.current = newXp;
    user.gamification.xp.lifetime = Number(user.gamification.xp.lifetime || 0) + amountNum;

    // Check Rank Up
    const newRankInfo = calculateRank(newXp);
    const oldRankDisplayName = user.gamification.rank.displayName;

    if (newRankInfo.name !== oldRankDisplayName) {
        user.gamification.rank = {
            league: newRankInfo.league as any,
            tier: newRankInfo.tier,
            displayName: newRankInfo.name,
        };
        // Trigger Level Up Event (could be a separate notification service)
        console.log(`User ${userId} leveled up to ${newRankInfo.name}!`);
    }

    // Check Unlocks
    const newUnlocks = checkUnlocks(newXp);
    // Merge unique unlocks
    const currentUnlocks = new Set(user.gamification.unlockedFeatures);
    newUnlocks.forEach(u => currentUnlocks.add(u));
    user.gamification.unlockedFeatures = Array.from(currentUnlocks);

    await user.save();

    return {
        newXp,
        newRank: user.gamification.rank,
        leveledUp: newRankInfo.name !== oldRankDisplayName,
        unlockedFeatures: user.gamification.unlockedFeatures
    };
};

export const queueXP = async (userId: string, amount: number, source: string, title: string): Promise<any[]> => {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (!user.gamification) {
        // Initialize if missing
        await addXP(userId, 0, 'init'); // This will init the structure
        return queueXP(userId, amount, source, title); // Retry
    }

    user.gamification.pendingRewards.push({
        title,
        xp: amount,
        source,
        createdAt: new Date()
    });

    await user.save();
    return user.gamification.pendingRewards;
};

export const claimXP = async (userId: string, rewardId: string) => {
    let user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const rewardIndex = user.gamification.pendingRewards.findIndex(r => r._id?.toString() === rewardId);
    if (rewardIndex === -1) throw new Error('Reward not found');

    const reward = user.gamification.pendingRewards[rewardIndex];

    // Process the XP (this saves the user)
    const result = await addXP(userId, reward.xp, reward.source);

    // Re-fetch user to get latest version and avoid VersionError
    user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // Remove from pending
    const currentRewardIndex = user.gamification.pendingRewards.findIndex(r => r._id?.toString() === rewardId);
    if (currentRewardIndex !== -1) {
        user.gamification.pendingRewards.splice(currentRewardIndex, 1);
        await user.save();
    }

    return result;
};
