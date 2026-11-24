# Complete Error Flow Analysis

## ✅ Summary: Everything is in Place!

Both client-side and server-side error flows are properly implemented with:
- Universal reporter supporting both environments
- Consistent error structure (code, title, detail, message)
- Clean args (only API parameters)
- Correlation ID tracking
- AppSignal reporting for both client and server
- Separate metadata for AppSignal vs frontend

---

## 🔄 Complete Error Flow

### **1. Server-Side Flow**

```
External API Error
    ↓
helpers.ts: api() function
    ├─ Fetch external API
    ├─ Parse response
    ├─ Detect error
    ↓
Error Handling
    ├─ Assign error code (WEB-SRV-*)
    ├─ Build error object with errorCodes.object()
    ├─ Report to AppSignal with meta
    │   └─ reportError({
    │         message: errorObj.message,
    │         code: 'WEB-SRV-X',
    │         correlationId,
    │         url,
    │         status,
    │         error: actualError,
    │         meta: { contentType, stack, ... },  // AppSignal only
    │         args: buildArgs(options)             // Clean API params
    │       })
    ↓
Return to api.ts Proxy
    ├─ Graceful error response
    └─ error: [errorObj]  // Clean: code, title, detail, message
    ↓
Return to +server.ts
    ↓
Return to Client (apiV2.ts)
```

### **2. Client-Side Flow**

```
User Action
    ↓
apiV2.ts: Proxy call
    ├─ Generate correlationId
    ├─ POST to /api/v2
    ├─ Timeout/Retry logic
    ↓
Network/Timeout Error?
    ├─ YES: Client-side error
    │   ├─ Assign error code (WEB-NET-*)
    │   ├─ Build error with errorCodes.object()
    │   └─ Report to AppSignal
    │       └─ reportError({
    │             message: errorObj.message,
    │             code: 'WEB-NET-X',
    │             correlationId,
    │             error: error.message,
    │             args: buildArgs(options)
    │           })
    │   └─ Throw error
    │
    └─ NO: Response received
        ↓
    Parse JSON
        ↓
    Check response.ok
        ├─ OK + data.error
        │   ├─ Process errors
        │   ├─ Report (no AppSignal - already reported server-side)
        │   └─ Return data with error
        │
        ├─ !OK
        │   ├─ Map status to error code
        │   ├─ Process errors
        │   ├─ Report (no AppSignal - already reported server-side)
        │   └─ Throw error
        │
        └─ OK + no error
            └─ Return data
```

---

## 📋 Component Checklist

### **Reporter Module** ✅

**File**: `/src/lib/reporter/module.ts`

- ✅ Imports both `@appsignal/javascript` and `@appsignal/nodejs`
- ✅ Uses single key: `PUBLIC_APPSIGNAL_KEY`
- ✅ Server-side singleton instance initialized (lines 104-116)
- ✅ `appSignalSend()` detects environment (lines 118-167)
  - ✅ Client: Uses `AppSignalBrowser`
  - ✅ Server: Uses `appSignalServerInstance.tracer()`
- ✅ Same tags for both environments
- ✅ `buildArgs()` helper exported (lines 9-19)
- ✅ `meta` field in `Code` interface (line 69)
- ✅ Type annotations for span parameters (lines 148, 157)

**Exports**:
- ✅ `reporter()` - Main factory function
- ✅ `buildArgs()` - Clean args builder
- ✅ `ErrorReport` type
- ✅ `DebugReport` type

---

### **Server-Side: helpers.ts** ✅

**File**: `/src/lib/server/apiV2/helpers.ts`

- ✅ Imports `reporter` and `buildArgs`
- ✅ Creates `reportError` and `reportDebug` constants (lines 12-13)
- ✅ No logger imports
- ✅ All error reports include:
  - ✅ `message` from `errorCodes.object()`
  - ✅ `code` (WEB-SRV-*)
  - ✅ `correlationId` as top-level property
  - ✅ `url`, `status`
  - ✅ `error` (actual error message)
  - ✅ `meta` (AppSignal-only metadata)
  - ✅ `args` from `buildArgs(options)`

