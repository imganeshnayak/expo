import { create } from 'zustand';

// ==================== TYPES ====================

// Visual Segment Builder Types
export type CriteriaField = 
  | 'visitFrequency' 
  | 'lastVisit' 
  | 'averageSpend' 
  | 'totalSpend'
  | 'preferences' 
  | 'loyaltyStatus'
  | 'location'
  | 'ageGroup'
  | 'customerSince';

export type CriteriaOperator = 
  | 'greaterThan' 
  | 'lessThan' 
  | 'equals' 
  | 'contains' 
  | 'inLast'
  | 'between'
  | 'notEquals';

export type VisualType = 'slider' | 'dropdown' | 'checkbox' | 'dateRange' | 'input' | 'multiSelect';
export type LogicGroup = 'AND' | 'OR';

export interface VisualCriterion {
  id: string;
  field: CriteriaField;
  operator: CriteriaOperator;
  value: any;
  visualType: VisualType;
  group: LogicGroup;
  label: string;
  description?: string;
}

export interface CustomerPreview {
  id: string;
  name: string;
  email: string;
  visitCount: number;
  totalSpend: number;
  lastVisit: number;
  loyaltyStatus: string;
  matchScore: number; // How well they match the criteria (0-1)
}

export interface SegmentPerformance {
  segmentId: string;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  campaignResponseRate: number;
  churnRate: number;
  lifetimeValue: number;
  growthRate: number; // % change in size over time
}

export interface VisualSegment {
  id: string;
  name: string;
  description: string;
  criteria: VisualCriterion[];
  customerCount: number;
  previewCustomers: CustomerPreview[];
  isDynamic: boolean; // Auto-updates as customers match/unmatch
  createdAt: number;
  updatedAt: number;
  color: string;
  icon: string;
  performance?: SegmentPerformance;
}

export interface CriteriaTemplate {
  id: string;
  name: string;
  description: string;
  field: CriteriaField;
  operator: CriteriaOperator;
  defaultValue: any;
  visualType: VisualType;
  options?: string[];
  min?: number;
  max?: number;
  category: 'behavior' | 'demographic' | 'financial' | 'engagement';
}

// Automated Workflow Types
export type TriggerType = 'time_based' | 'behavior_based' | 'event_based' | 'segment_entry' | 'segment_exit';
export type ActionType = 
  | 'send_message' 
  | 'award_stamps' 
  | 'create_campaign' 
  | 'change_segment'
  | 'send_email'
  | 'send_push'
  | 'award_coupon'
  | 'update_status'
  | 'webhook';

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'condition' | 'action' | 'delay' | 'split';
  position: { x: number; y: number };
  data: {
    label: string;
    config: any;
  };
  connections: string[]; // IDs of connected nodes
}

export interface WorkflowTrigger {
  type: TriggerType;
  config: {
    eventName?: string;
    scheduleTime?: string; // cron expression
    segmentId?: string;
    behaviorType?: string;
    conditions?: any[];
  };
}

export interface WorkflowAction {
  type: ActionType;
  config: {
    messageTemplate?: string;
    stampCount?: number;
    campaignId?: string;
    segmentId?: string;
    emailTemplate?: string;
    couponCode?: string;
    webhookUrl?: string;
  };
  delayMinutes?: number;
}

export interface AutomatedWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  isActive: boolean;
  isDraft: boolean;
  createdAt: number;
  lastRun?: number;
  totalExecutions: number;
  successRate: number;
  performance: {
    customersProcessed: number;
    conversionRate: number;
    totalRevenue: number;
  };
}

// Multi-Location Types
export type LocationLevel = 'corporate' | 'region' | 'store';
export type UserRole = 'owner' | 'regional_manager' | 'store_manager' | 'staff' | 'viewer';

export interface LocationHierarchy {
  id: string;
  name: string;
  level: LocationLevel;
  parentId?: string;
  children: string[]; // IDs of child locations
  address?: string;
  managers: string[]; // User IDs
  permissions: RolePermission[];
}

export interface RolePermission {
  role: UserRole;
  permissions: {
    viewAnalytics: boolean;
    createCampaigns: boolean;
    manageCRM: boolean;
    viewRevenue: boolean;
    manageStaff: boolean;
    exportData: boolean;
    accessAPI: boolean;
  };
}

