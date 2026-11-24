# API Error Handling System - Implementation Plan

## Overview

Comprehensive error handling across both API flow paths with industry-standard practices.

---

## API Flow Paths

### **Path 1: Client → Server → External API**
```
Client Component
  ↓ (1)
/lib/apiV2.ts (client-side handler)
  ↓ (2)
/routes/api/v2/+server.ts (SvelteKit endpoint)
  ↓ (3)
/lib/server/apiV2/api.ts (proxy wrapper)
  ↓ (4)
/lib/server/apiV2/helpers.ts (external API call)
  ↓ (5)
External API
```

### **Path 2: Server → External API**
```
Server Load Function (+layout.server.ts, +page.server.ts, etc.)
  ↓ (1)
/lib/server/apiV2/api.ts (proxy wrapper)
  ↓ (2)
/lib/server/apiV2/helpers.ts (external API call)
  ↓ (3)
External API
```

---

## Error Handling Principles

### **Industry Standards**

1. **Fail Fast** - Detect and throw errors at point of failure
2. **Error Enrichment** - Add context as error propagates up
3. **Single Responsibility** - Each layer handles only its errors
4. **Observability** - Log and report at point of failure
5. **Graceful Degradation** - Never crash user experience
6. **Structured Logging** - Consistent format with correlation IDs
7. **Error Codes** - Meaningful, searchable, traceable codes

### **Implementation Requirements**

For each leg:
1. ✅ **Complete Coverage** - All possible errors accounted for
2. ✅ **Error Codes** - Assigned at point of failure
3. ✅ **Responsibility** - Only handle relevant errors
4. ✅ **Propagation** - Pass errors upstream for UI handling
5. ✅ **AppSignal** - Report at point of failure
6. ✅ **Debug Logging** - Conditional via `sS.val('log.debug')`
7. ✅ **Error Logging** - Conditional via `sS.val('log.error')`

---

## Error Code System

### **WEB-NET (Network Errors)**
| Code | Point of Failure | Description |
|------|------------------|-------------|
| WEB-NET-1 | Client | Network offline/connection lost |
| WEB-NET-2 | Client | Request timeout (30s) |
| WEB-NET-3 | Client/Server | Rate limiting (429) |
| WEB-NET-4 | Client/Server | Fetch failed, DNS, CORS |
| WEB-NET-5 | Client | Circuit breaker open |
| WEB-NET-6 | Client | AbortController cancelled |

### **WEB-API (Client API Errors)**
| Code | Point of Failure | Description |
|------|------------------|-------------|
| WEB-API-1 | Client | Generic API error |
| WEB-API-2 | Client | Malformed request (400) |
| WEB-API-3 | Client/Server | Permission denied (403) |
| WEB-API-4 | Client/Server | Not found (404) |
| WEB-API-5 | Client | Request cancelled |

### **WEB-SRV (Server API Errors)**
| Code | Point of Failure | Description |
|------|------------------|-------------|
| WEB-SRV-1 | Proxy | Generic server error |
| WEB-SRV-2 | Proxy | Partial data load failure |
| WEB-SRV-3 | Helpers/Proxy | Service unavailable (500+) |
| WEB-SRV-4 | Helpers | Connection failed (fetch) |
| WEB-SRV-5 | Helpers | JSON parse error |
| WEB-SRV-6 | Proxy | Method not found |
| WEB-SRV-7 | Helpers | Server-side timeout |
| WEB-SRV-8 | Helpers | Invalid response structure |
| WEB-SRV-9 | Helpers | External API error |
| WEB-SRV-10 | Helpers | Response processing error |

---

## Logging & Reporting Strategy

### **Console Logging**
- **Debug/Info/Warn**: Controlled by `sS.val('log.debug')`
- **Error**: Controlled by `sS.val('log.error')`
- **Format**: `[timestamp] [LEVEL] [module] message (correlationId)`

### **AppSignal Reporting**
- **Always active** for errors and warnings
- **Independent** of console logging settings
- **At point of failure** to ensure reporting even if error doesn't propagate
- **No duplicates** - only report once per error occurrence

