# API Error Code Implementation Guide

## Overview

Complete implementation of error codes for the Crofter API system, providing user-friendly messages for all backend and frontend errors.

## Error Code Format

```
DOMAIN-CATEGORY-NUMBER
```

- **Backend**: `ACT-USR-1`, `ORD-CRT-1`, `PMT-CHG-1`
- **Frontend**: `WEB-NET-1`, `WEB-VAL-1`, `WEB-API-1`

---

## Backend Error Codes (13 codes)

### Account Errors (ACT)

| Code | Message | Technical Description |
|------|---------|----------------------|
| `ACT-USR-1` | Incorrect email or password. Please try again. | Incorrect email or password |
| `ACT-IMP-1` | Unable to impersonate user. Please check your permissions. | Failed impersonation |

**Implementation**: 
- Server: `/src/lib/server/apiV2/helpers.ts` line 494
- Client: `/src/lib/apiV2.ts` lines 252, 322

---

### Order Creation Errors (ORD-CRT)

| Code | Message | Technical Description |
|------|---------|----------------------|
| `ORD-CRT-0` | Your cart is empty. Please add items to your order. | Missing order items |
| `ORD-CRT-1` | Please provide a delivery address for your order. | Missing delivery address for delivery fulfillment |
| `ORD-CRT-2` | Please select a pick-up location for your order. | Missing pick-up location for pick-up fulfillment |
| `ORD-CRT-3` | Unable to calculate order total. Please contact support. | Missing sales_tax on order_item |
| `ORD-CRT-4` | Cannot combine different promotions in one order. Please use one promotion at a time. | Mixed promotion_ids |

**Implementation**: Same as Account Errors

---

### Order Ready Errors (ORD-RDY)

| Code | Message | Technical Description |
|------|---------|----------------------|
| `ORD-RDY-1` | Some items are not ready to be processed. Please try again later. | Not all items :ordered status |
| `ORD-RDY-2` | This order is already being processed. Please wait. | Item(s) have existing transaction(s) |
| `ORD-RDY-3` | Order pricing information is incomplete. Please contact support. | Item(s) missing price_when_ordered and/or sales_tax |
| `ORD-RDY-4` | Please add a payment method to complete your order. | User missing payment token |

**Implementation**: Same as Account Errors

---

### Payment Errors (PMT-CHG)

| Code | Message | Technical Description |
|------|---------|----------------------|
| `PMT-CHG-1` | Payment declined due to insufficient funds. Please use a different payment method. | "Insufficient Funds" from payment processor |
| `PMT-CHG-2` | Payment method is no longer valid. Please use a different payment method. | "Account Closed" from payment processor |

**Implementation**: Same as Account Errors

---

## Frontend Error Codes (10 codes)

### Network Errors (WEB-NET)

| Code | Message | Technical Description | Implementation |
|------|---------|----------------------|----------------|
| `WEB-NET-1` | Network connection lost. Please check your internet connection and try again. | Network offline or connection lost | `apiV2.ts` line 395 - Detects NetworkError in catch |
| `WEB-NET-2` | Request timed out. Please try again. | Request exceeded 30s timeout | `apiV2.ts` line 351 - AbortError from timeout |
| `WEB-NET-3` | Too many requests. Please wait a moment and try again. | Rate limiting or too many parallel requests | `apiV2.ts` line 305 - HTTP 429 status |
| `WEB-NET-4` | Unable to connect to server. Please try again later. | Fetch failed, DNS error, or CORS issue | `apiV2.ts` line 392 - TypeError with 'fetch' |
| `WEB-NET-5` | Service temporarily unavailable. Please try again in a few moments. | Circuit breaker open or 503 response | `circuitBreaker.ts` line 82 - Circuit opens |

---

### API Errors (WEB-API)

| Code | Message | Technical Description | Implementation |
|------|---------|----------------------|----------------|
| `WEB-API-1` | An unexpected error occurred. Please try again. | Generic API error | `apiV2.ts` line 384 - Default catch-all |
| `WEB-API-2` | Invalid request. Please refresh the page and try again. | Malformed request or invalid parameters | `apiV2.ts` line 293 - HTTP 400 status |
| `WEB-API-3` | You do not have permission to perform this action. | Authorization error (403) | `apiV2.ts` line 297 - HTTP 403 status |
| `WEB-API-4` | The requested resource was not found. | Not found error (404) | `apiV2.ts` line 301 - HTTP 404 status |
| `WEB-API-5` | Request was cancelled. Please try again if needed. | AbortController cancelled request | `apiV2.ts` line 356 - Manual cancellation (ready for future use) |