export interface LocationPerformance {
  locationId: string;
  locationName: string;
  revenue: number;
  customerCount: number;
  campaignCount: number;
  averageOrderValue: number;
  growthRate: number;
  rank: number; // Ranking among peers
}

// Revenue Dashboard Types
export type RevenueStream = 'cpt' | 'cpa' | 'subscription' | 'premium_features' | 'marketplace';

export interface LiveTransaction {
  id: string;
  timestamp: number;
  customerId: string;
  customerName: string;
  locationId: string;
  amount: number;
  revenueStream: RevenueStream;
  metadata: {
    campaignId?: string;
    merchantId?: string;
    subscriptionTier?: string;
  };
}

export interface RevenueBreakdown {
  stream: RevenueStream;
  amount: number;
  percentage: number;
  transactionCount: number;
  averageValue: number;
  growth: number; // % change from previous period
}

export interface RevenueProjection {
  date: number;
  projected: number;
  actual?: number;
  confidence: number; // 0-1
  factors: string[]; // Factors affecting projection
}

export interface RevenueAnomaly {
  id: string;
  timestamp: number;
  type: 'spike' | 'drop' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  description: string;
  expectedValue: number;
  actualValue: number;
  deviation: number; // Percentage
  possibleCauses: string[];
}

// White-Label Types
export interface BrandCustomization {
  clientId: string;
  brandName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  customDomain?: string;
  emailTemplate: {
    headerImage: string;
    footerText: string;
    primaryColor: string;
  };
}

export interface FeatureToggle {
  featureId: string;
  featureName: string;
  enabled: boolean;
  requiredTier: 'basic' | 'pro' | 'enterprise';
}

export interface APIAccess {
  clientId: string;
  apiKey: string;
  secretKey: string;
  rateLimit: number; // Requests per hour
  endpoints: string[];
  isActive: boolean;
  createdAt: number;
  lastUsed?: number;
  totalCalls: number;
}

// Advanced Reporting Types
export type MetricType = 
  | 'revenue' 
  | 'customers' 
  | 'campaigns' 
  | 'engagement' 
  | 'retention'
  | 'conversion'
  | 'roi';

export type DimensionType = 
  | 'time' 
  | 'location' 
  | 'segment' 
  | 'campaign' 
  | 'product'
  | 'channel';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'table' | 'number';
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ReportMetric {
  id: string;
  type: MetricType;
  label: string;
  formula?: string;
  format: 'currency' | 'number' | 'percentage';
}

export interface ReportDimension {
  id: string;
  type: DimensionType;
  label: string;
  groupBy?: string;
}

export interface CustomReport {
  id: string;
  name: string;
  description: string;
  metrics: ReportMetric[];
  dimensions: ReportDimension[];
  filters: {
    dateRange: { start: number; end: number };
    locations?: string[];
    segments?: string[];
    campaigns?: string[];
  };
  visualization: {
    chartType: ChartType;
    layout: 'single' | 'grid' | 'dashboard';
  };
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
    format: ExportFormat;
  };
  createdAt: number;
  lastRun?: number;
}

// ==================== STORE ====================

interface AdvancedFeaturesStore {
  // Visual Segment Builder State
  segments: VisualSegment[];
  criteriaTemplates: CriteriaTemplate[];
  segmentPerformance: Map<string, SegmentPerformance>;
  
  // Automated Workflows State
  workflows: AutomatedWorkflow[];
  workflowExecutions: Map<string, any[]>;
  
  // Multi-Location State
  locations: LocationHierarchy[];
  locationPerformance: Map<string, LocationPerformance>;
  currentUserRole: UserRole;
  
  // Revenue Dashboard State
  liveTransactions: LiveTransaction[];
  revenueBreakdown: RevenueBreakdown[];
  revenueProjections: RevenueProjection[];
  revenueAnomalies: RevenueAnomaly[];
  
  // White-Label State
  brandCustomization: BrandCustomization | null;
  featureToggles: FeatureToggle[];
  apiAccess: APIAccess | null;
  
  // Advanced Reporting State
  customReports: CustomReport[];
  reportData: Map<string, any>;

  // ==================== SEGMENT BUILDER ====================
  
