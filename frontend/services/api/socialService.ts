import api, { ApiResponse } from './client';

export interface Friend {
    _id: string;
    email: string;
    profile: {
        name: string;
        avatar?: string;
    };
}

export interface FriendRequest {
    _id: string;
    requester: Friend;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
}

export const socialService = {
    // Send friend request
    async sendRequest(identifier: string): Promise<ApiResponse<any>> {
        // Check if identifier is email
        const isEmail = identifier.includes('@');
        const payload = isEmail ? { email: identifier } : { username: identifier };
        return api.post('/api/friends/request', payload, true);
    },

    // Respond to friend request
    async respondToRequest(requestId: string, action: 'accept' | 'reject'): Promise<ApiResponse<any>> {
        return api.put('/api/friends/respond', { requestId, action }, true);
    },

    // Get list of friends
    async getFriends(): Promise<ApiResponse<{ friends: Friend[] }>> {
        return api.get('/api/friends', {}, true, { skipGlobalAuthHandler: true });
    },

    // Get pending requests
    async getRequests(): Promise<ApiResponse<{ requests: FriendRequest[] }>> {
        return api.get('/api/friends/requests', {}, true, { skipGlobalAuthHandler: true });
    },

    // Sync contacts
    async syncContacts(contacts: string[]): Promise<ApiResponse<{ contacts: any[] }>> {
        return api.post('/api/friends/sync-contacts', { contacts }, true);
    },

    // Get activity feed
    async getFeed(page = 1): Promise<ApiResponse<{ activities: any[] }>> {
        return api.get('/api/social/feed', { page }, true, { skipGlobalAuthHandler: true });
    },

    // Groups
    async createGroup(data: { name: string; emoji?: string; description?: string; purpose?: string; memberIds: string[] }): Promise<ApiResponse<any>> {
        return api.post('/api/groups', data, true);
    },

    async getMyGroups(): Promise<ApiResponse<any>> {
        return api.get('/api/groups', {}, true, { skipGlobalAuthHandler: true });
    },

    async getGroupDetails(groupId: string): Promise<ApiResponse<any>> {
        return api.get(`/api/groups/${groupId}`, {}, true, { skipGlobalAuthHandler: true });
    },

    async sendGroupMessage(groupId: string, data: { message: string; type?: string; metadata?: any }): Promise<ApiResponse<any>> {
        return api.post(`/api/groups/${groupId}/messages`, data, true);
    },

    // Leaderboard
    async getLeaderboard(type: 'global' | 'friends' = 'global', period: 'all_time' | 'weekly' = 'all_time'): Promise<ApiResponse<any>> {
        return api.get('/api/leaderboard', { type, period }, true, { skipGlobalAuthHandler: true });
    },

    // Archetype
    async setArchetype(archetype: string): Promise<ApiResponse<any>> {
        return api.post('/api/archetype', { archetype }, true);
    },

    async getArchetype(): Promise<ApiResponse<any>> {
        return api.get('/api/archetype', {}, true, { skipGlobalAuthHandler: true });
    },
};

export default socialService;
