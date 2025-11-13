import {
  AutoApplyRule,
  MerchantIntegration,
  CouponStackingRule,
  useAutoApplyCouponStore,
} from './autoApplyCouponStore';

// ==================== MERCHANT INTEGRATIONS ====================

export const DEMO_MERCHANT_INTEGRATIONS: MerchantIntegration[] = [
  // FOOD DELIVERY
  {
    id: 'swiggy',
    merchantName: 'Swiggy',
    category: 'food_delivery',
    logoUrl: 'https://logo.clearbit.com/swiggy.com',
    supportedMethods: ['deep_linking', 'browser_extension', 'manual_override'],
    deepLinkScheme: 'swiggy://',
    webUrl: 'https://www.swiggy.com',
    appPackageName: 'in.swiggy.android',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.swiggy.com/checkout',
        'https://www.swiggy.com/cart',
      ],
      domSelectors: {
        couponInput: 'input[placeholder*="coupon"]',
        applyButton: 'button:contains("Apply")',
        priceDisplay: '.cart-total-amount',
        successMessage: '.coupon-success',
      },
    },
    activeCoupons: ['SWIGGY50', 'SWIGGY100', 'PARTY', 'FIRSTORDER'],
    priority: 1,
    enabled: true,
  },
  {
    id: 'zomato',
    merchantName: 'Zomato',
    category: 'food_delivery',
    logoUrl: 'https://logo.clearbit.com/zomato.com',
    supportedMethods: ['deep_linking', 'browser_extension', 'manual_override'],
    deepLinkScheme: 'zomato://',
    webUrl: 'https://www.zomato.com',
    appPackageName: 'com.application.zomato',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.zomato.com/order',
        'https://www.zomato.com/checkout',
      ],
      domSelectors: {
        couponInput: '#coupon-code',
        applyButton: '.apply-coupon-btn',
        priceDisplay: '.total-price',
      },
    },
    activeCoupons: ['ZOMATO50', 'FEAST', 'TREAT', 'WELCOME'],
    priority: 2,
    enabled: true,
  },

  // E-COMMERCE
  {
    id: 'amazon',
    merchantName: 'Amazon India',
    category: 'ecommerce',
    logoUrl: 'https://logo.clearbit.com/amazon.in',
    supportedMethods: ['browser_extension', 'manual_override'],
    webUrl: 'https://www.amazon.in',
    apiIntegration: {
      enabled: false,
      authRequired: true,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.amazon.in/gp/cart',
        'https://www.amazon.in/checkout',
      ],
      domSelectors: {
        couponInput: '#gc-redemption-input',
        applyButton: '#gc-apply-button',
        priceDisplay: '#sc-subtotal-amount-activecart',
      },
    },
    activeCoupons: ['PRIME50', 'AMAZON100', 'SAVE20', 'ELECTRONICS'],
    priority: 3,
    enabled: true,
  },
  {
    id: 'flipkart',
    merchantName: 'Flipkart',
    category: 'ecommerce',
    logoUrl: 'https://logo.clearbit.com/flipkart.com',
    supportedMethods: ['browser_extension', 'deep_linking', 'manual_override'],
    deepLinkScheme: 'flipkart://',
    webUrl: 'https://www.flipkart.com',
    appPackageName: 'com.flipkart.android',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.flipkart.com/viewcart',
        'https://www.flipkart.com/checkout',
      ],
      domSelectors: {
        couponInput: 'input[name="couponCode"]',
        applyButton: '.apply-coupon',
        priceDisplay: '.amount-payable',
      },
    },
    activeCoupons: ['FLIP50', 'BIGBILLION', 'SALE100', 'FASHION'],
    priority: 4,
    enabled: true,
  },
  {
    id: 'myntra',
    merchantName: 'Myntra',
    category: 'ecommerce',
    logoUrl: 'https://logo.clearbit.com/myntra.com',
    supportedMethods: ['browser_extension', 'manual_override'],
    webUrl: 'https://www.myntra.com',
    appPackageName: 'com.myntra.android',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.myntra.com/checkout/cart',
        'https://www.myntra.com/checkout/payment',
      ],
      domSelectors: {
        couponInput: '.couponInput',
        applyButton: '.applyCouponBtn',
        priceDisplay: '.price-breakup-total',
      },
    },
    activeCoupons: ['MYNTRA200', 'FASHION50', 'EOSS', 'APP100'],
    priority: 5,
    enabled: true,
  },

  // TRAVEL
  {
    id: 'makemytrip',
    merchantName: 'MakeMyTrip',
    category: 'travel',
    logoUrl: 'https://logo.clearbit.com/makemytrip.com',
    supportedMethods: ['browser_extension', 'deep_linking', 'manual_override'],
    deepLinkScheme: 'makemytrip://',
    webUrl: 'https://www.makemytrip.com',
    appPackageName: 'com.makemytrip',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.makemytrip.com/checkout',
        'https://flights.makemytrip.com/makemytrip/payment',
      ],
      domSelectors: {
        couponInput: '#couponsInput',
        applyButton: '.applyBtn',
        priceDisplay: '.grand-total',
      },
    },
    activeCoupons: ['MMT1000', 'TRAVEL500', 'FLIGHTS', 'HOTELS200'],
    priority: 6,
    enabled: true,
  },
  {
    id: 'uber',
    merchantName: 'Uber',
    category: 'travel',
    logoUrl: 'https://logo.clearbit.com/uber.com',
    supportedMethods: ['deep_linking', 'partner_api', 'manual_override'],
    deepLinkScheme: 'uber://',
    appPackageName: 'com.ubercab',
    apiIntegration: {
      enabled: true,
      endpoint: 'https://api.uber.com/v1/promotions',
      authRequired: true,
    },
    browserIntegration: {
      enabled: false,
      checkoutUrls: [],
      domSelectors: {},
    },
    activeCoupons: ['UBER50', 'UBER100', 'FIRSTRIDE', 'WEEKEND'],
    priority: 7,
    enabled: true,
  },
  {
    id: 'ola',
    merchantName: 'Ola Cabs',
    category: 'travel',
    logoUrl: 'https://logo.clearbit.com/olacabs.com',
    supportedMethods: ['deep_linking', 'manual_override'],
    deepLinkScheme: 'olacabs://',
    appPackageName: 'com.olacabs.customer',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: false,
      checkoutUrls: [],
      domSelectors: {},
    },
    activeCoupons: ['OLA50', 'OLA100', 'RIDE20', 'OLAPRIME'],
    priority: 8,
    enabled: true,
  },

  // ENTERTAINMENT
  {
    id: 'bookmyshow',
    merchantName: 'BookMyShow',
    category: 'entertainment',
    logoUrl: 'https://logo.clearbit.com/bookmyshow.com',
    supportedMethods: ['browser_extension', 'deep_linking', 'manual_override'],
    deepLinkScheme: 'bookmyshow://',
    webUrl: 'https://in.bookmyshow.com',
    appPackageName: 'com.bt.bms',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://in.bookmyshow.com/checkout',
        'https://in.bookmyshow.com/payment',
      ],
      domSelectors: {
        couponInput: '#voucherCode',
        applyButton: '.apply-voucher',
        priceDisplay: '.total-amount',
      },
    },
    activeCoupons: ['BMS100', 'MOVIES', 'WEEKEND50', 'SHOWS'],
    priority: 9,
    enabled: true,
  },

  // GROCERY
  {
    id: 'bigbasket',
    merchantName: 'BigBasket',
    category: 'grocery',
    logoUrl: 'https://logo.clearbit.com/bigbasket.com',
    supportedMethods: ['browser_extension', 'manual_override'],
    webUrl: 'https://www.bigbasket.com',
    appPackageName: 'com.bigbasket.mobileapp',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://www.bigbasket.com/checkout',
        'https://www.bigbasket.com/basket',
      ],
      domSelectors: {
        couponInput: '#coupon-input',
        applyButton: '.coupon-apply',
        priceDisplay: '.total-price',
      },
    },
    activeCoupons: ['BB100', 'GROCERY50', 'FRESH', 'DAILY'],
    priority: 10,
    enabled: true,
  },
  {
    id: 'blinkit',
    merchantName: 'Blinkit',
    category: 'grocery',
    logoUrl: 'https://logo.clearbit.com/blinkit.com',
    supportedMethods: ['deep_linking', 'browser_extension', 'manual_override'],
    deepLinkScheme: 'blinkit://',
    webUrl: 'https://blinkit.com',
    appPackageName: 'com.grofers.customerapp',
    apiIntegration: {
      enabled: false,
      authRequired: false,
    },
    browserIntegration: {
      enabled: true,
      checkoutUrls: [
        'https://blinkit.com/checkout',
      ],
      domSelectors: {
        couponInput: '.promo-input',
        applyButton: '.apply-promo',
        priceDisplay: '.order-total',
      },
    },
    activeCoupons: ['BLINK50', 'QUICK', 'INSTANT20'],
    priority: 11,
    enabled: true,
  },
];

