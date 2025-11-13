/**
 * Bridge Layer - Data Synchronization between Rider and Business Apps
 * 
 * This module handles cross-app communication and data sync:
 * - Merchant creates campaign → Appears in user app
 * - User scans QR → Merchant sees analytics
 * - Real-time updates between apps
 */

import { EventEmitter } from 'events';

// Event types for cross-app communication
export enum BridgeEvent {
  // Campaign events
  CAMPAIGN_CREATED = 'campaign:created',
  CAMPAIGN_UPDATED = 'campaign:updated',
  CAMPAIGN_DELETED = 'campaign:deleted',

  // Customer events
  CUSTOMER_STAMP_EARNED = 'customer:stamp_earned',
  CUSTOMER_REWARD_REDEEMED = 'customer:reward_redeemed',
  CUSTOMER_VISIT = 'customer:visit',

  // Deal events
  DEAL_PUBLISHED = 'deal:published',
  DEAL_CLAIMED = 'deal:claimed',
  DEAL_USED = 'deal:used',

  // Analytics events
  ANALYTICS_UPDATE = 'analytics:update',
}

export interface BridgeData {
  eventType: BridgeEvent;
  merchantId?: string;
  userId?: string;
  data: any;
  timestamp: number;
}

class UMABridge extends EventEmitter {
  private static instance: UMABridge;
  private syncQueue: BridgeData[] = [];
  private isConnected: boolean = false;

  private constructor() {
    super();
    this.initialize();
  }

  static getInstance(): UMABridge {
    if (!UMABridge.instance) {
      UMABridge.instance = new UMABridge();
    }
    return UMABridge.instance;
  }

  private initialize() {
    // Initialize WebSocket or polling mechanism for real-time sync
    // This would connect to your backend sync service
    console.log('[UMA Bridge] Initializing cross-app sync...');
    this.isConnected = true;
  }

  /**
   * Emit event from Business App to Rider App
   */
  emitToRiderApp(event: BridgeEvent, data: any, merchantId: string) {
    const bridgeData: BridgeData = {
      eventType: event,
      merchantId,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(bridgeData);
    this.emit(event, bridgeData);

    // Send to backend for persistence and cross-app delivery
    this.syncToBackend(bridgeData);
  }

  /**
   * Emit event from Rider App to Business App
   */
  emitToBusinessApp(event: BridgeEvent, data: any, userId: string, merchantId?: string) {
    const bridgeData: BridgeData = {
      eventType: event,
      userId,
      merchantId,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(bridgeData);
    this.emit(event, bridgeData);

    // Send to backend for persistence and cross-app delivery
    this.syncToBackend(bridgeData);
  }

  /**
   * Subscribe to events from other app
   */
  subscribe(event: BridgeEvent, callback: (data: BridgeData) => void) {
    this.on(event, callback);
    return () => this.off(event, callback);
  }

  /**
   * Sync data to backend
   */
  private async syncToBackend(data: BridgeData) {
    try {
      // This would call your backend API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/bridge/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.error('[UMA Bridge] Sync failed:', await response.text());
      }
    } catch (error) {
      console.error('[UMA Bridge] Sync error:', error);
      // Keep in queue for retry
    }
  }

  /**
   * Get pending sync queue
   */
  getSyncQueue(): BridgeData[] {
    return [...this.syncQueue];
  }

  /**
   * Clear processed sync items
   */
  clearSyncQueue() {
    this.syncQueue = [];
  }

  /**
   * Check connection status
   */
  isConnectedToBackend(): boolean {
    return this.isConnected;
  }
}

export const bridge = UMABridge.getInstance();

// Helper functions for common use cases

/**
 * Business App: Notify when merchant creates a new campaign
 */
export function notifyCampaignCreated(merchantId: string, campaign: any) {
  bridge.emitToRiderApp(BridgeEvent.CAMPAIGN_CREATED, campaign, merchantId);
}

/**
 * Business App: Notify when merchant publishes a deal
 */
export function notifyDealPublished(merchantId: string, deal: any) {
  bridge.emitToRiderApp(BridgeEvent.DEAL_PUBLISHED, deal, merchantId);
}

/**
 * Rider App: Notify when user earns a stamp
 */
export function notifyStampEarned(userId: string, merchantId: string, stampData: any) {
  bridge.emitToBusinessApp(BridgeEvent.CUSTOMER_STAMP_EARNED, stampData, userId, merchantId);
}

/**
 * Rider App: Notify when user claims a deal
 */
export function notifyDealClaimed(userId: string, merchantId: string, dealData: any) {
  bridge.emitToBusinessApp(BridgeEvent.DEAL_CLAIMED, dealData, userId, merchantId);
}

/**
 * Rider App: Notify when user visits merchant
 */
export function notifyCustomerVisit(userId: string, merchantId: string, visitData: any) {
  bridge.emitToBusinessApp(BridgeEvent.CUSTOMER_VISIT, visitData, userId, merchantId);
}

/**
 * Subscribe to real-time campaign updates (for Rider App)
 */
export function subscribeToCampaignUpdates(callback: (campaign: any) => void) {
  return bridge.subscribe(BridgeEvent.CAMPAIGN_CREATED, (data) => {
    callback(data.data);
  });
}

/**
 * Subscribe to customer activity (for Business App)
 */
export function subscribeToCustomerActivity(callback: (activity: any) => void) {
  const events = [
    BridgeEvent.CUSTOMER_STAMP_EARNED,
    BridgeEvent.CUSTOMER_REWARD_REDEEMED,
    BridgeEvent.CUSTOMER_VISIT,
    BridgeEvent.DEAL_CLAIMED,
  ];

  const unsubscribers = events.map(event =>
    bridge.subscribe(event, (data) => {
      callback({ event, ...data });
    })
  );

  return () => unsubscribers.forEach(unsub => unsub());
}

export default bridge;
