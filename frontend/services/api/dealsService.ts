import api, { ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface Deal {
    _id: string;
    merchantId: {
        _id: string;
        name: string;
        logo?: string;
    };
    title: string;
    description: string;
    category: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    termsAndConditions: string[];
    maxRedemptions?: number;
    currentRedemptions: number;
    isActive: boolean;
    images: string[];
    createdAt: string;
}

export interface CreateDealRequest {
    title: string;
    description: string;
    category: string;
    originalPrice: number;
    discountedPrice: number;
    discountPercentage: number;
    validFrom: string;
    validUntil: string;
    termsAndConditions?: string[];
    maxRedemptions?: number;
    images?: string[];
}

// Mock Data
const MOCK_DEALS: Deal[] = [
    {
        _id: '1',
        merchantId: {
            _id: 'm1',
            name: 'Burger King',
            logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png'
        },
        title: 'Gourmet Burger Bundle',
        description: 'Get 2 gourmet burgers and fries for the price of 1',
        category: 'Food',
        originalPrice: 30,
        discountedPrice: 15,
        discountPercentage: 50,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 7).toISOString(),
        termsAndConditions: ['Valid only on weekdays', 'Dine-in only'],
        currentRedemptions: 120,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
        createdAt: new Date().toISOString()
    },
    {
        _id: '2',
        merchantId: {
            _id: 'm2',
            name: 'Starbucks',
            logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png'
        },
        title: 'Morning Brew Special',
        description: 'Any tall coffee + croissant for $5',
        category: 'Cafe',
        originalPrice: 10,
        discountedPrice: 5,
        discountPercentage: 50,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 30).toISOString(),
        termsAndConditions: ['Valid until 11 AM'],
        currentRedemptions: 450,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'],
        createdAt: new Date().toISOString()
    },
    {
        _id: '3',
        merchantId: {
            _id: 'm3',
            name: 'Serenity Spa',
            logo: ''
        },
        title: 'Spa Day Package',
        description: 'Full body massage + facial',
        category: 'Wellness',
        originalPrice: 150,
        discountedPrice: 99,
        discountPercentage: 34,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 14).toISOString(),
        termsAndConditions: ['Booking required 24h in advance'],
        currentRedemptions: 30,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
        createdAt: new Date().toISOString()
    },
    {
        _id: '4',
        merchantId: {
            _id: 'm4',
            name: 'Zara',
            logo: ''
        },
        title: 'Summer Collection Sale',
        description: 'Flat 20% off on all summer wear',
        category: 'Shopping',
        originalPrice: 100,
        discountedPrice: 80,
        discountPercentage: 20,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 5).toISOString(),
        termsAndConditions: ['Not valid on accessories'],
        currentRedemptions: 800,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
        createdAt: new Date().toISOString()
    },
    {
        _id: '5',
        merchantId: {
            _id: 'm5',
            name: 'Gold\'s Gym',
            logo: ''
        },
        title: 'Yoga Class Pass',
        description: '5 Yoga sessions for beginners',
        category: 'Fitness',
        originalPrice: 80,
        discountedPrice: 40,
        discountPercentage: 50,
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 86400000 * 60).toISOString(),
        termsAndConditions: ['New members only'],
        currentRedemptions: 55,
        isActive: true,
        images: ['https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80'],
        createdAt: new Date().toISOString()
    }
];

// Deals Service
export const dealsService = {
    // Get all active deals
    async getDeals(): Promise<ApiResponse<Deal[]>> {
        return api.get<Deal[]>(API_ENDPOINTS.DEALS.LIST);
    },

    // Get deal by ID
    async getDealById(id: string): Promise<ApiResponse<Deal>> {
        return api.get<Deal>(API_ENDPOINTS.DEALS.GET(id));
    },

    // Create a new deal (requires auth)
    async createDeal(deal: CreateDealRequest): Promise<ApiResponse<Deal>> {
        return api.post<Deal>(API_ENDPOINTS.DEALS.CREATE, deal, true);
    },

    // Claim a deal (requires auth)
    async claimDeal(dealId: string, options: { skipGlobalAuthHandler?: boolean } = {}): Promise<ApiResponse<any>> {
        return api.post<any>(`/api/deals/${dealId}/claim`, {}, true, options);
    },

    // Toggle favorite (requires auth)
    async toggleFavorite(dealId: string, options: { skipGlobalAuthHandler?: boolean } = {}): Promise<ApiResponse<{ isFavorited: boolean; message: string }>> {
        return api.post<{ isFavorited: boolean; message: string }>(`/api/deals/${dealId}/favorite`, {}, true, options);
    },

    // Get user's favorite deals (requires auth)
    async getFavorites(options: { skipGlobalAuthHandler?: boolean } = {}): Promise<ApiResponse<Deal[]>> {
        return api.get<Deal[]>('/api/deals/favorites', {}, true, options);
    },

    // Redeem a deal (for merchant app, requires auth)
    async redeemDeal(redemptionCode: string, options: { skipGlobalAuthHandler?: boolean } = {}): Promise<ApiResponse<any>> {
        return api.post<any>('/api/deals/redeem', { redemptionCode }, true, options);
    },
};

export default dealsService;
