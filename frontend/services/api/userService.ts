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
    async getClaimedDeals(): Promise<ApiResponse<ClaimedDeal[]>> {
        return api.get<ClaimedDeal[]>('/api/users/claimed-deals', true);
    },
};

export default userService;