  // Segment Management
  createSegment: (segment: Omit<VisualSegment, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSegment: (segmentId: string, updates: Partial<VisualSegment>) => void;
  deleteSegment: (segmentId: string) => void;
  duplicateSegment: (segmentId: string) => string;
  
  // Criteria Management
  addCriterion: (segmentId: string, criterion: Omit<VisualCriterion, 'id'>) => void;
  updateCriterion: (segmentId: string, criterionId: string, updates: Partial<VisualCriterion>) => void;
  removeCriterion: (segmentId: string, criterionId: string) => void;
  
  // Segment Preview & Analysis
  previewSegment: (criteria: VisualCriterion[]) => CustomerPreview[];
  calculateSegmentSize: (criteria: VisualCriterion[]) => number;
  getSegmentPerformance: (segmentId: string) => SegmentPerformance | undefined;
  compareSegments: (segmentIds: string[]) => any;
  
  // Templates
  loadTemplate: (templateId: string) => VisualSegment;
  saveAsTemplate: (segmentId: string, templateName: string) => void;
  
  // ==================== AUTOMATED WORKFLOWS ====================
  
  // Workflow Management
  createWorkflow: (workflow: Omit<AutomatedWorkflow, 'id' | 'createdAt'>) => string;
  updateWorkflow: (workflowId: string, updates: Partial<AutomatedWorkflow>) => void;
  deleteWorkflow: (workflowId: string) => void;
  duplicateWorkflow: (workflowId: string) => string;
  
  // Workflow Execution
  activateWorkflow: (workflowId: string) => void;
  deactivateWorkflow: (workflowId: string) => void;
  executeWorkflow: (workflowId: string, customerId?: string) => Promise<void>;
  testWorkflow: (workflowId: string, testData: any) => Promise<any>;
  
  // Node Management
  addNode: (workflowId: string, node: Omit<WorkflowNode, 'id'>) => void;
  updateNode: (workflowId: string, nodeId: string, updates: Partial<WorkflowNode>) => void;
  removeNode: (workflowId: string, nodeId: string) => void;
  connectNodes: (workflowId: string, fromNodeId: string, toNodeId: string) => void;
  
  // ==================== MULTI-LOCATION ====================
  
  // Location Hierarchy
  addLocation: (location: Omit<LocationHierarchy, 'id'>) => string;
  updateLocation: (locationId: string, updates: Partial<LocationHierarchy>) => void;
  deleteLocation: (locationId: string) => void;
  getLocationHierarchy: (rootId: string) => LocationHierarchy[];
  
  // Permissions
  updateRolePermissions: (locationId: string, role: UserRole, permissions: Partial<RolePermission['permissions']>) => void;
  checkPermission: (locationId: string, role: UserRole, permission: keyof RolePermission['permissions']) => boolean;
  
  // Performance Comparison
  getLocationPerformance: (locationId: string) => LocationPerformance | undefined;
  compareLocations: (locationIds: string[]) => LocationPerformance[];
  rankLocations: (level: LocationLevel) => LocationPerformance[];
  
  // Campaign Distribution
  deployCampaignToLocations: (campaignId: string, locationIds: string[]) => void;
  
  // ==================== REVENUE DASHBOARD ====================
  
  // Live Transactions
  addTransaction: (transaction: LiveTransaction) => void;
  getLiveTransactions: (limit: number) => LiveTransaction[];
  
  // Revenue Breakdown
  calculateRevenueBreakdown: (startDate: number, endDate: number) => RevenueBreakdown[];
  getRevenueByStream: (stream: RevenueStream) => number;
  
  // Projections
  generateProjections: (days: number) => RevenueProjection[];
  updateProjection: (date: number, actualRevenue: number) => void;
  
  // Anomaly Detection
  detectAnomalies: (transactions: LiveTransaction[]) => RevenueAnomaly[];
  dismissAnomaly: (anomalyId: string) => void;
  
  // ==================== WHITE-LABEL ====================
  
  // Brand Customization
  setBrandCustomization: (customization: BrandCustomization) => void;
  updateBrandColors: (primaryColor: string, secondaryColor: string) => void;
  uploadLogo: (logoUrl: string) => void;
  setCustomDomain: (domain: string) => void;
  
  // Feature Toggles
  toggleFeature: (featureId: string, enabled: boolean) => void;
  getEnabledFeatures: () => FeatureToggle[];
  checkFeatureAccess: (featureId: string) => boolean;
  
  // API Management
  generateAPIKeys: (clientId: string) => APIAccess;
  revokeAPIAccess: (clientId: string) => void;
  updateRateLimit: (clientId: string, rateLimit: number) => void;
  
  // ==================== ADVANCED REPORTING ====================
  
  // Report Building
  createReport: (report: Omit<CustomReport, 'id' | 'createdAt'>) => string;
  updateReport: (reportId: string, updates: Partial<CustomReport>) => void;
  deleteReport: (reportId: string) => void;
  
  // Report Execution
  runReport: (reportId: string) => Promise<any>;
  scheduleReport: (reportId: string, schedule: CustomReport['schedule']) => void;
  exportReport: (reportId: string, format: ExportFormat) => Promise<Blob>;
  
  // Data Visualization
  getChartData: (reportId: string) => any;
  updateVisualization: (reportId: string, visualization: CustomReport['visualization']) => void;
  
  // Utilities
  initializeDefaultData: () => void;
  exportAllData: () => any;
}

export const useAdvancedFeaturesStore = create<AdvancedFeaturesStore>((set, get) => ({
  // ==================== INITIAL STATE ====================
  
  segments: [],
  criteriaTemplates: [],
  segmentPerformance: new Map(),
  workflows: [],
  workflowExecutions: new Map(),
  locations: [],
  locationPerformance: new Map(),
  currentUserRole: 'owner',
  liveTransactions: [],
  revenueBreakdown: [],
  revenueProjections: [],
  revenueAnomalies: [],
  brandCustomization: null,
  featureToggles: [],
  apiAccess: null,
  customReports: [],
  reportData: new Map(),

  // ==================== SEGMENT BUILDER IMPLEMENTATION ====================
  
  createSegment: (segment) => {
    const id = `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSegment: VisualSegment = {
      ...segment,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set((state) => ({
      segments: [...state.segments, newSegment],
    }));
    
    return id;
  },

  updateSegment: (segmentId, updates) => {
    set((state) => ({
      segments: state.segments.map((seg) =>
        seg.id === segmentId
          ? { ...seg, ...updates, updatedAt: Date.now() }
          : seg
      ),
    }));
  },

  deleteSegment: (segmentId) => {
    set((state) => ({
      segments: state.segments.filter((seg) => seg.id !== segmentId),
    }));
  },

  duplicateSegment: (segmentId) => {
    const segment = get().segments.find((seg) => seg.id === segmentId);
    if (!segment) return '';
    
    const id = `seg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: VisualSegment = {
      ...segment,
      id,
      name: `${segment.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    set((state) => ({
      segments: [...state.segments, duplicated],
    }));
    
    return id;
  },

  addCriterion: (segmentId, criterion) => {
    const criterionId = `crit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newCriterion: VisualCriterion = {
      ...criterion,
      id: criterionId,
    };
    
    set((state) => ({
      segments: state.segments.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              criteria: [...seg.criteria, newCriterion],
              updatedAt: Date.now(),
            }
          : seg
      ),
    }));
  },

  updateCriterion: (segmentId, criterionId, updates) => {
    set((state) => ({
      segments: state.segments.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              criteria: seg.criteria.map((crit) =>
                crit.id === criterionId ? { ...crit, ...updates } : crit
              ),
              updatedAt: Date.now(),
            }
          : seg
      ),
    }));
  },

