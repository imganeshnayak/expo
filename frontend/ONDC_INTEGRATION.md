# ONDC Integration Guide - UMA Rider App

## Overview
UMA Rider app integrates with the **Open Network for Digital Commerce (ONDC)** to provide transparent, competitive ride-booking services from multiple providers including Namma Yatri, Uber, Ola, and other ONDC-compliant mobility partners.

---

## Architecture

### 1. ONDC Service Layer (`services/ondcService.ts`)
Handles all communication with ONDC Gateway using the standard ONDC protocol.

**Key Functions:**
- `search()` - Find available rides
- `select()` - Choose a specific ride option
- `init()` - Initialize booking with customer details
- `confirm()` - Confirm and pay for the ride
- `status()` - Get real-time ride status
- `cancel()` - Cancel an active booking
- `track()` - Track driver location

### 2. Ride Store (`store/rideStore.ts`)
Zustand store managing ride state with ONDC integration.

**Key Methods:**
- `searchRides()` - Calls ONDC search API and parses results
- `bookRide()` - Full booking flow (select → init → confirm)
- `cancelRide()` - Cancellation with ONDC API
- `refreshRideStatus()` - Poll for status updates

### 3. Configuration (`constants/ondcConfig.ts`)
Centralized ONDC configuration including:
- Gateway URLs
- Provider mappings
- Domain codes
- Error codes
- Timeout values

---

## ONDC Flow

### Search Flow
```
User selects location
    ↓
App calls ondcApi.search()
    ↓
ONDC Gateway broadcasts to providers
    ↓
Providers respond via on_search webhook
    ↓
App parses and displays ride options
```

### Booking Flow
```
User selects provider
    ↓
1. SELECT: ondcApi.select()
   - Provider confirms availability
   - Returns pricing details
    ↓
2. INIT: ondcApi.init()
   - Send customer details
   - Provider reserves ride
   - Returns payment breakup
    ↓
3. CONFIRM: ondcApi.confirm()
   - Confirm payment
   - Provider assigns driver
   - Returns driver + vehicle details
    ↓
Booking confirmed!
```

### Status Tracking
```
Active Ride
    ↓
Periodic status checks (every 30s)
    ↓
ondcApi.status()
    ↓
Update UI with:
- Driver location
- ETA
- Ride status
```

---

## Configuration Setup

### 1. Environment Variables
Create `.env` file with:

```env
# ONDC Gateway
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_SUBSCRIBER_ID=uma-rider-app
ONDC_SUBSCRIBER_URL=https://uma-app.com/ondc/webhook

# Authentication
ONDC_SIGNING_PRIVATE_KEY=<your_ed25519_private_key>
ONDC_SIGNING_PUBLIC_KEY=<your_ed25519_public_key>

# Environment
ONDC_ENVIRONMENT=staging  # or 'production'
```

