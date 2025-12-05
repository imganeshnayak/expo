import api, { ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Types
export interface WalletTransaction {
    transactionId: string;
    type: 'WALLET_TOPUP' | 'WITHDRAWAL' | 'RIDE_PAYMENT' | 'DEAL_PURCHASE' | 'REWARD';
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface Wallet {
    _id: string;
    userId: string;
    balance: number;
    transactions: WalletTransaction[];
}

// Wallet Service
export const walletService = {
    // Get wallet balance and transactions
    async getWallet(): Promise<ApiResponse<Wallet>> {
        return api.get<Wallet>(API_ENDPOINTS.WALLET.GET, true);
    },

    // Top up wallet
    async topUp(amount: number): Promise<ApiResponse<Wallet>> {
        return api.post<Wallet>(API_ENDPOINTS.WALLET.TOPUP, { amount }, true);
    },

    // Withdraw from wallet
    async withdraw(amount: number): Promise<ApiResponse<Wallet>> {
        return api.post<Wallet>(API_ENDPOINTS.WALLET.WITHDRAW, { amount }, true);
    },
};

export default walletService;