  removeCriterion: (segmentId, criterionId) => {
    set((state) => ({
      segments: state.segments.map((seg) =>
        seg.id === segmentId
          ? {
              ...seg,
              criteria: seg.criteria.filter((crit) => crit.id !== criterionId),
              updatedAt: Date.now(),
            }
          : seg
      ),
    }));
  },

  previewSegment: (criteria) => {
    // In real implementation, would query customer database
    // For now, return mock preview
    const mockCustomers: CustomerPreview[] = [
      {
        id: 'cust_1',
        name: 'John Doe',
        email: 'john@example.com',
        visitCount: 25,
        totalSpend: 5000,
        lastVisit: Date.now() - 86400000 * 2,
        loyaltyStatus: 'Gold',
        matchScore: 0.95,
      },
      {
        id: 'cust_2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        visitCount: 18,
        totalSpend: 3500,
        lastVisit: Date.now() - 86400000 * 5,
        loyaltyStatus: 'Silver',
        matchScore: 0.87,
      },
    ];
    
    return mockCustomers;
  },

  calculateSegmentSize: (criteria) => {
    // Simulate segment size calculation
    return Math.floor(Math.random() * 1000) + 100;
  },

  getSegmentPerformance: (segmentId) => {
    return get().segmentPerformance.get(segmentId);
  },

