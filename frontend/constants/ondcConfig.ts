// ONDC Configuration
// For production, these should come from environment variables
export const ONDC_CONFIG = {
  // Gateway Configuration
  gatewayUrl: 'https://staging.gateway.proteantech.in',
  registryUrl: 'https://staging.registry.ondc.org',
  
  // Subscriber Details
  subscriberId: 'uma-rider-app',
  subscriberUrl: 'https://uma-app.com/ondc/webhook',
  
  // Domain & Location
  domain: 'ONDC:TRV10', // Mobility domain
  countryCode: 'IND',
  cityCode: 'std:080', // Bangalore
  
  // Provider Configuration
  providers: {
    nammaYatri: {
      id: 'nammayatri.in',
      subscriberId: 'nammayatri.in/ondc',
      name: 'Namma Yatri',
    },
    uber: {
      id: 'uber.ondc.in',
      subscriberId: 'uber.ondc.in',
      name: 'Uber ONDC',
    },
    ola: {
      id: 'ola.ondc.in',
      subscriberId: 'ola.ondc.in',
      name: 'Ola ONDC',
    },
  },
  
  // Timeouts (in milliseconds)
  timeouts: {
    search: 30000, // 30 seconds
    select: 10000, // 10 seconds
    init: 10000,
    confirm: 15000,
    status: 5000,
  },
  
  // Environment
  environment: 'staging', // 'staging' or 'production'
};

// API Endpoints
export const ONDC_ENDPOINTS = {
  search: '/search',
  onSearch: '/on_search',
  select: '/select',
  onSelect: '/on_select',
  init: '/init',
  onInit: '/on_init',
  confirm: '/confirm',
  onConfirm: '/on_confirm',
  status: '/status',
  onStatus: '/on_status',
  cancel: '/cancel',
  onCancel: '/on_cancel',
  track: '/track',
  onTrack: '/on_track',
};

// Message Types
export const ONDC_MESSAGE_TYPES = {
  SEARCH: 'search',
  SELECT: 'select',
  INIT: 'init',
  CONFIRM: 'confirm',
  STATUS: 'status',
  CANCEL: 'cancel',
  TRACK: 'track',
};

// Ride Categories (ONDC Standard)
export const RIDE_CATEGORIES = {
  AUTO_RICKSHAW: 'Auto Rickshaw',
  CAB: 'Cab',
  CAB_ECONOMY: 'Cab Economy',
  CAB_PREMIUM: 'Cab Premium',
  BUS: 'Bus',
  METRO: 'Metro',
};

// Payment Methods
export const PAYMENT_METHODS = {
  UPI: 'UPI',
  CARD: 'CARD',
  NET_BANKING: 'NET_BANKING',
  WALLET: 'WALLET',
  COD: 'ON-FULFILLMENT', // Cash on delivery (pay driver)
};

// Error Codes
export const ONDC_ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  NO_PROVIDERS: 'NO_PROVIDERS_AVAILABLE',
  INVALID_LOCATION: 'INVALID_LOCATION',
  BOOKING_FAILED: 'BOOKING_FAILED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  RIDE_CANCELLED: 'RIDE_CANCELLED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  AUTHENTICATION_FAILED: 'AUTH_FAILED',
};
