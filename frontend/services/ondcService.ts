import { ONDC_CONFIG, ONDC_ENDPOINTS, ONDC_ERROR_CODES } from '../constants/ondcConfig';

/**
 * ONDC API Service
 * Handles communication with ONDC Gateway for ride booking
 */

// Generate unique IDs
export const generateTransactionId = () => {
  return `UMA-TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMessageId = () => {
  return `UMA-MSG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ONDC Context Interface
interface OndcContext {
  domain: string;
  country: string;
  city: string;
  action: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  ttl: string;
  bpp_id?: string;
  bpp_uri?: string;
}

// Create ONDC Context (required for all requests)
const createOndcContext = (action: string, transactionId?: string): OndcContext => {
  return {
    domain: ONDC_CONFIG.domain,
    country: ONDC_CONFIG.countryCode,
    city: ONDC_CONFIG.cityCode,
    action: action,
    core_version: '1.2.0',
    bap_id: ONDC_CONFIG.subscriberId,
    bap_uri: ONDC_CONFIG.subscriberUrl,
    transaction_id: transactionId || generateTransactionId(),
    message_id: generateMessageId(),
    timestamp: new Date().toISOString(),
    ttl: 'PT30S', // Time to live: 30 seconds
  };
};

// API Client
class ONDCApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ONDC_CONFIG.gatewayUrl;
  }

  /**
   * Search for available rides
   */
  async search(params: {
    pickup: { latitude: number; longitude: number; address: string };
    destination: { latitude: number; longitude: number; address: string };
    rideType?: 'auto' | 'car' | 'bus';
  }) {
    const context = createOndcContext('search');

    const payload = {
      context,
      message: {
        intent: {
          fulfillment: {
            type: 'Delivery',
            start: {
              location: {
                gps: `${params.pickup.latitude},${params.pickup.longitude}`,
                address: {
                  locality: params.pickup.address,
                },
              },
              time: {
                timestamp: new Date().toISOString(),
              },
            },
            end: {
              location: {
                gps: `${params.destination.latitude},${params.destination.longitude}`,
                address: {
                  locality: params.destination.address,
                },
              },
            },
          },
          payment: {
            '@ondc/org/buyer_app_finder_fee_type': 'percent',
            '@ondc/org/buyer_app_finder_fee_amount': '0',
          },
          ...(params.rideType && {
            category: {
              id: params.rideType === 'auto' ? 'Auto Rickshaw' : params.rideType === 'car' ? 'Cab' : 'Bus',
            },
          }),
        },
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.search, payload);
      return {
        success: true,
        transactionId: context.transaction_id,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Select a specific ride option
   */
  async select(params: {
    transactionId: string;
    providerId: string;
    itemId: string;
    fulfillmentId: string;
  }) {
    const context = createOndcContext('select', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order: {
          provider: {
            id: params.providerId,
          },
          items: [
            {
              id: params.itemId,
              fulfillment_id: params.fulfillmentId,
            },
          ],
        },
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.select, payload);
      return {
        success: true,
        transactionId: context.transaction_id,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Initialize booking
   */
  async init(params: {
    transactionId: string;
    providerId: string;
    itemId: string;
    fulfillmentId: string;
    customer: {
      name: string;
      phone: string;
      email?: string;
    };
    billing: {
      name: string;
      phone: string;
      address: string;
    };
  }) {
    const context = createOndcContext('init', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order: {
          provider: {
            id: params.providerId,
          },
          items: [
            {
              id: params.itemId,
              fulfillment_id: params.fulfillmentId,
            },
          ],
          billing: {
            name: params.billing.name,
            phone: params.billing.phone,
            address: {
              name: params.billing.name,
              locality: params.billing.address,
            },
          },
          fulfillment: {
            id: params.fulfillmentId,
            customer: {
              person: {
                name: params.customer.name,
              },
              contact: {
                phone: params.customer.phone,
                email: params.customer.email,
              },
            },
          },
        },
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.init, payload);
      return {
        success: true,
        transactionId: context.transaction_id,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Confirm booking
   */
  async confirm(params: {
    transactionId: string;
    providerId: string;
    orderId: string;
    payment: {
      type: string;
      amount: string;
      currency: string;
    };
  }) {
    const context = createOndcContext('confirm', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order: {
          id: params.orderId,
          provider: {
            id: params.providerId,
          },
          payment: {
            type: params.payment.type,
            params: {
              amount: params.payment.amount,
              currency: params.payment.currency,
            },
            status: 'PAID',
          },
        },
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.confirm, payload);
      return {
        success: true,
        transactionId: context.transaction_id,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get ride status
   */
  async status(params: {
    transactionId: string;
    providerId: string;
    orderId: string;
  }) {
    const context = createOndcContext('status', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order_id: params.orderId,
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.status, payload);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Cancel ride
   */
  async cancel(params: {
    transactionId: string;
    providerId: string;
    orderId: string;
    cancellationReasonId: string;
  }) {
    const context = createOndcContext('cancel', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order_id: params.orderId,
        cancellation_reason_id: params.cancellationReasonId,
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.cancel, payload);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Track ride location
   */
  async track(params: {
    transactionId: string;
    providerId: string;
    orderId: string;
  }) {
    const context = createOndcContext('track', params.transactionId);
    context.bpp_id = params.providerId;
    context.bpp_uri = `https://${params.providerId}/ondc`;

    const payload = {
      context,
      message: {
        order_id: params.orderId,
      },
    };

    try {
      const response = await this.makeRequest(ONDC_ENDPOINTS.track, payload);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make HTTP request to ONDC Gateway
   */
  private async makeRequest(endpoint: string, payload: any) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      // In production, add authentication headers here
      const headers = {
        'Content-Type': 'application/json',
        // Add ONDC authentication headers
        // 'Authorization': await this.generateAuthHeader(payload),
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error(ONDC_ERROR_CODES.TIMEOUT);
      }

      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any) {
    console.error('ONDC API Error:', error);

    let errorCode = ONDC_ERROR_CODES.NETWORK_ERROR;
    let errorMessage = 'Network error occurred';

    if (error.message === ONDC_ERROR_CODES.TIMEOUT) {
      errorCode = ONDC_ERROR_CODES.TIMEOUT;
      errorMessage = 'Request timed out. Please try again.';
    } else if (error.message?.includes('HTTP')) {
      errorCode = ONDC_ERROR_CODES.INVALID_REQUEST;
      errorMessage = 'Invalid request. Please check your details.';
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error.message,
      },
    };
  }

  /**
   * Generate authentication header (placeholder)
   * In production, implement proper signing mechanism
   */
  private async generateAuthHeader(payload: any): Promise<string> {
    // TODO: Implement ONDC signature generation
    // This should use Ed25519 signing with private key
    return 'Bearer mock-token';
  }
}

// Export singleton instance
export const ondcApi = new ONDCApiClient();

// Helper function to parse on_search response
export const parseSearchResponse = (ondcResponse: any) => {
  try {
    const catalog = ondcResponse.message?.catalog;
    if (!catalog) return [];

    const providers = catalog['bpp/providers'] || [];

    return providers.flatMap((provider: any) => {
      return (provider.items || []).map((item: any) => {
        const fulfillment = provider.fulfillments?.find(
          (f: any) => f.id === item.fulfillment_id
        );

        return {
          providerId: provider.id,
          providerName: provider.descriptor?.name || 'Unknown',
          itemId: item.id,
          itemName: item.descriptor?.name || 'Ride',
          category: item.category_id,
          price: parseFloat(item.price?.value || '0'),
          currency: item.price?.currency || 'INR',
          fulfillmentId: item.fulfillment_id,
          estimatedTime: fulfillment?.tags?.find((t: any) => t.code === 'info')
            ?.list?.find((l: any) => l.code === 'eta')?.value || 'N/A',
          distance: fulfillment?.tags?.find((t: any) => t.code === 'info')
            ?.list?.find((l: any) => l.code === 'distance')?.value || 'N/A',
        };
      });
    });
  } catch (error) {
    console.error('Error parsing search response:', error);
    return [];
  }
};

// Helper to parse on_confirm response
export const parseConfirmResponse = (ondcResponse: any) => {
  try {
    const order = ondcResponse.message?.order;
    if (!order) return null;

    const fulfillment = order.fulfillments?.[0];
    const agent = fulfillment?.agent;

    return {
      orderId: order.id,
      status: order.state,
      provider: {
        id: order.provider?.id,
        name: order.provider?.descriptor?.name,
      },
      driver: {
        name: agent?.person?.name,
        phone: agent?.contact?.phone,
        image: agent?.person?.image,
      },
      vehicle: {
        registration: fulfillment?.vehicle?.registration,
        model: fulfillment?.vehicle?.model,
        category: fulfillment?.vehicle?.category,
      },
      otp: fulfillment?.start?.authorization?.token,
      tracking: {
        url: fulfillment?.tracking_url,
        status: fulfillment?.state?.descriptor?.code,
      },
      payment: {
        amount: order.quote?.price?.value,
        currency: order.quote?.price?.currency,
        status: order.payment?.status,
      },
    };
  } catch (error) {
    console.error('Error parsing confirm response:', error);
    return null;
  }
};

// Helper to parse on_status response
export const parseStatusResponse = (ondcResponse: any) => {
  try {
    const order = ondcResponse.message?.order;
    if (!order) return null;

    const fulfillment = order.fulfillments?.[0];

    return {
      orderId: order.id,
      status: fulfillment?.state?.descriptor?.code,
      currentLocation: fulfillment?.start?.location?.gps,
      estimatedArrival: fulfillment?.start?.time?.timestamp,
      driver: {
        name: fulfillment?.agent?.person?.name,
        phone: fulfillment?.agent?.contact?.phone,
        location: fulfillment?.agent?.location?.gps,
      },
    };
  } catch (error) {
    console.error('Error parsing status response:', error);
    return null;
  }
};
