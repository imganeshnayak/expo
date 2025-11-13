import { create } from 'zustand';

// ==================== TYPES ====================

export type SupplierType = 
  | 'food_supplies' 
  | 'equipment' 
  | 'furniture' 
  | 'packaging' 
  | 'cleaning' 
  | 'technology';

export type ServiceType = 
  | 'accounting' 
  | 'digital_marketing' 
  | 'legal' 
  | 'hr' 
  | 'maintenance' 
  | 'consulting';

export type DealType = 
  | 'bulk_purchase' 
  | 'joint_promotion' 
  | 'cross_selling' 
  | 'resource_sharing';

export type MembershipTier = 'basic' | 'premium' | 'enterprise';
export type PricingModel = 'hourly' | 'project' | 'subscription';
export type DealStatus = 'active' | 'pending' | 'completed' | 'expired';
export type TransactionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PartnershipStatus = 'pending' | 'accepted' | 'declined' | 'active';

export interface SupplierProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  unitPrice: number;
  minimumQuantity: number;
  unit: string;
  availability: 'in_stock' | 'low_stock' | 'out_of_stock';
  imageUrl?: string;
}

export interface BusinessSupplier {
  id: string;
  businessId: string;
  businessName: string;
  supplierType: SupplierType;
  products: SupplierProduct[];
  minimumOrder: number;
  deliveryRadius: number; // in km
  rating: number;
  reviewCount: number;
  membershipTier: MembershipTier;
  joinedDate: Date;
  description: string;
  location: {
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  badges: string[];
  totalClients: number;
  responseTime: string; // e.g., "within 2 hours"
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  completedDate: Date;
  clientTestimonial?: string;
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ServiceProvider {
  id: string;
  providerId: string;
  serviceType: ServiceType;
  serviceName: string;
  description: string;
  pricing: {
    model: PricingModel;
    rate: number;
    currency: string;
  };
  expertise: string[];
  portfolio: PortfolioItem[];
  availability: AvailabilitySlot[];
  rating: number;
  reviewCount: number;
  isUMAVerified: boolean;
  completedProjects: number;
  location: string;
  responseTime: string;
}

export interface BusinessDeal {
  id: string;
  initiatorId: string;
  initiatorName: string;
  dealType: DealType;
  title: string;
  description: string;
  terms: string;
  benefits: string[];
  targetBusinessTypes: string[];
  status: DealStatus;
  participants: string[];
  minParticipants: number;
  maxParticipants: number;
  currentSavings: number;
  potentialSavings: number;
  createdAt: Date;
  expiryDate: Date;
}

export interface PartnershipRequest {
  id: string;
  fromBusinessId: string;
  fromBusinessName: string;
  toBusinessId: string;
  toBusinessName: string;
  partnershipType: 'cross_promotion' | 'resource_sharing' | 'referral' | 'joint_campaign';
  proposal: string;
  proposedBenefits: string[];
  status: PartnershipStatus;
  createdAt: Date;
  respondedAt?: Date;
  terms?: string;
}

export interface B2BTransaction {
  id: string;
  type: 'product_purchase' | 'service_booking' | 'bulk_order';
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  commission: number;
  status: TransactionStatus;
  paymentMethod: string;
  deliveryDetails?: {
    address: string;
    scheduledDate: Date;
    trackingId?: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface BulkPurchase {
  id: string;
  productName: string;
  category: string;
  targetQuantity: number;
  currentQuantity: number;
  participants: {
    businessId: string;
    businessName: string;
    quantity: number;
  }[];
  pricePerUnit: number;
  discountedPrice: number;
  savingsPercent: number;
  deadline: Date;
  status: 'open' | 'fulfilled' | 'expired';
  createdBy: string;
}

export interface ServiceBooking {
  id: string;
  providerId: string;
  providerName: string;
  serviceType: ServiceType;
  businessId: string;
  businessName: string;
  scheduledDate: Date;
  duration: number; // in hours
  totalCost: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  notes?: string;
  createdAt: Date;
}

export interface MarketplaceInsights {
  totalSuppliers: number;
  totalServiceProviders: number;
  totalB2BTransactions: number;
  totalTransactionValue: number;
  averageDealSize: number;
  topSupplierCategories: { category: SupplierType; count: number }[];
  topServiceTypes: { type: ServiceType; count: number }[];
  monthlyGrowth: number;
  activeDeals: number;
  partnershipCount: number;
}

export interface NetworkEffectMetrics {
  businessConnectivity: {
    averageConnectionsPerBusiness: number;
    totalConnections: number;
    networkDensity: number;
  };
  economicImpact: {
    totalB2BVolume: number;
    averageSavingsThroughCollective: number;
    revenueGrowthFromPartnerships: number;
  };
  platformHealth: {
    businessRetentionRate: number;
    networkGrowthVelocity: number;
    ecosystemDensityByLocation: { [city: string]: number };
  };
  crossBusinessMetrics: {
    customerSharingRate: number;
    partnershipSuccessScore: number;
    averageReferrals: number;
  };
}

// ==================== STORE STATE ====================

interface MarketplaceState {
  // Business Network
  suppliers: BusinessSupplier[];
  serviceProviders: ServiceProvider[];
  businessDeals: BusinessDeal[];
  partnershipRequests: PartnershipRequest[];
  
  // Transactions
  b2bTransactions: B2BTransaction[];
  bulkPurchases: BulkPurchase[];
  serviceBookings: ServiceBooking[];
  
  // Analytics
  marketplaceInsights: MarketplaceInsights;
  networkEffects: NetworkEffectMetrics;
  
  // UI State
  selectedSupplier: BusinessSupplier | null;
  selectedServiceProvider: ServiceProvider | null;
  selectedDeal: BusinessDeal | null;
  filterCategory: SupplierType | ServiceType | 'all';
  searchQuery: string;
  
  // Actions - Supplier Management
  addSupplier: (supplier: BusinessSupplier) => void;
  updateSupplier: (id: string, updates: Partial<BusinessSupplier>) => void;
  removeSupplier: (id: string) => void;
  getSuppliersByType: (type: SupplierType) => BusinessSupplier[];
  getNearbySuppliers: (userLocation: { lat: number; lng: number }, radius: number) => BusinessSupplier[];
  
  // Actions - Service Provider Management
  addServiceProvider: (provider: ServiceProvider) => void;
  updateServiceProvider: (id: string, updates: Partial<ServiceProvider>) => void;
  getProvidersByType: (type: ServiceType) => ServiceProvider[];
  bookService: (booking: ServiceBooking) => void;
  
  // Actions - Business Deals
  createDeal: (deal: Omit<BusinessDeal, 'id' | 'createdAt'>) => string;
  joinDeal: (dealId: string, businessId: string) => void;
  leaveDeal: (dealId: string, businessId: string) => void;
  updateDealStatus: (dealId: string, status: DealStatus) => void;
  getActiveDeals: () => BusinessDeal[];
  getRecommendedDeals: (businessType: string) => BusinessDeal[];
  
  // Actions - Partnerships
  createPartnershipRequest: (request: Omit<PartnershipRequest, 'id' | 'createdAt' | 'status'>) => void;
  respondToPartnership: (requestId: string, response: 'accept' | 'decline', terms?: string) => void;
  getMyPartnerships: (businessId: string) => PartnershipRequest[];
  
  // Actions - B2B Transactions
  createTransaction: (transaction: Omit<B2BTransaction, 'id' | 'createdAt'>) => string;
  updateTransactionStatus: (transactionId: string, status: TransactionStatus) => void;
  getBusinessTransactions: (businessId: string) => B2BTransaction[];
  
  // Actions - Bulk Purchases
  createBulkPurchase: (purchase: Omit<BulkPurchase, 'id'>) => void;
  joinBulkPurchase: (purchaseId: string, businessId: string, businessName: string, quantity: number) => void;
  getActiveBulkPurchases: () => BulkPurchase[];
  
  // Actions - Analytics
  calculateMarketplaceInsights: () => void;
  calculateNetworkEffects: () => void;
  getSupplierPerformance: (supplierId: string) => {
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    repeatCustomerRate: number;
  };
  
  // Actions - Search & Discovery
  searchMarketplace: (query: string) => {
    suppliers: BusinessSupplier[];
    providers: ServiceProvider[];
    deals: BusinessDeal[];
  };
  setFilter: (category: SupplierType | ServiceType | 'all') => void;
  
  // Actions - Recommendations
  getSmartMatches: (businessId: string, businessType: string) => {
    suppliers: BusinessSupplier[];
    providers: ServiceProvider[];
    deals: BusinessDeal[];
  };
  
  // Reset
  reset: () => void;
}

// ==================== MOCK DATA ====================

const mockSuppliers: BusinessSupplier[] = [
  {
    id: 'sup1',
    businessId: 'biz1',
    businessName: 'Fresh Farm Foods',
    supplierType: 'food_supplies',
    products: [
      {
        id: 'prod1',
        name: 'Premium Coffee Beans',
        description: 'Arabica beans from Coorg',
        category: 'Beverages',
        unitPrice: 850,
        minimumQuantity: 5,
        unit: 'kg',
        availability: 'in_stock',
      },
      {
        id: 'prod2',
        name: 'Organic Vegetables',
        description: 'Farm-fresh daily delivery',
        category: 'Produce',
        unitPrice: 120,
        minimumQuantity: 10,
        unit: 'kg',
        availability: 'in_stock',
      },
    ],
    minimumOrder: 2000,
    deliveryRadius: 15,
    rating: 4.7,
    reviewCount: 89,
    membershipTier: 'premium',
    joinedDate: new Date('2024-01-15'),
    description: 'Premium food supplier serving 100+ restaurants and cafes',
    location: {
      address: '123 Market Road',
      city: 'Bangalore',
      coordinates: { lat: 12.9716, lng: 77.5946 },
    },
    contactInfo: {
      phone: '+91 98765 43210',
      email: 'orders@freshfarmfoods.com',
      website: 'https://freshfarmfoods.com',
    },
    badges: ['UMA Verified', 'Top Rated', 'Fast Delivery'],
    totalClients: 127,
    responseTime: 'within 2 hours',
  },
  {
    id: 'sup2',
    businessId: 'biz2',
    businessName: 'RestaurantPro Equipment',
    supplierType: 'equipment',
    products: [
      {
        id: 'prod3',
        name: 'Commercial Coffee Machine',
        description: 'Italian espresso machine',
        category: 'Kitchen Equipment',
        unitPrice: 85000,
        minimumQuantity: 1,
        unit: 'unit',
        availability: 'in_stock',
      },
      {
        id: 'prod4',
        name: 'Industrial Mixer',
        description: '20L capacity professional mixer',
        category: 'Kitchen Equipment',
        unitPrice: 45000,
        minimumQuantity: 1,
        unit: 'unit',
        availability: 'low_stock',
      },
    ],
    minimumOrder: 10000,
    deliveryRadius: 25,
    rating: 4.9,
    reviewCount: 156,
    membershipTier: 'enterprise',
    joinedDate: new Date('2023-06-10'),
    description: 'Commercial kitchen equipment with installation and warranty',
    location: {
      address: '45 Industrial Estate',
      city: 'Bangalore',
      coordinates: { lat: 12.9822, lng: 77.6382 },
    },
    contactInfo: {
      phone: '+91 98765 11111',
      email: 'sales@restaurantpro.in',
      website: 'https://restaurantpro.in',
    },
    badges: ['UMA Verified', 'Enterprise Partner', 'Installation Service'],
    totalClients: 243,
    responseTime: 'within 1 hour',
  },
  {
    id: 'sup3',
    businessId: 'biz3',
    businessName: 'EcoPackaging Solutions',
    supplierType: 'packaging',
    products: [
      {
        id: 'prod5',
        name: 'Biodegradable Food Containers',
        description: 'Eco-friendly takeaway boxes',
        category: 'Packaging',
        unitPrice: 8,
        minimumQuantity: 500,
        unit: 'piece',
        availability: 'in_stock',
      },
      {
        id: 'prod6',
        name: 'Paper Bags',
        description: 'Customizable paper bags',
        category: 'Packaging',
        unitPrice: 3,
        minimumQuantity: 1000,
        unit: 'piece',
        availability: 'in_stock',
      },
    ],
    minimumOrder: 5000,
    deliveryRadius: 20,
    rating: 4.6,
    reviewCount: 72,
    membershipTier: 'premium',
    joinedDate: new Date('2024-03-01'),
    description: 'Sustainable packaging solutions for modern businesses',
    location: {
      address: '78 Green Street',
      city: 'Bangalore',
      coordinates: { lat: 12.9352, lng: 77.6245 },
    },
    contactInfo: {
      phone: '+91 98765 22222',
      email: 'info@ecopackaging.in',
    },
    badges: ['UMA Verified', 'Eco-Friendly', 'Custom Printing'],
    totalClients: 94,
    responseTime: 'within 3 hours',
  },
];

const mockServiceProviders: ServiceProvider[] = [
  {
    id: 'sp1',
    providerId: 'prov1',
    serviceType: 'digital_marketing',
    serviceName: 'UMA Campaign Wizards',
    description: 'Specialized in optimizing UMA campaigns and digital presence',
    pricing: {
      model: 'project',
      rate: 25000,
      currency: 'INR',
    },
    expertise: ['Social Media', 'UMA Campaign Optimization', 'SEO', 'Content Creation'],
    portfolio: [
      {
        id: 'port1',
        title: 'Cafe Delight Campaign',
        description: 'Increased foot traffic by 40% using UMA missions',
        completedDate: new Date('2024-09-15'),
        clientTestimonial: 'Amazing results! Our evening sales doubled.',
      },
    ],
    availability: [
      { day: 'Monday', startTime: '09:00', endTime: '18:00' },
      { day: 'Tuesday', startTime: '09:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '18:00' },
      { day: 'Thursday', startTime: '09:00', endTime: '18:00' },
      { day: 'Friday', startTime: '09:00', endTime: '18:00' },
    ],
    rating: 4.8,
    reviewCount: 34,
    isUMAVerified: true,
    completedProjects: 47,
    location: 'Bangalore',
    responseTime: 'within 4 hours',
  },
  {
    id: 'sp2',
    providerId: 'prov2',
    serviceType: 'accounting',
    serviceName: 'BusinessBooks Pro',
    description: 'GST filing, tax optimization, and financial planning for local businesses',
    pricing: {
      model: 'subscription',
      rate: 5000,
      currency: 'INR',
    },
    expertise: ['GST Filing', 'Tax Planning', 'Bookkeeping', 'Financial Consulting'],
    portfolio: [
      {
        id: 'port2',
        title: 'Restaurant Chain Accounting',
        description: 'Managed accounts for 5-location restaurant chain',
        completedDate: new Date('2024-10-01'),
        clientTestimonial: 'Saved us ₹2L in taxes this year!',
      },
    ],
    availability: [
      { day: 'Monday', startTime: '10:00', endTime: '19:00' },
      { day: 'Tuesday', startTime: '10:00', endTime: '19:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '19:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '19:00' },
      { day: 'Friday', startTime: '10:00', endTime: '19:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' },
    ],
    rating: 4.9,
    reviewCount: 67,
    isUMAVerified: true,
    completedProjects: 124,
    location: 'Bangalore',
    responseTime: 'within 2 hours',
  },
  {
    id: 'sp3',
    providerId: 'prov3',
    serviceType: 'maintenance',
    serviceName: 'FixIt Services',
    description: 'Equipment repair and facility maintenance for businesses',
    pricing: {
      model: 'hourly',
      rate: 800,
      currency: 'INR',
    },
    expertise: ['Equipment Repair', 'Plumbing', 'Electrical', 'HVAC'],
    portfolio: [],
    availability: [
      { day: 'Monday', startTime: '08:00', endTime: '20:00' },
      { day: 'Tuesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '08:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '08:00', endTime: '20:00' },
      { day: 'Friday', startTime: '08:00', endTime: '20:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '17:00' },
      { day: 'Sunday', startTime: '09:00', endTime: '13:00' },
    ],
    rating: 4.5,
    reviewCount: 28,
    isUMAVerified: false,
    completedProjects: 89,
    location: 'Bangalore',
    responseTime: 'within 30 minutes',
  },
];

const mockBusinessDeals: BusinessDeal[] = [
  {
    id: 'deal1',
    initiatorId: 'biz1',
    initiatorName: 'Fresh Farm Foods',
    dealType: 'bulk_purchase',
    title: 'Collective Coffee Bean Purchase',
    description: 'Join 15 cafes to get premium coffee beans at 25% off',
    terms: 'Minimum 10kg per participant. Payment upfront. Delivery within 3 days.',
    benefits: [
      '25% discount on premium coffee beans',
      'Free delivery for orders above 20kg',
      'Quality guarantee',
    ],
    targetBusinessTypes: ['cafe', 'restaurant', 'bakery'],
    status: 'active',
    participants: ['cafe1', 'cafe2', 'cafe3', 'cafe4', 'cafe5'],
    minParticipants: 10,
    maxParticipants: 20,
    currentSavings: 15000,
    potentialSavings: 30000,
    createdAt: new Date('2024-11-01'),
    expiryDate: new Date('2024-11-20'),
  },
  {
    id: 'deal2',
    initiatorId: 'biz2',
    initiatorName: 'Cafe Mocha',
    dealType: 'joint_promotion',
    title: 'Coffee + Bookstore Combo Mission',
    description: 'Cross-promote between cafes and bookstores for evening traffic',
    terms: 'Share customer data (anonymized). Run joint mission for 2 weeks.',
    benefits: [
      'Access to partner customer base',
      'Co-branded marketing materials',
      'Shared mission rewards',
      'Increased evening footfall',
    ],
    targetBusinessTypes: ['bookstore', 'library', 'co-working'],
    status: 'active',
    participants: ['book1', 'book2'],
    minParticipants: 2,
    maxParticipants: 5,
    currentSavings: 0,
    potentialSavings: 50000,
    createdAt: new Date('2024-11-05'),
    expiryDate: new Date('2024-11-25'),
  },
  {
    id: 'deal3',
    initiatorId: 'biz3',
    initiatorName: 'Restaurant Alliance',
    dealType: 'resource_sharing',
    title: 'Shared Delivery Personnel Pool',
    description: 'Share delivery staff during peak hours to reduce costs',
    terms: 'Hourly rate ₹150 per delivery person. 24-hour advance booking.',
    benefits: [
      'Reduce delivery costs by 40%',
      'Access to trained delivery staff',
      'Flexible booking',
      'Insurance covered',
    ],
    targetBusinessTypes: ['restaurant', 'cafe', 'bakery', 'grocery'],
    status: 'active',
    participants: ['rest1', 'rest2', 'rest3', 'rest4', 'rest5', 'rest6'],
    minParticipants: 5,
    maxParticipants: 15,
    currentSavings: 25000,
    potentialSavings: 75000,
    createdAt: new Date('2024-10-15'),
    expiryDate: new Date('2025-01-15'),
  },
];

// ==================== STORE IMPLEMENTATION ====================

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
  // Initial State
  suppliers: mockSuppliers,
  serviceProviders: mockServiceProviders,
  businessDeals: mockBusinessDeals,
  partnershipRequests: [],
  b2bTransactions: [],
  bulkPurchases: [],
  serviceBookings: [],
  marketplaceInsights: {
    totalSuppliers: 0,
    totalServiceProviders: 0,
    totalB2BTransactions: 0,
    totalTransactionValue: 0,
    averageDealSize: 0,
    topSupplierCategories: [],
    topServiceTypes: [],
    monthlyGrowth: 0,
    activeDeals: 0,
    partnershipCount: 0,
  },
  networkEffects: {
    businessConnectivity: {
      averageConnectionsPerBusiness: 0,
      totalConnections: 0,
      networkDensity: 0,
    },
    economicImpact: {
      totalB2BVolume: 0,
      averageSavingsThroughCollective: 0,
      revenueGrowthFromPartnerships: 0,
    },
    platformHealth: {
      businessRetentionRate: 0,
      networkGrowthVelocity: 0,
      ecosystemDensityByLocation: {},
    },
    crossBusinessMetrics: {
      customerSharingRate: 0,
      partnershipSuccessScore: 0,
      averageReferrals: 0,
    },
  },
  selectedSupplier: null,
  selectedServiceProvider: null,
  selectedDeal: null,
  filterCategory: 'all',
  searchQuery: '',

  // Supplier Management
  addSupplier: (supplier) => {
    set((state) => ({
      suppliers: [...state.suppliers, supplier],
    }));
    get().calculateMarketplaceInsights();
  },

  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  },

  removeSupplier: (id) => {
    set((state) => ({
      suppliers: state.suppliers.filter((s) => s.id !== id),
    }));
    get().calculateMarketplaceInsights();
  },

  getSuppliersByType: (type) => {
    return get().suppliers.filter((s) => s.supplierType === type);
  },

  getNearbySuppliers: (userLocation, radius) => {
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return get().suppliers.filter((supplier) => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        supplier.location.coordinates.lat,
        supplier.location.coordinates.lng
      );
      return distance <= radius;
    });
  },

  // Service Provider Management
  addServiceProvider: (provider) => {
    set((state) => ({
      serviceProviders: [...state.serviceProviders, provider],
    }));
    get().calculateMarketplaceInsights();
  },

  updateServiceProvider: (id, updates) => {
    set((state) => ({
      serviceProviders: state.serviceProviders.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  getProvidersByType: (type) => {
    return get().serviceProviders.filter((p) => p.serviceType === type);
  },

  bookService: (booking) => {
    set((state) => ({
      serviceBookings: [...state.serviceBookings, booking],
    }));
  },

  // Business Deals
  createDeal: (dealData) => {
    const newDeal: BusinessDeal = {
      ...dealData,
      id: `deal${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      businessDeals: [...state.businessDeals, newDeal],
    }));
    get().calculateMarketplaceInsights();
    return newDeal.id;
  },

  joinDeal: (dealId, businessId) => {
    set((state) => ({
      businessDeals: state.businessDeals.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              participants: [...deal.participants, businessId],
              currentSavings: deal.currentSavings + deal.potentialSavings / deal.maxParticipants,
            }
          : deal
      ),
    }));
  },

  leaveDeal: (dealId, businessId) => {
    set((state) => ({
      businessDeals: state.businessDeals.map((deal) =>
        deal.id === dealId
          ? {
              ...deal,
              participants: deal.participants.filter((p) => p !== businessId),
              currentSavings: Math.max(0, deal.currentSavings - deal.potentialSavings / deal.maxParticipants),
            }
          : deal
      ),
    }));
  },

  updateDealStatus: (dealId, status) => {
    set((state) => ({
      businessDeals: state.businessDeals.map((deal) =>
        deal.id === dealId ? { ...deal, status } : deal
      ),
    }));
  },

  getActiveDeals: () => {
    return get().businessDeals.filter((deal) => deal.status === 'active');
  },

  getRecommendedDeals: (businessType) => {
    return get().businessDeals.filter(
      (deal) =>
        deal.status === 'active' &&
        deal.targetBusinessTypes.includes(businessType) &&
        deal.participants.length < deal.maxParticipants
    );
  },

  // Partnerships
  createPartnershipRequest: (requestData) => {
    const newRequest: PartnershipRequest = {
      ...requestData,
      id: `pr${Date.now()}`,
      status: 'pending',
      createdAt: new Date(),
    };
    set((state) => ({
      partnershipRequests: [...state.partnershipRequests, newRequest],
    }));
  },

  respondToPartnership: (requestId, response, terms) => {
    set((state) => ({
      partnershipRequests: state.partnershipRequests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: response === 'accept' ? 'accepted' : 'declined',
              respondedAt: new Date(),
              terms: terms || req.terms,
            }
          : req
      ),
    }));
    get().calculateNetworkEffects();
  },

  getMyPartnerships: (businessId) => {
    return get().partnershipRequests.filter(
      (req) =>
        (req.fromBusinessId === businessId || req.toBusinessId === businessId) &&
        req.status === 'active'
    );
  },

  // B2B Transactions
  createTransaction: (transactionData) => {
    const newTransaction: B2BTransaction = {
      ...transactionData,
      id: `txn${Date.now()}`,
      createdAt: new Date(),
    };
    set((state) => ({
      b2bTransactions: [...state.b2bTransactions, newTransaction],
    }));
    get().calculateMarketplaceInsights();
    return newTransaction.id;
  },

  updateTransactionStatus: (transactionId, status) => {
    set((state) => ({
      b2bTransactions: state.b2bTransactions.map((txn) =>
        txn.id === transactionId
          ? {
              ...txn,
              status,
              completedAt: status === 'completed' ? new Date() : txn.completedAt,
            }
          : txn
      ),
    }));
  },

  getBusinessTransactions: (businessId) => {
    return get().b2bTransactions.filter(
      (txn) => txn.buyerId === businessId || txn.sellerId === businessId
    );
  },

  // Bulk Purchases
  createBulkPurchase: (purchase) => {
    const newPurchase: BulkPurchase = {
      ...purchase,
      id: `BP${Date.now()}`,
    };
    set((state) => ({
      bulkPurchases: [...state.bulkPurchases, newPurchase],
    }));
  },

  joinBulkPurchase: (purchaseId, businessId, businessName, quantity) => {
    set((state) => ({
      bulkPurchases: state.bulkPurchases.map((purchase) =>
        purchase.id === purchaseId
          ? {
              ...purchase,
              participants: [
                ...purchase.participants,
                { businessId, businessName, quantity },
              ],
              currentQuantity: purchase.currentQuantity + quantity,
              status:
                purchase.currentQuantity + quantity >= purchase.targetQuantity
                  ? 'fulfilled'
                  : purchase.status,
            }
          : purchase
      ),
    }));
  },

  getActiveBulkPurchases: () => {
    return get().bulkPurchases.filter((p) => p.status === 'open');
  },

  // Analytics
  calculateMarketplaceInsights: () => {
    const state = get();
    
    const supplierTypeCount = state.suppliers.reduce((acc, s) => {
      acc[s.supplierType] = (acc[s.supplierType] || 0) + 1;
      return acc;
    }, {} as Record<SupplierType, number>);

    const serviceTypeCount = state.serviceProviders.reduce((acc, p) => {
      acc[p.serviceType] = (acc[p.serviceType] || 0) + 1;
      return acc;
    }, {} as Record<ServiceType, number>);

    const totalTransactionValue = state.b2bTransactions
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.totalAmount, 0);

    const insights: MarketplaceInsights = {
      totalSuppliers: state.suppliers.length,
      totalServiceProviders: state.serviceProviders.length,
      totalB2BTransactions: state.b2bTransactions.length,
      totalTransactionValue,
      averageDealSize:
        state.b2bTransactions.length > 0
          ? totalTransactionValue / state.b2bTransactions.length
          : 0,
      topSupplierCategories: Object.entries(supplierTypeCount)
        .map(([category, count]) => ({ category: category as SupplierType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      topServiceTypes: Object.entries(serviceTypeCount)
        .map(([type, count]) => ({ type: type as ServiceType, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      monthlyGrowth: 12.5,
      activeDeals: state.businessDeals.filter((d) => d.status === 'active').length,
      partnershipCount: state.partnershipRequests.filter(
        (p) => p.status === 'active'
      ).length,
    };

    set({ marketplaceInsights: insights });
  },

  calculateNetworkEffects: () => {
    const state = get();
    
    const totalBusinesses = new Set([
      ...state.suppliers.map((s) => s.businessId),
      ...state.serviceProviders.map((p) => p.providerId),
    ]).size;

    const totalConnections = state.partnershipRequests.filter(
      (p) => p.status === 'active'
    ).length;

    const networkEffects: NetworkEffectMetrics = {
      businessConnectivity: {
        averageConnectionsPerBusiness:
          totalBusinesses > 0 ? totalConnections / totalBusinesses : 0,
        totalConnections,
        networkDensity:
          totalBusinesses > 1
            ? totalConnections / (totalBusinesses * (totalBusinesses - 1) / 2)
            : 0,
      },
      economicImpact: {
        totalB2BVolume: state.b2bTransactions
          .filter((t) => t.status === 'completed')
          .reduce((sum, t) => sum + t.totalAmount, 0),
        averageSavingsThroughCollective:
          state.businessDeals.reduce((sum, d) => sum + d.currentSavings, 0) /
          Math.max(state.businessDeals.length, 1),
        revenueGrowthFromPartnerships: 18.5,
      },
      platformHealth: {
        businessRetentionRate: 94.5,
        networkGrowthVelocity: 23.7,
        ecosystemDensityByLocation: {
          Bangalore: 145,
          Mumbai: 98,
          Delhi: 76,
        },
      },
      crossBusinessMetrics: {
        customerSharingRate: 12.3,
        partnershipSuccessScore: 87.2,
        averageReferrals: 3.4,
      },
    };

    set({ networkEffects });
  },

  getSupplierPerformance: (supplierId) => {
    const state = get();
    const transactions = state.b2bTransactions.filter(
      (t) => t.sellerId === supplierId
    );
    
    const completedTransactions = transactions.filter((t) => t.status === 'completed');
    const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
    
    const supplier = state.suppliers.find((s) => s.id === supplierId);
    const uniqueCustomers = new Set(transactions.map((t) => t.buyerId)).size;
    const repeatCustomers = transactions.length > uniqueCustomers ? 
      (transactions.length - uniqueCustomers) / uniqueCustomers : 0;

    return {
      totalOrders: transactions.length,
      totalRevenue,
      averageRating: supplier?.rating || 0,
      repeatCustomerRate: repeatCustomers * 100,
    };
  },

  // Search & Discovery
  searchMarketplace: (query) => {
    const state = get();
    const lowerQuery = query.toLowerCase();

    const suppliers = state.suppliers.filter(
      (s) =>
        s.businessName.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.products.some((p) => p.name.toLowerCase().includes(lowerQuery))
    );

    const providers = state.serviceProviders.filter(
      (p) =>
        p.serviceName.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.expertise.some((e) => e.toLowerCase().includes(lowerQuery))
    );

    const deals = state.businessDeals.filter(
      (d) =>
        d.title.toLowerCase().includes(lowerQuery) ||
        d.description.toLowerCase().includes(lowerQuery)
    );

    return { suppliers, providers, deals };
  },

  setFilter: (category) => {
    set({ filterCategory: category });
  },

  // Recommendations
  getSmartMatches: (businessId, businessType) => {
    const state = get();
    
    // Get suppliers based on business type
    const supplierMapping: Record<string, SupplierType[]> = {
      restaurant: ['food_supplies', 'equipment', 'packaging', 'cleaning'],
      cafe: ['food_supplies', 'equipment', 'packaging'],
      salon: ['equipment', 'furniture', 'cleaning'],
      clinic: ['equipment', 'furniture', 'cleaning', 'technology'],
      retail: ['packaging', 'furniture', 'technology'],
    };

    const relevantSupplierTypes = supplierMapping[businessType] || [];
    const suppliers = state.suppliers
      .filter((s) => relevantSupplierTypes.includes(s.supplierType))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Get service providers based on common needs
    const providers = state.serviceProviders
      .filter((p) =>
        ['accounting', 'digital_marketing', 'maintenance'].includes(p.serviceType)
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Get relevant deals
    const deals = state.businessDeals
      .filter(
        (d) =>
          d.status === 'active' &&
          d.targetBusinessTypes.includes(businessType) &&
          d.participants.length < d.maxParticipants
      )
      .slice(0, 5);

    return { suppliers, providers, deals };
  },

  // Reset
  reset: () => {
    set({
      suppliers: mockSuppliers,
      serviceProviders: mockServiceProviders,
      businessDeals: mockBusinessDeals,
      partnershipRequests: [],
      b2bTransactions: [],
      bulkPurchases: [],
      serviceBookings: [],
      selectedSupplier: null,
      selectedServiceProvider: null,
      selectedDeal: null,
      filterCategory: 'all',
      searchQuery: '',
    });
  },
}));