  compareSegments: (segmentIds) => {
    const segments = get().segments.filter((seg) => segmentIds.includes(seg.id));
    return segments.map((seg) => ({
      id: seg.id,
      name: seg.name,
      customerCount: seg.customerCount,
      performance: get().segmentPerformance.get(seg.id),
    }));
  },

  loadTemplate: (templateId) => {
    // Return predefined template
    const templates: Record<string, Partial<VisualSegment>> = {
      vip: {
        name: 'VIP Customers',
        description: 'High-value customers with frequent visits',
        criteria: [
          {
            id: 'c1',
            field: 'visitFrequency',
            operator: 'greaterThan',
            value: 10,
            visualType: 'slider',
            group: 'AND',
            label: 'Visits per month',
          },
          {
            id: 'c2',
            field: 'averageSpend',
            operator: 'greaterThan',
            value: 500,
            visualType: 'slider',
            group: 'AND',
            label: 'Average spend',
          },
        ],
        color: '#FFD700',
        icon: 'star',
      },
    };
    
    return templates[templateId] as VisualSegment;
  },

  saveAsTemplate: (segmentId, templateName) => {
    const segment = get().segments.find((seg) => seg.id === segmentId);
    if (!segment) return;
    
    // Save segment as template (would persist to database)
    console.log('Saved template:', templateName, segment);
  },

  // ==================== WORKFLOW IMPLEMENTATION ====================
  
  createWorkflow: (workflow) => {
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newWorkflow: AutomatedWorkflow = {
      ...workflow,
      id,
      createdAt: Date.now(),
    };
    
    set((state) => ({
      workflows: [...state.workflows, newWorkflow],
    }));
    
    return id;
  },

