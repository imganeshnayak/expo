/**
 * Shared API Client for UMA Ecosystem
 * Used by both Rider/User App and Business/Merchant App
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.uma.com';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generic HTTP request wrapper
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Common API methods used by both apps
 */
export const api = {
  // Auth
  login: (credentials: { phone: string; otp: string }) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // User/Customer endpoints (used by both apps)
  getUserProfile: (userId: string) => request(`/users/${userId}`),
  
  updateUserProfile: (userId: string, data: any) =>
    request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Merchant endpoints
  getMerchantProfile: (merchantId: string) =>
    request(`/merchants/${merchantId}`),

  // Deals/Offers (used by both apps)
  getDeals: (filters?: any) =>
    request('/deals', {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),

  // Stamp Cards (used by both apps)
  getStampCards: (userId: string) =>
    request(`/stamp-cards/${userId}`),

  stampCard: (cardId: string, merchantId: string) =>
    request(`/stamp-cards/${cardId}/stamp`, {
      method: 'POST',
      body: JSON.stringify({ merchantId }),
    }),

  // Transactions
  createTransaction: (data: any) =>
    request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTransactions: (userId: string, filters?: any) =>
    request(`/transactions/${userId}`, {
      method: 'POST',
      body: JSON.stringify(filters || {}),
    }),
};

export default api;
