"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
class ONDCService {
    constructor() {
        this.gatewayUrl = process.env.ONDC_GATEWAY_URL || 'https://staging.gateway.ondc.org/search'; // Default to staging
        this.bapId = process.env.ONDC_BAP_ID || 'uma-bap-id';
        this.bapUri = process.env.ONDC_BAP_URI || 'https://uma-backend.com/api/ondc';
    }
    createContext(action, domain, transactionId) {
        return {
            domain,
            action,
            country: 'IND',
            city: 'std:080', // Default to Bangalore for now
            core_version: '1.1.0',
            bap_id: this.bapId,
            bap_uri: this.bapUri,
            transaction_id: transactionId || (0, uuid_1.v4)(),
            message_id: (0, uuid_1.v4)(),
            timestamp: new Date().toISOString(),
            ttl: 'PT30S',
        };
    }
    search(domain, intent) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.error('[ONDC] Search failed:', error);
                throw error;
            }
        });
    }
    // Placeholder for other actions like select, init, confirm
    callBpp(bppUri, action, domain, message, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const context = this.createContext(action, domain, transactionId);
            const payload = { context, message };
            try {
                console.log(`[ONDC] Sending ${action} request to ${bppUri}`);
                // const response = await axios.post(bppUri, payload);
                // return response.data;
                return { status: 'ACK', context };
            }
            catch (error) {
                console.error(`[ONDC] ${action} failed:`, error);
                throw error;
            }
        });
    }
}
exports.default = new ONDCService();
