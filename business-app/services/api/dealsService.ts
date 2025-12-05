import { api } from '../../lib/api';

export const dealsService = {
    // Redeem a deal (for merchant app, requires auth)
    async redeemDeal(redemptionCode: string): Promise<any> {
        return api.post('/api/deals/redeem', { redemptionCode });
    },
};

export default dealsService;