// ==================== AUTO-APPLY RULES ====================

export const DEMO_AUTO_APPLY_RULES: AutoApplyRule[] = [
  // SWIGGY RULES
  {
    id: 'swiggy_checkout',
    merchantId: 'swiggy',
    merchantName: 'Swiggy',
    merchantCategory: 'food_delivery',
    triggerCondition: 'checkout_page',
    applicationMethod: 'deep_link',
    couponPriority: 1,
    fallbackStrategy: 'try_next',
    successVerification: 'price_reduction',
    urlPatterns: ['https://www\\.swiggy\\.com/checkout.*', 'swiggy://.*'],
    domSelectors: {
      couponInput: 'input[placeholder*="coupon"]',
      applyButton: 'button:contains("Apply")',
      priceDisplay: '.cart-total-amount',
    },
    deepLinkTemplate: 'swiggy://order?coupon={code}&source=uma',
    enabled: true,
    successRate: 0.85,
    lastUpdated: Date.now(),
  },
  {
    id: 'swiggy_browser',
    merchantId: 'swiggy',
    merchantName: 'Swiggy',
    merchantCategory: 'food_delivery',
    triggerCondition: 'cart_page',
    applicationMethod: 'code_injection',
    couponPriority: 2,
    fallbackStrategy: 'show_manual',
    successVerification: 'confirmation_message',
    urlPatterns: ['https://www\\.swiggy\\.com/cart'],
    domSelectors: {
      couponInput: 'input[placeholder*="coupon"]',
      applyButton: 'button:contains("Apply")',
      priceDisplay: '.cart-total-amount',
      successMessage: '.coupon-success',
    },
    enabled: true,
    successRate: 0.78,
    lastUpdated: Date.now(),
  },

  // ZOMATO RULES
  {
    id: 'zomato_checkout',
    merchantId: 'zomato',
    merchantName: 'Zomato',
    merchantCategory: 'food_delivery',
    triggerCondition: 'checkout_page',
    applicationMethod: 'deep_link',
    couponPriority: 1,
    fallbackStrategy: 'try_next',
    successVerification: 'url_change',
    urlPatterns: ['https://www\\.zomato\\.com/order.*', 'zomato://.*'],
    domSelectors: {},
    deepLinkTemplate: 'zomato://order?promo={code}&source=uma',
    enabled: true,
    successRate: 0.82,
    lastUpdated: Date.now(),
  },

  // AMAZON RULES
  {
    id: 'amazon_cart',
    merchantId: 'amazon',
    merchantName: 'Amazon India',
    merchantCategory: 'ecommerce',
    triggerCondition: 'cart_page',
    applicationMethod: 'code_injection',
    couponPriority: 1,
    fallbackStrategy: 'show_manual',
    successVerification: 'price_reduction',
    urlPatterns: ['https://www\\.amazon\\.in/gp/cart.*'],
    domSelectors: {
      couponInput: '#gc-redemption-input',
      applyButton: '#gc-apply-button',
      priceDisplay: '#sc-subtotal-amount-activecart',
    },
    enabled: true,
    successRate: 0.72,
    lastUpdated: Date.now(),
  },

  // FLIPKART RULES
  {
    id: 'flipkart_checkout',
    merchantId: 'flipkart',
    merchantName: 'Flipkart',
    merchantCategory: 'ecommerce',
    triggerCondition: 'checkout_page',
    applicationMethod: 'code_injection',
    couponPriority: 1,
    fallbackStrategy: 'try_next',
    successVerification: 'price_reduction',
    urlPatterns: ['https://www\\.flipkart\\.com/checkout.*'],
    domSelectors: {
      couponInput: 'input[name="couponCode"]',
      applyButton: '.apply-coupon',
      priceDisplay: '.amount-payable',
    },
    enabled: true,
    successRate: 0.80,
    lastUpdated: Date.now(),
  },

  // UBER RULES
  {
    id: 'uber_api',
    merchantId: 'uber',
    merchantName: 'Uber',
    merchantCategory: 'travel',
    triggerCondition: 'payment_page',
    applicationMethod: 'api_call',
    couponPriority: 1,
    fallbackStrategy: 'show_manual',
    successVerification: 'price_reduction',
    urlPatterns: ['uber://.*'],
    domSelectors: {},
    apiEndpoint: 'https://api.uber.com/v1/promotions',
    deepLinkTemplate: 'uber://?action=setPromo&promo={code}',
    enabled: true,
    successRate: 0.90,
    lastUpdated: Date.now(),
  },

  // MAKEMYTRIP RULES
  {
    id: 'mmt_checkout',
    merchantId: 'makemytrip',
    merchantName: 'MakeMyTrip',
    merchantCategory: 'travel',
    triggerCondition: 'checkout_page',
    applicationMethod: 'code_injection',
    couponPriority: 1,
    fallbackStrategy: 'try_next',
    successVerification: 'price_reduction',
    urlPatterns: ['https://.*\\.makemytrip\\.com/checkout.*'],
    domSelectors: {
      couponInput: '#couponsInput',
      applyButton: '.applyBtn',
      priceDisplay: '.grand-total',
    },
    enabled: true,
    successRate: 0.75,
    lastUpdated: Date.now(),
  },

  // BOOKMYSHOW RULES
  {
    id: 'bms_checkout',
    merchantId: 'bookmyshow',
    merchantName: 'BookMyShow',
    merchantCategory: 'entertainment',
    triggerCondition: 'checkout_page',
    applicationMethod: 'code_injection',
    couponPriority: 1,
    fallbackStrategy: 'show_manual',
    successVerification: 'price_reduction',
    urlPatterns: ['https://in\\.bookmyshow\\.com/checkout.*'],
    domSelectors: {
      couponInput: '#voucherCode',
      applyButton: '.apply-voucher',
      priceDisplay: '.total-amount',
    },
    enabled: true,
    successRate: 0.83,
    lastUpdated: Date.now(),
  },
];

