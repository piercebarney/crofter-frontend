# API Architecture Documentation

## Overview

The Crofter webapp uses a three-layer API architecture that provides security, resilience, and observability for all backend communications.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser/Client                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              apiV2.ts (Client Layer)                   │ │
│  │  • Dynamic API proxy                                   │ │
│  │  • Request deduplication                               │ │
│  │  • Error code mapping                                  │ │
│  │  • Correlation ID generation                           │ │
│  │  • Structured logging                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│                    POST /api/v2                              │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    SvelteKit Server                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           +server.ts (Endpoint Layer)                  │ │
│  │  • HTTP-only cookie extraction                         │ │
│  │  • Token management (auth + guest)                     │ │
│  │  • Correlation ID forwarding                           │ │
│  │  • No-cache headers                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           helpers.ts (Server API Layer)                │ │
│  │  • Circuit breaker protection                          │ │
│  │  • Retry logic with backoff                            │ │
│  │  • Request timeout handling                            │ │
│  │  • JSON:API processing                                 │ │
│  │  • Case conversion (camelCase ↔ snake_case)           │ │
│  │  • Error code mapping                                  │ │
│  │  • Structured logging                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│                    fetch(backend)                            │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                   (JSON:API format)                          │
└─────────────────────────────────────────────────────────────┘
```

## Layer Details

### Layer 1: Client (`/src/lib/apiV2.ts`)

**Purpose**: Browser-side API interface

**Responsibilities**:
- Provide dynamic API proxy (`apiV2.productCategory()`, etc.)
- Generate correlation IDs for request tracking
- Handle request deduplication for GET operations
- Map error codes to user-friendly messages
- Log client-side errors with structured logging
- Handle impersonation state from cookies

**Key Features**:
- **Dynamic Proxy**: Creates methods on-the-fly based on property access
- **Deduplication**: Prevents parallel identical requests
- **Error Processing**: Maps backend error codes to user messages
- **Logging**: Structured logs with correlation IDs

**Example Usage**:
```typescript
const result = await apiV2.productCategory({ 
  filter: { active: true },
  sort: 'name'
})
```

**Security**:
- No direct token handling (tokens in HTTP-only cookies)
- No sensitive data in client code
- CORS protection via same-origin requests

---

### Layer 2: SvelteKit Endpoint (`/src/routes/api/v2/+server.ts`)

**Purpose**: Secure token management and request forwarding

**Responsibilities**:
- Extract authentication tokens from HTTP-only cookies
- Validate API endpoint exists
- Forward correlation IDs
- Add no-cache headers to responses
- Route requests to server-side API

**Why This Layer Exists**:

#### ✅ **Security Benefits**

1. **Token Protection**
   - Tokens stored in HTTP-only cookies (not accessible to JavaScript)
   - Prevents XSS attacks from stealing tokens
   - CSRF protection via SvelteKit

2. **Credential Isolation**
   - Client never sees authentication tokens
   - Tokens never exposed in browser memory
   - No token leakage through browser extensions

3. **Same-Origin Requests**
   - All client requests go to same domain
   - CORS not required
   - Simpler security model

#### ✅ **Architectural Benefits**

1. **Centralized Token Management**
   - Single point for token extraction
   - Easy to update token handling
   - Consistent across all API calls

2. **Request Validation**
   - Validates endpoint exists before processing
   - Prevents invalid API calls
   - Type-safe endpoint checking

3. **Response Normalization**
   - Adds consistent headers (no-cache)
   - Forwards correlation IDs
   - Uniform error handling

**Could This Be Removed?**

❌ **No** - This layer is essential for security:

Without it, you would need to:
- Store tokens in localStorage (vulnerable to XSS)
- OR make CORS requests directly to backend (complex, less secure)
- OR expose tokens to client JavaScript (security risk)

**Trade-offs**:
- ➕ Maximum security (HTTP-only cookies)
- ➕ Simple client code (no token management)
- ➕ CSRF protection
- ➖ Extra network hop (minimal latency)
- ➖ Additional server processing (negligible)

---

### Layer 3: Server API (`/src/lib/server/apiV2/helpers.ts`)

**Purpose**: Robust backend communication with resilience patterns

**Responsibilities**:
- Build URLs with proper JSON:API formatting
- Add authentication headers (Bearer token or guest session)
- Handle impersonation headers
- Forward correlation IDs to backend
- Apply circuit breaker pattern
- Retry failed requests with exponential backoff
- Handle request timeouts (30s)
- Process JSON:API responses
- Convert between camelCase and snake_case
- Map error codes to user-friendly messages
- Structured logging with correlation IDs

**Resilience Features**:

1. **Circuit Breaker**
   - Opens after 5 consecutive failures
   - Fails fast when backend is down
   - Tests recovery after 60 seconds
   - Prevents cascading failures

2. **Retry Logic**
   - 3 retry attempts for GET operations
   - Exponential backoff (1s, 2s, 4s)
   - Only retries transient errors (408, 429, 500, 502, 503, 504)
   - No retries for mutations (POST, PATCH, DELETE)

3. **Timeout Handling**
   - 30-second timeout per request
   - AbortController for clean cancellation
   - Proper cleanup on timeout

4. **Error Processing**
   - Maps error codes to user messages
   - Preserves original errors for debugging
   - Structured error logging

**Performance Optimizations**:
- Memoized case conversion (1000 entry cache)
- Efficient JSON:API data processing
- Minimal header overhead

---

## Request Flow Example

### Successful Request

```typescript
// 1. Client calls API
const products = await apiV2.product({ filter: { active: true } })
  ↓
