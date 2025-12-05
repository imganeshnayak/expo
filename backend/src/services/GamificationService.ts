import User, { IUser } from '../models/User';

export const RANKS = [
    { name: 'Bronze I', minXp: 0, league: 'Bronze', tier: 1 },
    { name: 'Bronze II', minXp: 50, league: 'Bronze', tier: 2 },
    { name: 'Bronze III', minXp: 150, league: 'Bronze', tier: 3 },
    { name: 'Silver I', minXp: 250, league: 'Silver', tier: 1 },
    { name: 'Silver II', minXp: 350, league: 'Silver', tier: 2 },
    { name: 'Silver III', minXp: 450, league: 'Silver', tier: 3 },
    { name: 'Gold I', minXp: 550, league: 'Gold', tier: 1 },
    { name: 'Gold II', minXp: 650, league: 'Gold', tier: 2 },
    { name: 'Gold III', minXp: 750, league: 'Gold', tier: 3 },
    { name: 'Platinum I', minXp: 850, league: 'Platinum', tier: 1 },
    { name: 'Platinum II', minXp: 950, league: 'Platinum', tier: 2 },
    { name: 'Platinum III', minXp: 1050, league: 'Platinum', tier: 3 },
    { name: 'Diamond I', minXp: 1150, league: 'Diamond', tier: 1 },
    { name: 'Diamond II', minXp: 1250, league: 'Diamond', tier: 2 },
    { name: 'Diamond III', minXp: 1350, league: 'Diamond', tier: 3 },
    { name: 'Legendary', minXp: 1450, league: 'Legendary', tier: 1 },
];

export const FEATURES = {
    MISSIONS: { id: 'missions', minRank: 'Silver I', minXp: 250 },
    AI_LITE: { id: 'ai_lite', minRank: 'Silver I', minXp: 250 },
    AVATAR: { id: 'avatar', minRank: 'Silver I', minXp: 250 },
    SKILL_TREES: { id: 'skill_trees', minRank: 'Silver III', minXp: 450 },
    LEADERBOARD: { id: 'leaderboard', minRank: 'Gold I', minXp: 550 },
    AI_FULL: { id: 'ai_full', minRank: 'Gold I', minXp: 550 },
    CITY_MAP: { id: 'city_map', minRank: 'Gold II', minXp: 650 },
    XP_BOOSTERS: { id: 'xp_boosters', minRank: 'Gold III', minXp: 750 },
    BLACK_CARD_UI: { id: 'black_card_ui', minRank: 'Platinum I', minXp: 850 },
    VIP_OFFERS: { id: 'vip_offers', minRank: 'Platinum I', minXp: 850 },
    ELITE_DEALS: { id: 'elite_deals', minRank: 'Diamond III', minXp: 1350 },
    LEGENDARY_MODE: { id: 'legendary_mode', minRank: 'Legendary', minXp: 1450 },
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

    const oldXp = user.gamification.xp.current;
    const newXp = oldXp + amount;

    user.gamification.xp.current = newXp;
    user.gamification.xp.lifetime += amount;

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
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const rewardIndex = user.gamification.pendingRewards.findIndex(r => r._id?.toString() === rewardId);
    if (rewardIndex === -1) throw new Error('Reward not found');

    const reward = user.gamification.pendingRewards[rewardIndex];

    // Process the XP
    const result = await addXP(userId, reward.xp, reward.source);

    // Remove from pending
    user.gamification.pendingRewards.splice(rewardIndex, 1);
    await user.save();

    return result;
};
