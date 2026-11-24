# AppSignal vs Frontend Error Separation

## Overview

Error data is now separated into two distinct audiences:

1. **AppSignal (Developers)** - Gets full debugging metadata
2. **Frontend (Users)** - Gets clean, minimal error structure

---

## Changes Made

### **1. reporter/module.ts** ✅

**Added `meta` field**:
```typescript
interface Code {
  // ... existing fields
  meta?: Record<string, any>  // NEW: For debugging metadata
}
```

**Added to AppSignal tags**:
```typescript
if (report?.meta) tags.meta = JSON.stringify(report.meta)
```

---

### **2. helpers.ts** ✅

#### **JSON Parse Errors**

**Before** ❌:
```typescript
error = [{
  code: errorCode,
  title: 'JSON Parse Error',
  detail: errorMessage,
  status: status.toString(),
  originalError: parseError.message  // ❌ Exposed to frontend
}]
```

**After** ✅:
```typescript
// Report with full details to AppSignal
reportError({
  message: errorObj.message,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: parseError.message,
  meta: {                              // ✅ Only in AppSignal
    contentType,
    parseError: parseError.message,
    stack: parseError.stack
  },
  args: buildArgs(options)
})

// Return clean error to frontend
error = [errorObj]  // Only: code, title, detail, message
```

---

#### **Non-JSON Responses (HTML errors)**

**Before** ❌:
```typescript
error = [{
  code: errorCode,
  title: errorTitle,
  detail: errorDetail,
  status: status.toString(),
  meta: {                              // ❌ Exposed to frontend
    contentType,
    originalResponse: responseText.substring(0, 300)
  }
}]
```

**After** ✅:
```typescript
// Report with full details to AppSignal
reportError({
  message: errorObj.message,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: errorDetail,
  meta: {                              // ✅ Only in AppSignal
    contentType,
    originalResponse: responseText.substring(0, 300),
    htmlTitle: titleMatch ? errorTitle : null,
    htmlDetail: h1Match ? errorDetail : null
  },
  args: buildArgs(options)
})

// Return clean error to frontend
if (titleMatch || h1Match) {
  error = [{
    code: errorCode,
    title: errorTitle,              // From HTML parsing
    detail: errorDetail,            // From HTML parsing
    message: errorObj.message       // From error-codes.ts
  }]
} else {
  error = [errorObj]                // From error-codes.ts
}
```

---

## Error Structure Comparison

### **Frontend Receives (Clean)** 👤

```json
{
  "error": [{
    "code": "WEB-SRV-5",
    "title": "Data Format Error",
    "detail": "JSON parse error or invalid response format",
    "message": "Data format error. Please contact support if this persists."
  }],
  "success": false,
  "status": 400
}
```

### **AppSignal Receives (Full Details)** 🔧

```json
{
  "tags": {
    "type": "error",
    "code": "WEB-SRV-5",
    "message": "Data format error. Please contact support if this persists.",
    "correlationId": "req-abc-123",
    "url": "https://api.example.com/orders",
    "status": "400",
    "error": "Unexpected token < in JSON at position 0",
    "meta": "{\"contentType\":\"text/html\",\"parseError\":\"Unexpected token < in JSON at position 0\",\"stack\":\"SyntaxError: Unexpected token < in JSON...\"}"
  }
}
```

---

## Benefits

✅ **Smaller Payloads** - Frontend gets only what it needs  
✅ **No Sensitive Data** - Stack traces, raw responses stay server-side  
✅ **Better UX** - Clean error messages without technical noise  
✅ **Better DX** - Developers get full context in AppSignal  
✅ **Security** - Internal details not exposed to client  

---

## Meta Field Contents

### **JSON Parse Errors**
```typescript
meta: {
  contentType: string,
  parseError: string,
  stack: string
}
```

### **HTML Error Responses**
```typescript
meta: {
  contentType: string,
  originalResponse: string,  // First 300 chars
  htmlTitle: string | null,
  htmlDetail: string | null
}
```

---

## External API Errors

External API errors (ACT, ORD, PMT domains) already come with clean title/detail from the backend API, so they don't need special handling. They're already in the correct format for frontend consumption.

---

**Frontend gets clean errors, AppSignal gets full debugging context!** 🎯
