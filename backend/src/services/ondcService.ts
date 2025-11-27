import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface ONDCContext {
    domain: string;
    action: string;
    country: string;
    city: string;
    core_version: string;
    bap_id: string;
    bap_uri: string;
    transaction_id: string;
    message_id: string;
    timestamp: string;
    ttl?: string;
}

class ONDCService {
    private gatewayUrl: string;
    private bapId: string;
    private bapUri: string;

    constructor() {
        this.gatewayUrl = process.env.ONDC_GATEWAY_URL || 'https://staging.gateway.ondc.org/search'; // Default to staging
        this.bapId = process.env.ONDC_BAP_ID || 'uma-bap-id';
        this.bapUri = process.env.ONDC_BAP_URI || 'https://uma-backend.com/api/ondc';
    }

    createContext(action: string, domain: string, transactionId?: string): ONDCContext {
        return {
            domain,
            action,
            country: 'IND',
            city: 'std:080', // Default to Bangalore for now
            core_version: '1.1.0',
            bap_id: this.bapId,
            bap_uri: this.bapUri,
            transaction_id: transactionId || uuidv4(),
            message_id: uuidv4(),
            timestamp: new Date().toISOString(),
            ttl: 'PT30S',
        };
    }

    async search(domain: string, intent: any) {
        const context = this.createContext('search', domain);
        const payload = {
            context,
            message: {
                intent,
            },
        };

        try {
            // In a real scenario, we would sign the authorization header here
            const headers = {
                'Content-Type': 'application/json',
                // 'Authorization': await this.signRequest(payload) 
            };

            console.log(`[ONDC] Sending search request to ${this.gatewayUrl}`);
            // For now, we just log the request as we don't have a real gateway connection
            // const response = await axios.post(this.gatewayUrl, payload, { headers });
            // return response.data;

            return { status: 'ACK', context }; // Simulate immediate ACK
        } catch (error) {
            console.error('[ONDC] Search failed:', error);
            throw error;
        }
    }

    // Placeholder for other actions like select, init, confirm
    async callBpp(bppUri: string, action: string, domain: string, message: any, transactionId: string) {
        const context = this.createContext(action, domain, transactionId);
        const payload = { context, message };

        try {
            console.log(`[ONDC] Sending ${action} request to ${bppUri}`);
            // const response = await axios.post(bppUri, payload);
            // return response.data;
            return { status: 'ACK', context };
        } catch (error) {
            console.error(`[ONDC] ${action} failed:`, error);
            throw error;
        }
    }
}

export default new ONDCService();