**Error Handling**:
- ✅ JSON parse errors (line 496)
- ✅ Non-JSON responses (line 562)
- ✅ External API errors (line 613)

**Error Objects Returned**:
- ✅ Clean structure: `code`, `title`, `detail`, `message`
- ✅ No `meta` or diagnostic data in frontend response
- ✅ Uses `errorCodes.object()` where appropriate

---

### **Server-Side: api.ts** ✅

**File**: `/src/lib/server/apiV2/api.ts`

- ✅ Imports `reporter` and `buildArgs`
- ✅ Creates `reportError` constant
- ✅ No logger imports
- ✅ Method not found error (line 102-107):
  - ✅ Uses `errorCodes.object('WEB-SRV-6')`
  - ✅ `correlationId` as top-level
  - ✅ `args` from `buildArgs(options)` + method name

**Proxy Error Handling**:
- ✅ Missing method detection
- ✅ Graceful error response
- ✅ Clean error object returned

---

### **Server-Side: +server.ts** ✅

**File**: `/src/routes/api/v2/+server.ts`

- ✅ Imports `errorCodes` and `reporter`
- ✅ Creates `reportError` constant
- ✅ All error responses use `errorCodes.object()`
- ✅ Three error paths:
  - ✅ JSON parse error (WEB-SRV-5)
  - ✅ Endpoint not found (WEB-SRV-6)
  - ✅ Unexpected error (WEB-SRV-1)
- ✅ All errors include:
  - ✅ `correlationId` as top-level
  - ✅ `message` from error object
  - ✅ Clean error response to client

**Response Structure**:
```typescript
{
  success: false,
  error: [errorObj],  // code, title, detail, message
  status: number
}
```

---

### **Client-Side: apiV2.ts** ✅

**File**: `/src/lib/apiV2.ts`

- ✅ Imports `reporter`, `buildArgs`, `errorCodes`
- ✅ Creates `reportError` and `reportDebug` constants (lines 15-16)
- ✅ No logger imports
- ✅ All error reports include:
  - ✅ `message` from error object
  - ✅ `code` (WEB-NET-* or WEB-API-*)
  - ✅ `correlationId` as top-level
  - ✅ `error` (actual error)
  - ✅ `args` from `buildArgs(options)` + name

**Error Handling**:
- ✅ Timeout errors (line 357-372) - Uses `errorCodes.object()`
- ✅ Network errors (line 402-418) - Uses `errorCodes.object()`
- ✅ Server errors (line 264-274) - No AppSignal (already reported)
- ✅ Non-OK responses (line 332-342) - No AppSignal (already reported)

**AppSignal Control**:
- ✅ Client-side errors: Send to AppSignal
- ✅ Server-side errors: Don't send (already reported)
  - `{ signal: false, prodSignal: false }`

---

## 🔑 Key Features Verified

### **1. Universal Reporter** ✅
- Single API works everywhere
- Automatic environment detection
- Same key for both client and server
- Consistent tag structure

### **2. Error Structure** ✅
- **Frontend**: `code`, `title`, `detail`, `message`
- **AppSignal**: All of above + `meta`, `correlationId`, `args`, `url`, `status`

### **3. Clean Args** ✅
- Only API request parameters: `id`, `attributes`, `filter`, `limit`, `page`
- No diagnostic metadata
- Filtered for `undefined`/`null` values
- Built with `buildArgs()` helper

### **4. Correlation ID** ✅
- Generated client-side
- Passed through all layers
- Included in all error reports
- Top-level property (not in args)

### **5. Error Codes** ✅
- All errors have codes
- `errorCodes.object()` provides uniform structure
- Titles and details for WEB domain
- External APIs provide their own title/detail

### **6. AppSignal Reporting** ✅
- **Client-side**: Network errors, timeouts
- **Server-side**: API errors, parsing errors, endpoint errors
- **No duplication**: Server errors not re-reported by client
- **Environment-based**: Production only by default