  updateWorkflow: (workflowId, updates) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId ? { ...wf, ...updates } : wf
      ),
    }));
  },

  deleteWorkflow: (workflowId) => {
    set((state) => ({
      workflows: state.workflows.filter((wf) => wf.id !== workflowId),
    }));
  },

  duplicateWorkflow: (workflowId) => {
    const workflow = get().workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return '';
    
    const id = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const duplicated: AutomatedWorkflow = {
      ...workflow,
      id,
      name: `${workflow.name} (Copy)`,
      createdAt: Date.now(),
      isDraft: true,
      isActive: false,
    };
    
    set((state) => ({
      workflows: [...state.workflows, duplicated],
    }));
    
    return id;
  },

  activateWorkflow: (workflowId) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId ? { ...wf, isActive: true, isDraft: false } : wf
      ),
    }));
  },

  deactivateWorkflow: (workflowId) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId ? { ...wf, isActive: false } : wf
      ),
    }));
  },

  executeWorkflow: async (workflowId, customerId) => {
    const workflow = get().workflows.find((wf) => wf.id === workflowId);
    if (!workflow || !workflow.isActive) return;
    
    // Simulate workflow execution
    console.log('Executing workflow:', workflow.name, 'for customer:', customerId);
    
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              lastRun: Date.now(),
              totalExecutions: wf.totalExecutions + 1,
            }
          : wf
      ),
    }));
  },

  testWorkflow: async (workflowId, testData) => {
    const workflow = get().workflows.find((wf) => wf.id === workflowId);
    if (!workflow) return { success: false, error: 'Workflow not found' };
    
    // Simulate test execution
    return {
      success: true,
      executionTime: 1500,
      stepsExecuted: workflow.nodes.length,
      testResults: {
        customersMatched: 5,
        actionsTriggered: 3,
        errors: [],
      },
    };
  },

  addNode: (workflowId, node) => {
    const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newNode: WorkflowNode = {
      ...node,
      id: nodeId,
    };
    
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId
          ? { ...wf, nodes: [...wf.nodes, newNode] }
          : wf
      ),
    }));
  },

  updateNode: (workflowId, nodeId, updates) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              nodes: wf.nodes.map((node) =>
                node.id === nodeId ? { ...node, ...updates } : node
              ),
            }
          : wf
      ),
    }));
  },

  removeNode: (workflowId, nodeId) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId
          ? { ...wf, nodes: wf.nodes.filter((node) => node.id !== nodeId) }
          : wf
      ),
    }));
  },

  connectNodes: (workflowId, fromNodeId, toNodeId) => {
    set((state) => ({
      workflows: state.workflows.map((wf) =>
        wf.id === workflowId
          ? {
              ...wf,
              nodes: wf.nodes.map((node) =>
                node.id === fromNodeId
                  ? { ...node, connections: [...node.connections, toNodeId] }
                  : node
              ),
            }
          : wf
      ),
    }));
  },

  // ==================== MULTI-LOCATION IMPLEMENTATION ====================
  
  addLocation: (location) => {
    const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newLocation: LocationHierarchy = {
      ...location,
      id,
    };
    
    set((state) => ({
      locations: [...state.locations, newLocation],
    }));
    
    return id;
  },

  updateLocation: (locationId, updates) => {
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === locationId ? { ...loc, ...updates } : loc
      ),
    }));
  },

  deleteLocation: (locationId) => {
    set((state) => ({
      locations: state.locations.filter((loc) => loc.id !== locationId),
    }));
  },

  getLocationHierarchy: (rootId) => {
    const state = get();
    const buildHierarchy = (id: string): LocationHierarchy[] => {
      const location = state.locations.find((loc) => loc.id === id);
      if (!location) return [];
      
      const children = location.children
        .map((childId) => buildHierarchy(childId))
        .flat();
      
      return [location, ...children];
    };
    
    return buildHierarchy(rootId);
  },

  updateRolePermissions: (locationId, role, permissions) => {
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === locationId
          ? {
              ...loc,
              permissions: loc.permissions.map((perm) =>
                perm.role === role
                  ? {
                      ...perm,
                      permissions: { ...perm.permissions, ...permissions },
                    }
                  : perm
              ),
            }
          : loc
      ),
    }));
  },

  checkPermission: (locationId, role, permission) => {
    const location = get().locations.find((loc) => loc.id === locationId);
    if (!location) return false;
    
    const rolePermission = location.permissions.find((perm) => perm.role === role);
    return rolePermission?.permissions[permission] || false;
  },

  getLocationPerformance: (locationId) => {
    return get().locationPerformance.get(locationId);
  },

  compareLocations: (locationIds) => {
    const performances: LocationPerformance[] = [];
    locationIds.forEach((id) => {
      const perf = get().locationPerformance.get(id);
      if (perf) performances.push(perf);
    });
    return performances.sort((a, b) => b.revenue - a.revenue);
  },

  rankLocations: (level) => {
    const locations = get().locations.filter((loc) => loc.level === level);
    const performances: LocationPerformance[] = [];
    
    locations.forEach((loc) => {
      const perf = get().locationPerformance.get(loc.id);
      if (perf) performances.push(perf);
    });
    
    return performances.sort((a, b) => b.revenue - a.revenue);
  },

  deployCampaignToLocations: (campaignId, locationIds) => {
    // Deploy campaign to multiple locations
    console.log('Deploying campaign', campaignId, 'to locations:', locationIds);
  },

  // ==================== REVENUE DASHBOARD IMPLEMENTATION ====================
  
  addTransaction: (transaction) => {
    set((state) => ({
      liveTransactions: [transaction, ...state.liveTransactions].slice(0, 100),
    }));
  },

  getLiveTransactions: (limit) => {
    return get().liveTransactions.slice(0, limit);
  },

  calculateRevenueBreakdown: (startDate, endDate) => {
    const transactions = get().liveTransactions.filter(
      (t) => t.timestamp >= startDate && t.timestamp <= endDate
    );
    
    const streams: Record<RevenueStream, RevenueBreakdown> = {
      cpt: { stream: 'cpt', amount: 0, percentage: 0, transactionCount: 0, averageValue: 0, growth: 0 },
      cpa: { stream: 'cpa', amount: 0, percentage: 0, transactionCount: 0, averageValue: 0, growth: 0 },
      subscription: { stream: 'subscription', amount: 0, percentage: 0, transactionCount: 0, averageValue: 0, growth: 0 },
      premium_features: { stream: 'premium_features', amount: 0, percentage: 0, transactionCount: 0, averageValue: 0, growth: 0 },
      marketplace: { stream: 'marketplace', amount: 0, percentage: 0, transactionCount: 0, averageValue: 0, growth: 0 },
    };
    
    let totalRevenue = 0;
    
    transactions.forEach((t) => {
      streams[t.revenueStream].amount += t.amount;
      streams[t.revenueStream].transactionCount++;
      totalRevenue += t.amount;
    });
    
    Object.values(streams).forEach((stream) => {
      stream.percentage = totalRevenue > 0 ? (stream.amount / totalRevenue) * 100 : 0;
      stream.averageValue = stream.transactionCount > 0 ? stream.amount / stream.transactionCount : 0;
    });
    
    set({ revenueBreakdown: Object.values(streams) });
    
    return Object.values(streams);
  },

  getRevenueByStream: (stream) => {
    const breakdown = get().revenueBreakdown.find((b) => b.stream === stream);
    return breakdown?.amount || 0;
  },

  generateProjections: (days) => {
    const projections: RevenueProjection[] = [];
    const currentRevenue = get().liveTransactions.reduce((sum, t) => sum + t.amount, 0);
    const dailyAverage = currentRevenue / 30; // Assume 30 days of data
    
    for (let i = 1; i <= days; i++) {
      const date = Date.now() + i * 86400000;
      const randomFactor = 0.9 + Math.random() * 0.2; // ±10% variance
      const projected = dailyAverage * randomFactor;
      
      projections.push({
        date,
        projected,
        confidence: 0.85 - (i / days) * 0.2, // Confidence decreases over time
        factors: ['Historical average', 'Seasonal trends', 'Campaign schedules'],
      });
    }
    
    set({ revenueProjections: projections });
    
    return projections;
  },

  updateProjection: (date, actualRevenue) => {
    set((state) => ({
      revenueProjections: state.revenueProjections.map((proj) =>
        proj.date === date ? { ...proj, actual: actualRevenue } : proj
      ),
    }));
  },

  detectAnomalies: (transactions) => {
    // Simple anomaly detection based on z-score
    const amounts = transactions.map((t) => t.amount);
    const mean = amounts.reduce((sum, a) => sum + a, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, a) => sum + Math.pow(a - mean, 2), 0) / amounts.length
    );
    
    const anomalies: RevenueAnomaly[] = [];
    
    transactions.forEach((t) => {
      const zScore = Math.abs((t.amount - mean) / stdDev);
      
      if (zScore > 2.5) {
        anomalies.push({
          id: `anom_${t.id}`,
          timestamp: t.timestamp,
          type: t.amount > mean ? 'spike' : 'drop',
          severity: zScore > 3.5 ? 'high' : zScore > 3 ? 'medium' : 'low',
          description: `Unusual ${t.revenueStream} transaction`,
          expectedValue: mean,
          actualValue: t.amount,
          deviation: ((t.amount - mean) / mean) * 100,
          possibleCauses: ['Campaign success', 'Data error', 'External event'],
        });
      }
    });
    
    set({ revenueAnomalies: anomalies });
    
    return anomalies;
  },

  dismissAnomaly: (anomalyId) => {
    set((state) => ({
      revenueAnomalies: state.revenueAnomalies.filter((a) => a.id !== anomalyId),
    }));
  },

  // ==================== WHITE-LABEL IMPLEMENTATION ====================
  
  setBrandCustomization: (customization) => {
    set({ brandCustomization: customization });
  },

  updateBrandColors: (primaryColor, secondaryColor) => {
    set((state) => ({
      brandCustomization: state.brandCustomization
        ? { ...state.brandCustomization, primaryColor, secondaryColor }
        : null,
    }));
  },

  uploadLogo: (logoUrl) => {
    set((state) => ({
      brandCustomization: state.brandCustomization
        ? { ...state.brandCustomization, logoUrl }
        : null,
    }));
  },

  setCustomDomain: (domain) => {
    set((state) => ({
      brandCustomization: state.brandCustomization
        ? { ...state.brandCustomization, customDomain: domain }
        : null,
    }));
  },

  toggleFeature: (featureId, enabled) => {
    set((state) => ({
      featureToggles: state.featureToggles.map((ft) =>
        ft.featureId === featureId ? { ...ft, enabled } : ft
      ),
    }));
  },

  getEnabledFeatures: () => {
    return get().featureToggles.filter((ft) => ft.enabled);
  },

  checkFeatureAccess: (featureId) => {
    const feature = get().featureToggles.find((ft) => ft.featureId === featureId);
    return feature?.enabled || false;
  },

  generateAPIKeys: (clientId) => {
    const apiAccess: APIAccess = {
      clientId,
      apiKey: `uma_${Math.random().toString(36).substr(2, 32)}`,
      secretKey: Math.random().toString(36).substr(2, 48),
      rateLimit: 1000,
      endpoints: ['/api/customers', '/api/campaigns', '/api/analytics'],
      isActive: true,
      createdAt: Date.now(),
      totalCalls: 0,
    };
    
    set({ apiAccess });
    
    return apiAccess;
  },

  revokeAPIAccess: (clientId) => {
    set((state) => ({
      apiAccess: state.apiAccess?.clientId === clientId
        ? { ...state.apiAccess, isActive: false }
        : state.apiAccess,
    }));
  },

  updateRateLimit: (clientId, rateLimit) => {
    set((state) => ({
      apiAccess: state.apiAccess?.clientId === clientId
        ? { ...state.apiAccess, rateLimit }
        : state.apiAccess,
    }));
  },

  // ==================== ADVANCED REPORTING IMPLEMENTATION ====================
  
  createReport: (report) => {
    const id = `rpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReport: CustomReport = {
      ...report,
      id,
      createdAt: Date.now(),
    };
    
    set((state) => ({
      customReports: [...state.customReports, newReport],
    }));
    
    return id;
  },

  updateReport: (reportId, updates) => {
    set((state) => ({
      customReports: state.customReports.map((rpt) =>
        rpt.id === reportId ? { ...rpt, ...updates } : rpt
      ),
    }));
  },

  deleteReport: (reportId) => {
    set((state) => ({
      customReports: state.customReports.filter((rpt) => rpt.id !== reportId),
    }));
  },

  runReport: async (reportId) => {
    const report = get().customReports.find((rpt) => rpt.id === reportId);
    if (!report) return null;
    
    // Simulate report execution
    const data = {
      reportId,
      executedAt: Date.now(),
      data: {
        metrics: report.metrics.map((m) => ({
          label: m.label,
          value: Math.random() * 10000,
        })),
        dimensions: report.dimensions.map((d) => ({
          label: d.label,
          values: Array(5).fill(0).map(() => ({
            label: `Item ${Math.random().toString(36).substr(2, 5)}`,
            value: Math.random() * 1000,
          })),
        })),
      },
    };
    
    set((state) => {
      const newReportData = new Map(state.reportData);
      newReportData.set(reportId, data);
      return { reportData: newReportData };
    });
    
    return data;
  },

  scheduleReport: (reportId, schedule) => {
    set((state) => ({
      customReports: state.customReports.map((rpt) =>
        rpt.id === reportId ? { ...rpt, schedule } : rpt
      ),
    }));
  },

  exportReport: async (reportId, format) => {
    const data = get().reportData.get(reportId);
    if (!data) throw new Error('Report data not found');
    
    // Simulate export - return as Blob-compatible object
    const content = JSON.stringify(data, null, 2);
    // In React Native, we return the content directly since Blob may not be available
    return content as any as Blob;
  },

  getChartData: (reportId) => {
    return get().reportData.get(reportId);
  },

  updateVisualization: (reportId, visualization) => {
    set((state) => ({
      customReports: state.customReports.map((rpt) =>
        rpt.id === reportId ? { ...rpt, visualization } : rpt
      ),
    }));
  },

  // ==================== UTILITIES ====================
  
  initializeDefaultData: () => {
    // Initialize with default templates, workflows, etc.
    console.log('Initializing default data...');
  },

  exportAllData: () => {
    const state = get();
    return {
      segments: state.segments,
      workflows: state.workflows,
      locations: state.locations,
      reports: state.customReports,
      exportedAt: Date.now(),
    };
  },
}));
