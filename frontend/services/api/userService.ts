import api, { ApiResponse } from './client';

export interface ClaimedDeal {
    deal: any;
    claimedAt: string;
    redeemedAt?: string;
    savings: number;
    redemptionCode: string;
    status: 'pending' | 'redeemed' | 'expired';
}

export const userService = {
    // Get user's claimed deals (requires auth)
    async getClaimedDeals(options: { skipGlobalAuthHandler?: boolean } = {}): Promise<ApiResponse<ClaimedDeal[]>> {
        return api.get<ClaimedDeal[]>('/api/users/claimed-deals', {}, true, options);
    },

    // Update user's push token
    async updatePushToken(token: string): Promise<ApiResponse<any>> {
        return api.put('/api/users/push-token', { pushToken: token }, true);
    },

    // Get user notifications
    async getNotifications(): Promise<ApiResponse<any>> {
        return api.get('/api/users/notifications', {}, true, { skipGlobalAuthHandler: true });
    },
};

export default userService;
