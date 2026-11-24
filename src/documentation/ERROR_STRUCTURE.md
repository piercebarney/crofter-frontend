# Uniform Error Structure

## Overview

All errors returned to the frontend now have a consistent structure with four key fields:

1. **`code`** - Error code (always present)
2. **`message`** - User-friendly message from error-codes.ts (always present)
3. **`title`** - Short error title (from external API or error-codes.ts)
4. **`detail`** - Technical detail (from external API or error-codes.ts)

---

## Error Code Structure

### **WEB Domain Errors** ✅

All WEB domain errors now have `title` and `detail` in error-codes.ts:

- **WEB-NET** (Frontend network errors) - 6 codes
- **WEB-API** (Frontend API errors) - 5 codes
- **WEB-SRV** (Server-side API proxy errors) - 10 codes

### **Non-WEB Domain Errors**

These keep `title: null, detail: null` because external APIs provide them:

- **ACT** (Account errors) - External auth API provides title/detail
- **ORD** (Order errors) - External order API provides title/detail
- **PMT** (Payment errors) - External payment API provides title/detail

---

## Example Error Responses

### **From error-codes.ts (WEB domain)**

```json
{
  "code": "WEB-SRV-4",
  "title": "Connection Failed",
  "detail": "Backend connection failed (fetch error)",
  "message": "Unable to connect to backend service. Please try again later."
}
```

### **From external API (non-WEB domain)**

```json
{
  "code": "ORD-CRT-1",
  "title": "Missing Delivery Address",
  "detail": "Order requires a delivery address for delivery fulfillment method",
  "message": "Please provide a delivery address for your order."
}
```

---

## Error-Codes.ts Structure

### **WEB-NET Errors**

| Code | Title | Detail | Message |
|------|-------|--------|---------|
| WEB-NET-1 | Connection Lost | Network offline or connection lost | Network connection lost. Please check your internet connection and try again. |
| WEB-NET-2 | Request Timeout | Request exceeded 30s timeout (client-side) | Request timed out. Please try again. |
| WEB-NET-3 | Too Many Requests | Rate limiting (429) or too many parallel requests | Too many requests. Please wait a moment and try again. |
| WEB-NET-4 | Connection Failed | Fetch failed, DNS error, or CORS issue | Unable to connect to server. Please try again later. |
| WEB-NET-5 | Service Unavailable | Circuit breaker open or 503 response | Service temporarily unavailable. Please try again in a few moments. |
| WEB-NET-6 | Request Aborted | AbortController manually cancelled (not timeout) | Request was aborted. Please try again if needed. |

### **WEB-API Errors**

| Code | Title | Detail | Message |
|------|-------|--------|---------|
| WEB-API-1 | API Error | Generic API error | An unexpected error occurred. Please try again. |
| WEB-API-2 | Invalid Request | Malformed request or invalid parameters | Invalid request. Please refresh the page and try again. |
| WEB-API-3 | Permission Denied | Authorization error (403) | You do not have permission to perform this action. |
| WEB-API-4 | Not Found | Not found error (404) | The requested resource was not found. |
| WEB-API-5 | Request Cancelled | AbortController cancelled request | Request was cancelled. Please try again if needed. |

### **WEB-SRV Errors**

| Code | Title | Detail | Message |
|------|-------|--------|---------|
| WEB-SRV-1 | Server Error | Generic server API error (default) | Unable to load data. The page will continue with limited functionality. |
| WEB-SRV-2 | Partial Load Failure | Partial data load failure | Some data could not be loaded. Please refresh the page. |
| WEB-SRV-3 | Service Unavailable | Backend service unavailable (500, 502, 503) | Service temporarily unavailable. Please try again in a moment. |
| WEB-SRV-4 | Connection Failed | Backend connection failed (fetch error) | Unable to connect to backend service. Please try again later. |
| WEB-SRV-5 | Data Format Error | JSON parse error or invalid response format | Data format error. Please contact support if this persists. |
| WEB-SRV-6 | Method Not Found | Method doesn't exist on apiV2 | API method not found. Please contact support. |
| WEB-SRV-7 | Server Timeout | Server-side timeout (AbortController) | Request timed out on server. Please try again. |
| WEB-SRV-8 | Invalid Response | Response missing expected fields | Invalid API response structure. Please contact support. |
| WEB-SRV-9 | External API Error | External API error (non-2xx with error in response) | External API returned an error. Please try again later. |
| WEB-SRV-10 | Processing Error | Response processing error | Unable to process API response. Please contact support. |

---

## Usage in Code

### **Accessing Error Properties**

```typescript
import { errorCodes } from 'src/lists/error-codes'

const code = 'WEB-SRV-4'

// Get all properties
const message = errorCodes.message(code)  // "Unable to connect to backend service..."
const title = errorCodes.title(code)      // "Connection Failed"
const detail = errorCodes.detail(code)    // "Backend connection failed (fetch error)"
```

### **Building Error Responses**

```typescript
// In helpers.ts, api.ts, +server.ts
const errorCode = 'WEB-SRV-4'

const errorResponse = {
  code: errorCode,
  title: errorCodes.title(errorCode),
  detail: errorCodes.detail(errorCode),
  message: errorCodes.message(errorCode)
}

// Returns:
// {
//   code: "WEB-SRV-4",
//   title: "Connection Failed",
//   detail: "Backend connection failed (fetch error)",
//   message: "Unable to connect to backend service. Please try again later."
// }
```

### **Handling External API Errors**

```typescript
// External API provides title and detail
const externalError = {
  code: 'ORD-CRT-1',
  title: 'Missing Delivery Address',        // From external API
  detail: 'Order requires delivery address', // From external API
  message: errorCodes.message('ORD-CRT-1')  // From error-codes.ts
}
```

---

## Benefits

✅ **Consistent Structure** - All errors have the same 4 fields  
✅ **Always Present** - Code and message are never missing  
✅ **Flexible** - Title/detail from external API or error-codes.ts  
✅ **User-Friendly** - Message is always human-readable  
✅ **Developer-Friendly** - Detail provides technical context  
✅ **Uniform Display** - Frontend can display errors consistently  

---

## Frontend Display Example

```svelte
{#if error}
  <div class="error-message">
    <h3>{error.title || 'Error'}</h3>
    <p>{error.message}</p>
    {#if $systemSettings.debug}
      <small>Code: {error.code}</small>
      <small>Detail: {error.detail}</small>
    {/if}
  </div>
{/if}
```

---

**All errors now have uniform structure!** 🎯