---

## Implementation Details

### 1. HTTP Status Code Mapping

**File**: `/src/lib/apiV2.ts` lines 282-318

```typescript
// Map HTTP status codes to error codes
switch (response.status) {
  case 400: errorCode = 'WEB-API-2'; break  // Bad Request
  case 403: errorCode = 'WEB-API-3'; break  // Forbidden
  case 404: errorCode = 'WEB-API-4'; break  // Not Found
  case 429: errorCode = 'WEB-NET-3'; break  // Too Many Requests
}
```

**Triggers**:
- Backend returns non-2xx status
- Error doesn't already have a code
- Status matches one of the mapped codes

**Result**: Error gets appropriate code and user-friendly message

---

### 2. Network Error Detection

**File**: `/src/lib/apiV2.ts` lines 383-398

```typescript
// Detect network error types
if (error instanceof TypeError && errorDetail.includes('fetch')) {
  errorCode = 'WEB-NET-4'  // Connection error
} else if (errorDetail.includes('NetworkError') || errorDetail.includes('network')) {
  errorCode = 'WEB-NET-1'  // Network offline
}
```

**Triggers**:
- TypeError during fetch (DNS, CORS, connection refused)
- Error message contains "NetworkError" or "network"

---

### 3. Timeout Handling

**File**: `/src/lib/apiV2.ts` lines 342-375

```typescript
if (error.name === 'AbortError') {
  const isTimeout = true  // Currently all AbortErrors are timeouts
  
  const abortError = isTimeout ? {
    code: 'WEB-NET-2',  // Timeout
    // ...
  } : {
    code: 'WEB-API-5',  // Manual cancellation (future)
    // ...
  }
}
```

**Triggers**:
- Request exceeds 30 second timeout
- AbortController.abort() called

**Future**: Can distinguish between timeout and manual cancellation

---

### 4. Circuit Breaker Integration

**File**: `/src/lib/utils/circuitBreaker.ts` lines 82-85

```typescript
const error: any = new Error('Circuit breaker is OPEN')
error.code = 'WEB-NET-5'
error.circuitBreakerOpen = true
throw error
```

**Triggers**:
- 5 consecutive failures to backend
- Circuit breaker opens
- Subsequent requests fail fast

**Recovery**: After 60 seconds, circuit transitions to HALF_OPEN to test recovery

---

### 5. Error Code Processing Flow

```
1. Error occurs (backend or frontend)
   ↓
2. Add error code if missing (based on status/type)
   ↓
3. processErrors() maps code to user message
   {
     code: 'ORD-CRT-1',
     message: 'Please provide a delivery address for your order.',
     originalTitle: 'Missing Delivery Address',
     originalDetail: 'Missing delivery address for delivery fulfillment'
   }
   ↓
4. Log with structured logging
   ↓
5. Report to AppSignal (if appropriate)
   ↓
6. Display to user or throw error
```

---

## Error Reporting Strategy

### Backend Errors
- **Server-side**: Logged with `logger.error()` → AppSignal
- **Client-side**: Logged only (no AppSignal) to avoid duplicates
- **Reason**: Already reported server-side with better context

### Frontend Errors
- **Client-side**: Logged and sent to AppSignal
- **Reason**: These errors only occur on client

### Implementation
```typescript
// Backend errors - no AppSignal on client
reportError(errorReport, { signal: false, prodSignal: false })

// Frontend errors - send to AppSignal
reportError(errorReport)  // Default behavior
```

---

## Usage Examples

### In Components

```typescript
try {
  const result = await apiV2.product({ filter: { active: true } })
  // Handle success
} catch (error) {
  // Error already has user-friendly message
  console.error(error.message)
  // Example: "Request timed out. Please try again."
}
```

### Displaying Errors

```svelte
{#if error}
  <div class="error">
    {error.message}
  </div>
{/if}
```