// 2. apiV2.ts generates correlation ID
correlationId: "1701234567890-a3f9c2"
  ↓
// 3. POST to /api/v2 with correlation ID header
POST /api/v2
Headers: { x-correlation-id: "1701234567890-a3f9c2" }
Body: { name: "product", options: { filter: { active: true } } }
  ↓
// 4. +server.ts extracts tokens from cookies
AuthorizationToken: "eyJhbGc..."
  ↓
// 5. helpers.ts builds request
Circuit Breaker: CLOSED → Allow request
Retry: Attempt 1 of 3
Timeout: 30s
  ↓
// 6. Fetch backend with headers
GET https://api.example.com/api/json/product?filter[active]=true
Headers: {
  Authorization: "Bearer eyJhbGc...",
  x-correlation-id: "1701234567890-a3f9c2"
}
  ↓
// 7. Process response
Convert snake_case → camelCase
Map error codes (if any)
Log with correlation ID
  ↓
// 8. Return to client
{ data: [...], success: true }
```

### Failed Request (with Recovery)

```typescript
// 1. Client calls API
const products = await apiV2.product()
  ↓
// 2. Backend is slow/failing
Attempt 1: Timeout after 30s
  ↓
// 3. Retry with backoff
Wait 1 second
Attempt 2: 503 Service Unavailable
  ↓
// 4. Retry again
Wait 2 seconds
Attempt 3: 200 OK
  ↓
// 5. Success - return data
Circuit Breaker: Still CLOSED (not enough failures)
```

### Circuit Breaker Opens

```typescript
// After 5 consecutive failures
Failure 1, 2, 3, 4, 5 → Circuit OPENS
  ↓
// Next requests fail fast
Request 6: Immediate error (no backend call)
Request 7: Immediate error (no backend call)
  ↓
// After 60 seconds
Circuit → HALF_OPEN (test recovery)
  ↓
// Test request succeeds
Request 8: 200 OK
Request 9: 200 OK → Circuit CLOSES
  ↓
// Normal operation resumes
```

---

## Observability

### Correlation IDs

Every request gets a unique ID that flows through all layers:

```
Client generates: 1701234567890-a3f9c2
  ↓
Client logs: [apiV2] Request started (1701234567890-a3f9c2)
  ↓
Endpoint forwards: x-correlation-id: 1701234567890-a3f9c2
  ↓
Server logs: [apiV2/helpers] API request completed (1701234567890-a3f9c2)
  ↓
Backend receives: x-correlation-id: 1701234567890-a3f9c2
  ↓
Any errors include: correlationId: "1701234567890-a3f9c2"
```

**Benefits**:
- Trace a single request across all layers
- Find related logs in client, server, and backend
- Debug production issues with user-provided correlation ID
- AppSignal errors include correlation ID for context

### Structured Logging

All logs follow a consistent format:

```typescript
{
  timestamp: "2024-12-05T23:30:00.000Z",
  level: "error",
  location: "client",
  module: "apiV2",
  message: "API request failed",
  correlationId: "1701234567890-a3f9c2",
  name: "product",
  error: "Request timeout"
}
```

**Log Levels**:
- `debug` - Development only (hidden in production)
- `info` - General information
- `warn` - Warnings (sent to AppSignal in production)
- `error` - Errors (sent to AppSignal in production)

---

## Error Handling

### Error Code System

Errors from the backend include codes that map to user-friendly messages:

**Backend Error**:
```json
{
  "errors": [{
    "code": "ORD-CRT-1",
    "title": "Missing Delivery Address",
    "detail": "Missing delivery address for delivery fulfillment",
    "status": "422"
  }]
}
```

**Processed Error**:
```typescript
{
  code: "ORD-CRT-1",
  message: "Please provide a delivery address for delivery orders.", // User sees this
  originalTitle: "Missing Delivery Address",                         // For debugging
  originalDetail: "Missing delivery address for delivery fulfillment" // For debugging
}
```

**Processing Locations**:
- **Server** (`helpers.ts`): For logging and AppSignal
- **Client** (`apiV2.ts`): For UI display and frontend errors

### Error Categories

**Backend Codes**:
- `ACT-*` - Account errors
- `ORD-CRT-*` - Order creation errors
- `ORD-RDY-*` - Order status errors
- `PMT-CHG-*` - Payment errors

**Frontend Codes** (future):
- `FE-NET-*` - Network errors
- `FE-VAL-*` - Validation errors
- `FE-STR-*` - Storage errors

---

## Performance Characteristics

### Request Latency

**Normal Request**:
```
Client → Endpoint → Server → Backend
  ~1ms     ~2ms      ~5ms     ~100ms (network)