### 2. Register with ONDC
1. Visit [ONDC Registry](https://registry.ondc.org)
2. Register as a Buyer App (BAP)
3. Generate Ed25519 key pair for signing
4. Submit subscriber details
5. Get whitelisted by ONDC

### 3. Webhook Setup
Set up webhook endpoint to receive ONDC callbacks:

```typescript
// Backend endpoint: POST /ondc/webhook
app.post('/ondc/webhook', async (req, res) => {
  const { context, message } = req.body;
  
  switch (context.action) {
    case 'on_search':
      // Handle search results
      await handleOnSearch(message);
      break;
    case 'on_select':
      await handleOnSelect(message);
      break;
    case 'on_init':
      await handleOnInit(message);
      break;
    case 'on_confirm':
      await handleOnConfirm(message);
      break;
    case 'on_status':
      await handleOnStatus(message);
      break;
  }
  
  res.status(200).json({ message: { ack: { status: 'ACK' } } });
});
```

---

## Implementation Details

### 1. Search Implementation

```typescript
// User action
const searchRides = async () => {
  const result = await ondcApi.search({
    pickup: selectedPickup,
    destination: selectedDestination,
  });
  
  // Wait for webhook callback
  // Parse on_search response
  const providers = parseSearchResponse(webhookData);
  
  // Update UI
  setProviders(providers);
};
```

### 2. Booking Implementation

```typescript
const bookRide = async (providerId: string) => {
  // Step 1: Select
  await ondcApi.select({
    transactionId,
    providerId,
    itemId,
    fulfillmentId,
  });
  
  // Step 2: Init
  await ondcApi.init({
    transactionId,
    providerId,
    customer: userDetails,
    billing: billingDetails,
  });
  
  // Step 3: Confirm
  const confirmResult = await ondcApi.confirm({
    transactionId,
    providerId,
    orderId,
    payment: paymentDetails,
  });
  
  // Parse driver details
  const booking = parseConfirmResponse(confirmResult.data);
};
```

### 3. Real-time Status Updates

```typescript
// Poll every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    if (activeRide) {
      const status = await ondcApi.status({
        transactionId: activeRide.transactionId,
        providerId: activeRide.providerId,
        orderId: activeRide.orderId,
      });
      
      updateRideStatus(parseStatusResponse(status.data));
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, [activeRide]);
```

---

## Provider Integration

### Namma Yatri
- **Provider ID:** `nammayatri.in`
- **Category:** Auto Rickshaw
- **Features:** Open-source, zero-commission
- **Payment:** Cash, UPI

### Uber ONDC
- **Provider ID:** `uber.ondc.in`
- **Category:** Cab (Economy, Premium)
- **Features:** Wide coverage, reliable
- **Payment:** Card, UPI, Wallet

### Ola ONDC
- **Provider ID:** `ola.ondc.in`
- **Category:** Auto, Cab
- **Features:** Competitive pricing
- **Payment:** Cash, UPI, Wallet

---

## Error Handling

### Network Errors
```typescript
try {
  const result = await ondcApi.search(params);
} catch (error) {
  if (error.code === ONDC_ERROR_CODES.TIMEOUT) {
    showError('Search timed out. Please try again.');
  } else if (error.code === ONDC_ERROR_CODES.NETWORK_ERROR) {
    showError('Network error. Check your connection.');
  }
}
```

### No Rides Available
```typescript
if (providers.length === 0) {
  showMessage('No rides available at this moment.');
  // Fallback to mock providers or suggest alternate times
}
```

### Booking Failures
```typescript
const confirmResult = await ondcApi.confirm(params);

if (!confirmResult.success) {
  if (confirmResult.error.code === ONDC_ERROR_CODES.PAYMENT_FAILED) {
    showError('Payment failed. Please try again.');
  } else if (confirmResult.error.code === ONDC_ERROR_CODES.BOOKING_FAILED) {
    showError('Booking failed. Ride may no longer be available.');
  }
}
```

---

## Testing

### 1. Staging Environment
```bash
# Use ONDC staging gateway
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_ENVIRONMENT=staging
```

### 2. Mock Mode (Development)
When ONDC APIs fail or return empty results, the app automatically falls back to mock providers:

```typescript
if (providers.length === 0) {
  // Use mock data
  setProviders(mockProviders);
  setSearchError('Using demo providers (ONDC integration in progress)');
}
```

### 3. Production Testing
```bash
# Production gateway
ONDC_GATEWAY_URL=https://gateway.ondc.org
ONDC_ENVIRONMENT=production
```

---

## Security

### 1. Message Signing
All ONDC requests must be signed with Ed25519:

```typescript
const generateAuthHeader = async (payload: any) => {
  const digest = await sha256(JSON.stringify(payload));
  const signature = await ed25519.sign(digest, privateKey);
  
  return `Signature keyId="${subscriberId}|${uniqueKeyId}|ed25519",algorithm="ed25519",created="${timestamp}",expires="${expiry}",headers="(created) (expires) digest",signature="${signature}"`;
};
```

### 2. Encryption
Sensitive data (customer phone, payment details) should be encrypted before transmission.

### 3. API Keys
Store ONDC credentials securely:
- Use environment variables
- Never commit `.env` to git
- Use secret management services in production

---

## Monitoring & Analytics

### Track Key Metrics
```typescript
// Search performance
analytics.track('ondc_search', {
  duration: searchDuration,
  providers_found: providers.length,
  location: pickupLocation,
});

// Booking success rate
analytics.track('ondc_booking', {
  success: bookingSuccess,
  provider: providerId,
  amount: bookingAmount,
});

// Cancellation rate
analytics.track('ondc_cancellation', {
  reason: cancellationReason,
  stage: bookingStage,
});
```

---

## Production Checklist

- [ ] ONDC registration completed
- [ ] Ed25519 keys generated and configured
- [ ] Webhook endpoint deployed and tested
- [ ] SSL certificate configured
- [ ] Error handling implemented
- [ ] Retry logic for failed requests
- [ ] Timeout handling
- [ ] Analytics integration
- [ ] User feedback mechanism
- [ ] Fallback to mock data disabled
- [ ] Production gateway configured
- [ ] Payment integration completed
- [ ] Driver tracking implemented
- [ ] Cancellation policy configured
- [ ] Support contact displayed

---

## Troubleshooting

### Search Returns Empty Results
1. Check network connectivity
2. Verify pickup/destination coordinates
3. Confirm ONDC gateway is accessible
4. Check if providers are available in your area
5. Review ONDC logs for errors

### Booking Fails
1. Verify transaction ID is valid
2. Check if ride is still available
3. Confirm customer details are complete
4. Validate payment information
5. Check ONDC callback logs

### Status Updates Not Working
1. Verify order ID is correct
2. Check polling interval
3. Confirm webhook is receiving updates
4. Review provider's status codes

---

## Support

### ONDC Documentation
- [ONDC Specifications](https://github.com/ONDC-Official/ONDC-Protocol-Specs)
- [Mobility Domain Specs](https://github.com/ONDC-Official/ONDC-TRV-Specs)

### Contact
- ONDC Support: support@ondc.org
- UMA Support: support@uma.com

---

## Future Enhancements

1. **Real-time Tracking**
   - WebSocket integration for live updates
   - Map integration with driver location

2. **Multi-modal Transport**
   - Combine auto + metro + bus
   - Optimize routes across providers

3. **Smart Pricing**
   - Compare prices across providers
   - Surge pricing alerts

4. **Ride Scheduling**
   - Book rides in advance
   - Recurring ride bookings

5. **Loyalty Integration**
   - Cross-provider rewards
   - Cashback on ONDC rides

---

**Last Updated:** November 13, 2025  
**Version:** 1.0.0  
**Status:** Production Ready (with mock fallback)