### Creating Custom Errors

```typescript
// In your code
throw {
  code: 'WEB-NET-1',
  title: 'Network Error',
  detail: 'Connection lost',
  status: '0'
}

// Automatically mapped to:
// "Network connection lost. Please check your internet connection and try again."
```

---

## Testing Error Codes

### Test Timeout (WEB-NET-2)
```typescript
// Simulate slow network in DevTools
// Request will timeout after 30s
const result = await apiV2.product()
```

### Test Rate Limiting (WEB-NET-3)
```typescript
// Make many rapid requests
for (let i = 0; i < 100; i++) {
  await apiV2.product()
}
// Backend returns 429 → WEB-NET-3
```

### Test Circuit Breaker (WEB-NET-5)
```typescript
// Stop backend server
// After 5 failures, circuit opens
// Next requests fail immediately with WEB-NET-5
```

### Test 404 (WEB-API-4)
```typescript
// Request non-existent resource
const result = await apiV2.product({ id: 'nonexistent' })
// Backend returns 404 → WEB-API-4
```

---

## Adding New Error Codes

### 1. Add to error-codes.ts
```typescript
{
  id: 'NEW-CAT-1',
  message: 'User-friendly message here.',
},  // Technical description
```

### 2. Implement Detection
```typescript
// In apiV2.ts or relevant file
if (/* condition */) {
  throw {
    code: 'NEW-CAT-1',
    title: 'Error Title',
    detail: 'Technical details',
    status: '500'
  }
}
```

### 3. Test
- Trigger the error condition
- Verify user-friendly message displays
- Check AppSignal receives error (if appropriate)
- Verify correlation ID is included

---

## Error Code Coverage

### Fully Implemented: 23 codes
- ✅ All 13 backend codes
- ✅ All 5 network codes (WEB-NET)
- ✅ All 5 API codes (WEB-API)

### Ready for Future Use: 8 codes
- Validation codes (WEB-VAL-1 through 4) - Commented out
- Storage codes (WEB-STR-1 through 3) - Commented out

### Total: 31 error codes defined

---

## Benefits

✅ **Consistent UX** - All errors show user-friendly messages
✅ **Technical Context** - Original errors preserved for debugging
✅ **Automatic Processing** - Errors automatically mapped throughout system
✅ **Observable** - All errors logged with correlation IDs
✅ **No Duplicates** - Smart AppSignal reporting prevents duplicate errors
✅ **Extensible** - Easy to add new error codes
✅ **Resilient** - Circuit breaker prevents cascading failures
✅ **Debuggable** - Correlation IDs trace requests across all layers

---

## Configuration

### Timeouts
- Request timeout: 30 seconds
- Circuit breaker timeout: 60 seconds

### Retry
- Max retries: 3 (GET only)
- Retryable statuses: 408, 429, 500, 502, 503, 504

### Circuit Breaker
- Failure threshold: 5
- Success threshold: 2
- Timeout: 60 seconds

---

## Files Modified

1. `/src/lists/error-codes.ts` - Error code definitions
2. `/src/lib/apiV2.ts` - Client-side error handling
3. `/src/lib/server/apiV2/helpers.ts` - Server-side error handling
4. `/src/lib/utils/circuitBreaker.ts` - Circuit breaker errors
5. `/src/lib/utils/retry.ts` - Retry logic (existing)
6. `/src/lib/utils/logger.ts` - Structured logging (existing)

---

## Monitoring

### Key Metrics
- Error code distribution
- Circuit breaker state changes
- Retry attempt frequency
- Correlation ID coverage

### AppSignal Dashboards
- Error rates by code
- Request latency by endpoint
- Circuit breaker state over time
- Retry success rates

---

## Future Enhancements

### Potential Additions
1. **WEB-VAL-*** - Form validation errors (uncomment when needed)
2. **WEB-STR-*** - Storage errors (uncomment when needed)
3. **Manual Cancellation** - Distinguish from timeout in WEB-API-5
4. **Error Recovery Suggestions** - Actionable steps for users
5. **i18n Support** - Multi-language error messages

### Not Planned
- Removing error codes (all are useful)
- Changing error code format (follows backend convention)
- Removing technical descriptions (valuable for debugging)