// ==================== COUPON STACKING RULES ====================

export const DEMO_STACKING_RULES: CouponStackingRule[] = [
  {
    merchantId: 'swiggy',
    allowStacking: true,
    maxStackableCoupons: 2,
    stackingOrder: ['SWIGGY100', 'PARTY'],
    combinationRules: [
      { coupon1: 'SWIGGY50', coupon2: 'PARTY', compatible: true },
      { coupon1: 'SWIGGY100', coupon2: 'FIRSTORDER', compatible: false },
    ],
  },
  {
    merchantId: 'amazon',
    allowStacking: true,
    maxStackableCoupons: 3,
    stackingOrder: ['PRIME50', 'AMAZON100', 'SAVE20'],
    combinationRules: [
      { coupon1: 'PRIME50', coupon2: 'SAVE20', compatible: true },
      { coupon1: 'AMAZON100', coupon2: 'ELECTRONICS', compatible: true },
    ],
  },
  {
    merchantId: 'flipkart',
    allowStacking: false,
    maxStackableCoupons: 1,
    stackingOrder: [],
    combinationRules: [],
  },
];

// ==================== DEMO DATA INITIALIZATION ====================

export const initializeAutoApplyDemoData = () => {
  const store = useAutoApplyCouponStore.getState();

  // Add merchant integrations
  DEMO_MERCHANT_INTEGRATIONS.forEach((integration) => {
    store.addMerchantIntegration(integration);
  });

  // Add auto-apply rules
  DEMO_AUTO_APPLY_RULES.forEach((rule) => {
    store.addRule(rule);
  });

  // Add stacking rules
  DEMO_STACKING_RULES.forEach((rule) => {
    store.stackingRules.push(rule);
  });

  console.log('✅ Auto-Apply Demo Data Initialized');
  console.log(`   - ${DEMO_MERCHANT_INTEGRATIONS.length} Merchants`);
  console.log(`   - ${DEMO_AUTO_APPLY_RULES.length} Auto-Apply Rules`);
  console.log(`   - ${DEMO_STACKING_RULES.length} Stacking Rules`);
};