Total: ~108ms
```

**With Retry** (transient failure):
```
Attempt 1: Timeout (30s)
Wait: 1s
Attempt 2: Success (100ms)
Total: ~31.1s
```

**Circuit Open** (backend down):
```
Client → Endpoint → Server → Circuit Breaker
  ~1ms     ~2ms      ~1ms     Immediate error
Total: ~4ms (no backend call)
```

### Caching

**Case Conversion Cache**:
- Size: 1000 entries (LRU)
- Hit rate: ~95% for common keys
- Memory: ~50KB

**Request Deduplication**:
- Only for GET operations
- Cleared after request completes
- Prevents parallel duplicate requests

---

## Security Model

### Token Flow

```
1. User logs in
   ↓
2. Backend returns tokens
   ↓
3. SvelteKit sets HTTP-only cookies
   ↓
4. Client makes API call (no token visible)
   ↓
5. Endpoint extracts token from cookie
   ↓
6. Server adds Authorization header
   ↓
7. Backend validates token
```

**Security Properties**:
- ✅ Tokens never exposed to JavaScript
- ✅ XSS cannot steal tokens
- ✅ CSRF protection via SvelteKit
- ✅ Secure cookie flags (HttpOnly, Secure, SameSite)
- ✅ No token in localStorage or sessionStorage

### Impersonation

Admin users can impersonate other users:

```typescript
// Client reads impersonation cookie
const impersonatedUserId = getCookie('ImpersonatedUserId')

// Adds to request options
options.impersonateUserId = impersonatedUserId

// Server adds header
headers['x-impersonate-user-id'] = impersonatedUserId

// Backend processes as impersonated user
```

---

## Configuration

### Timeouts
- Request timeout: 30 seconds
- Circuit breaker timeout: 60 seconds

### Retry
- Max retries: 3 (GET only)
- Initial delay: 1 second
- Backoff multiplier: 2x
- Max delay: 10 seconds
- Retryable statuses: 408, 429, 500, 502, 503, 504

### Circuit Breaker
- Failure threshold: 5
- Success threshold: 2 (to close from half-open)
- Timeout: 60 seconds

### Caching
- Case conversion cache: 1000 entries
- Request deduplication: Until request completes

---

## Maintenance Guide

### Adding New API Endpoints

1. **Define in `/src/lib/server/apiV2/api.ts`**:
```typescript
export const apiV2 = {
  newEndpoint: (options: Record<string, any>) => 
    api('new_endpoint', { ...options, isMany: true })
}
```

2. **Use in components**:
```typescript
const data = await apiV2.newEndpoint({ filter: { active: true } })
```

### Adding Error Codes

1. **Add to `/src/lists/error-codes.ts`**:
```typescript
{
  id: 'NEW-ERR-1',
  message: 'User-friendly message here.'
}
```

2. **Automatic processing** - No code changes needed!

### Monitoring

**Key Metrics to Watch**:
- Circuit breaker state changes
- Retry attempt frequency
- Request timeout rate
- Error code distribution
- Correlation ID coverage

**AppSignal Dashboards**:
- Error rates by correlation ID
- Request latency percentiles
- Circuit breaker state over time
- Retry success rates

---

## Future Enhancements

### Potential Improvements

1. **Request Batching**
   - Combine multiple API calls into one request
   - Reduce network overhead
   - Complexity: Medium

2. **Response Caching**
   - Cache GET responses client-side
   - Reduce backend load
   - Complexity: Medium

3. **Optimistic Updates**
   - Update UI before backend confirms
   - Better perceived performance
   - Complexity: High

4. **GraphQL Migration**
   - More flexible data fetching
   - Reduce over-fetching
   - Complexity: Very High

5. **WebSocket Support**
   - Real-time updates
   - Reduce polling
   - Complexity: High

### Not Recommended

❌ **Remove SvelteKit Endpoint Layer**
- Security risk (token exposure)
- More complex CORS setup
- Loss of centralized token management

❌ **Direct Backend Calls from Client**
- Tokens in localStorage (XSS risk)
- CORS complexity
- No centralized error handling

---

## Conclusion

The three-layer architecture provides:

✅ **Security**: HTTP-only cookies, token isolation, CSRF protection
✅ **Resilience**: Circuit breaker, retry logic, timeout handling
✅ **Observability**: Correlation IDs, structured logging, AppSignal integration
✅ **Performance**: Memoization, deduplication, efficient processing
✅ **Maintainability**: Clear separation of concerns, easy to extend

The SvelteKit endpoint layer is **essential** for security and should not be removed. The additional latency (~3ms) is negligible compared to the security benefits.

All layers work together to provide a robust, secure, and observable API system that can handle production workloads with confidence.