### **Correlation IDs**
- Generated at entry point (client or server load)
- Passed through entire request chain
- Included in all logs and reports
- Enables end-to-end tracing

---

## Implementation Plan

### **Phase 1: Logger Integration** ✅ COMPLETED
- [x] Integrate systemSettings with logger
- [x] Conditional console logging
- [x] Always-active AppSignal reporting
- [x] Expand error code system

### **Phase 2: helpers.ts Review** 🔄 IN PROGRESS
File: `/lib/server/apiV2/helpers.ts`

**Possible Error Points:**
1. Fetch failure (network, DNS)
2. Timeout (AbortController)
3. HTTP errors (4xx, 5xx)
4. JSON parse failure
5. Invalid response structure
6. Missing expected fields

**Actions:**
- [ ] Assign error codes at each failure point
- [ ] Add AppSignal reporting for each error
- [ ] Add conditional debug/error logging
- [ ] Throw structured errors with codes
- [ ] Remove any remaining duplicate logging

### **Phase 3: api.ts Proxy Review**
File: `/lib/server/apiV2/api.ts`

**Possible Error Points:**
1. Method doesn't exist
2. Errors thrown from helpers
3. Unexpected errors

**Actions:**
- [ ] Verify error code assignment
- [ ] Add AppSignal reporting
- [ ] Add conditional logging
- [ ] Ensure graceful error responses
- [ ] Update error code usage (new codes)

### **Phase 4: +server.ts Review**
File: `/routes/api/v2/+server.ts`

**Possible Error Points:**
1. Request parsing errors
2. Errors from api.ts proxy
3. Response serialization errors

**Actions:**
- [ ] Add error handling
- [ ] Assign error codes
- [ ] Add AppSignal reporting
- [ ] Add conditional logging
- [ ] Ensure proper error propagation to client

### **Phase 5: apiV2.ts Client Review**
File: `/lib/apiV2.ts`

**Possible Error Points:**
1. Network failures
2. Timeout
3. Circuit breaker
4. Retry exhaustion
5. Response parsing
6. Error from server

**Actions:**
- [ ] Review error code assignment
- [ ] Verify AppSignal reporting (no duplicates)
- [ ] Add conditional logging
- [ ] Ensure user-friendly messages
- [ ] Update error codes (new codes)

### **Phase 6: Integration Testing**
- [ ] Test Path 1 (Client → Server → External)
- [ ] Test Path 2 (Server → External)
- [ ] Verify error codes at each point
- [ ] Check AppSignal reporting (no duplicates)
- [ ] Verify debug/error logging settings
- [ ] Test graceful degradation
- [ ] Verify correlation ID flow

---

## Testing Scenarios

### **Network Errors**
- [ ] Network offline
- [ ] DNS failure
- [ ] Timeout
- [ ] Abort

### **HTTP Errors**
- [ ] 400 Bad Request
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 429 Rate Limit
- [ ] 500 Server Error
- [ ] 502 Bad Gateway
- [ ] 503 Service Unavailable

### **Data Errors**
- [ ] Invalid JSON
- [ ] Missing fields
- [ ] Invalid structure
- [ ] Empty response

### **System Errors**
- [ ] Method not found
- [ ] Circuit breaker open
- [ ] Retry exhaustion

---

## Success Criteria

1. ✅ All errors have specific error codes
2. ✅ All errors reported to AppSignal at point of failure
3. ✅ No duplicate AppSignal reports
4. ✅ Console logging controlled by systemSettings
5. ✅ Correlation IDs flow through entire chain
6. ✅ Errors propagate correctly for UI handling
7. ✅ User-friendly error messages displayed
8. ✅ Page never crashes from API errors
9. ✅ Structured logging format consistent
10. ✅ All failure points accounted for

---

## Next Steps

1. Review and update `/lib/server/apiV2/helpers.ts`
2. Review and update `/lib/server/apiV2/api.ts`
3. Review and update `/routes/api/v2/+server.ts`
4. Review and update `/lib/apiV2.ts`
5. Integration testing
6. Documentation update