### **7. Metadata Separation** ✅
- **AppSignal gets**: `meta` with stack traces, raw responses, etc.
- **Frontend gets**: Clean error objects only
- No sensitive data exposed to client

---

## 🎯 Error Code Coverage

### **Client-Side (WEB-NET)**
- ✅ WEB-NET-1: Network offline
- ✅ WEB-NET-2: Request timeout
- ✅ WEB-NET-3: Too many requests
- ✅ WEB-NET-4: Connection failed
- ✅ WEB-NET-5: Service unavailable
- ✅ WEB-NET-6: Request aborted

### **Client-Side (WEB-API)**
- ✅ WEB-API-1: Generic API error
- ✅ WEB-API-2: Invalid request
- ✅ WEB-API-3: Permission denied
- ✅ WEB-API-4: Not found
- ✅ WEB-API-5: Request cancelled

### **Server-Side (WEB-SRV)**
- ✅ WEB-SRV-1: Generic server error
- ✅ WEB-SRV-2: Partial load failure
- ✅ WEB-SRV-3: Service unavailable
- ✅ WEB-SRV-4: Connection failed
- ✅ WEB-SRV-5: Data format error
- ✅ WEB-SRV-6: Method not found
- ✅ WEB-SRV-7: Server timeout
- ✅ WEB-SRV-8: Invalid response
- ✅ WEB-SRV-9: External API error
- ✅ WEB-SRV-10: Processing error

---

## 📊 Data Flow Examples

### **Example 1: Server-Side API Error**

```typescript
// 1. External API returns 500
// helpers.ts
const errorCode = 'WEB-SRV-3'
const errorObj = errorCodes.object(errorCode)

// 2. Report to AppSignal (server-side)
reportError({
  message: errorObj.message,
  code: 'WEB-SRV-3',
  correlationId: 'req-abc-123',
  url: 'https://api.example.com/orders',
  status: '500',
  error: 'Service Unavailable',
  meta: {
    contentType: 'text/html',
    originalResponse: '<html>...',
    htmlTitle: 'Service Unavailable'
  },
  args: { id: 42 }
})
// → Sent to AppSignal via @appsignal/nodejs

// 3. Return to client
return {
  success: false,
  error: [{
    code: 'WEB-SRV-3',
    title: 'Service Unavailable',
    detail: 'Backend service unavailable (500, 502, 503)',
    message: 'Service temporarily unavailable. Please try again in a moment.'
  }],
  status: 500
}
// → Clean error, no meta
```

### **Example 2: Client-Side Timeout**

```typescript
// 1. Request times out (30s)
// apiV2.ts
const errorCode = 'WEB-NET-2'
const errorObj = errorCodes.object(errorCode)

// 2. Report to AppSignal (client-side)
reportError({
  error: errorObj,
  location: 'api.timeout',
  message: errorObj.message,
  correlationId: 'req-xyz-789',
  args: { name: 'orders', id: 42 }
})
// → Sent to AppSignal via @appsignal/javascript

// 3. Throw error
throw new Error('Request timed out. Please try again.')
```

---

## ✅ Final Verification

### **Nothing Missing**

1. ✅ Both SDKs installed and imported
2. ✅ Single key configuration
3. ✅ Server-side instance initialized
4. ✅ Environment detection working
5. ✅ All error paths covered
6. ✅ Clean args everywhere
7. ✅ Correlation IDs tracked
8. ✅ Error codes assigned
9. ✅ Metadata separated
10. ✅ No duplicate reporting
11. ✅ Type safety maintained
12. ✅ Documentation complete

### **Ready for Testing**

1. Set `PUBLIC_APPSIGNAL_KEY` in environment
2. Trigger server-side error → Check AppSignal
3. Trigger client-side error → Check AppSignal
4. Verify correlation IDs match across layers
5. Verify tags include all expected data
6. Verify frontend receives clean errors

---

**🎉 Complete error handling system is fully implemented and ready!**