// ==================== DEMO ATTEMPTS (FOR TESTING) ====================

export const generateDemoAttempts = () => {
  const store = useAutoApplyCouponStore.getState();
  
  const demoAttempts = [
    {
      merchantId: 'swiggy',
      merchantName: 'Swiggy',
      couponCode: 'SWIGGY100',
      status: 'success' as const,
      savings: 100,
      originalPrice: 500,
      method: 'deep_link' as const,
    },
    {
      merchantId: 'zomato',
      merchantName: 'Zomato',
      couponCode: 'FEAST',
      status: 'success' as const,
      savings: 75,
      originalPrice: 400,
      method: 'deep_link' as const,
    },
    {
      merchantId: 'amazon',
      merchantName: 'Amazon India',
      couponCode: 'PRIME50',
      status: 'success' as const,
      savings: 150,
      originalPrice: 1500,
      method: 'code_injection' as const,
    },
    {
      merchantId: 'flipkart',
      merchantName: 'Flipkart',
      couponCode: 'FLIP50',
      status: 'failed' as const,
      savings: 0,
      originalPrice: 800,
      method: 'code_injection' as const,
    },
    {
      merchantId: 'uber',
      merchantName: 'Uber',
      couponCode: 'UBER50',
      status: 'success' as const,
      savings: 50,
      originalPrice: 200,
      method: 'api_call' as const,
    },
  ];

  demoAttempts.forEach((data) => {
    store.recordAttempt({
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now() - Math.random() * 86400000, // Random within last 24h
      couponId: data.couponCode,
      verificationMethod: 'price_reduction',
      attemptDuration: Math.random() * 2000 + 500,
      finalPrice: data.originalPrice - data.savings,
      ...data,
    });
  });

  console.log('✅ Generated Demo Attempts');
};
