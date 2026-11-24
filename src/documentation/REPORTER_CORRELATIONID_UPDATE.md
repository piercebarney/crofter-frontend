# Reporter: correlationId as Top-Level Property ✅

## Overview

Updated the reporter module to accept `correlationId` as a top-level property (alongside `code`, `url`, `status`, etc.) instead of burying it in the `args` object. This provides better visibility and makes correlation IDs first-class citizens in error tracking.

---

## Changes Made

### **1. reporter/module.ts** ✅

#### **Added to Interface**:
```typescript
interface Code {
  args?:          Record<string, any>
  code?:          string
  correlationId?: string  // NEW - Top-level property
  location?:      string
  result?:        Record<string, any>
  action?:        string
  href?:          string
  pathName?:      string
  status?:        string
  url?:           string
  error?:         Record<string, any>|string|unknown
  raw?:           any
  event?:         any
}
```

#### **Added to AppSignal Tags**:
```typescript
const appSignalSend = (type:string, report:any) => {
  // ...
  let tags: Record<string, any> = {type}
  
  if (report?.note) tags.note = report.note
  if (report?.file) tags.file = report.file
  if (report?.action) tags.action = report.action
  if (report?.code) tags.code = report.code
  if (report?.correlationId) tags.correlationId = report.correlationId  // NEW
  if (report?.location) tags.location = report.location
  // ...
}
```

---

### **2. helpers.ts** ✅

Updated all 6 reporter calls to use top-level `correlationId`:

#### **Before** ❌:
```typescript
reportError({
  message: errorMessage,
  code: errorCode,
  url,
  error: fetchError.message,
  args: { correlationId, timeout: 30000 }  // Buried in args
})
```

#### **After** ✅:
```typescript
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,  // Top-level property
  url,
  error: fetchError.message,
  args: { timeout: 30000 }
})
```

**All 6 updates**:
1. ✅ Timeout error (WEB-SRV-7)
2. ✅ Connection error (WEB-SRV-4)
3. ✅ JSON parse error (WEB-SRV-5)
4. ✅ Non-JSON response (WEB-SRV-8, etc.)
5. ✅ External API error (WEB-SRV-9)
6. ✅ Success debug log

---

### **3. api.ts** ✅

Updated both reporter calls to use top-level `correlationId`:

#### **Before** ❌:
```typescript
reportError({
  message: userMessage,
  code: errorCode,
  error: `Method '${String(prop)}' does not exist on apiV2`,
  args: { correlationId, method: String(prop), options }  // Buried in args
})
```

#### **After** ✅:
```typescript
reportError({
  message: userMessage,
  code: errorCode,
  correlationId,  // Top-level property
  error: `Method '${String(prop)}' does not exist on apiV2`,
  args: { method: String(prop), options }
})
```

**Both updates**:
1. ✅ Missing method error (WEB-SRV-6)
2. ✅ Proxy catch block error

---

## Benefits

### **1. Better Visibility**
```typescript
// Before - correlationId hidden in args
{
  message: "Error",
  code: "WEB-SRV-4",
  url: "/api/endpoint",
  args: { correlationId: "abc-123", other: "data" }
}

// After - correlationId at top level
{
  message: "Error",
  code: "WEB-SRV-4",
  correlationId: "abc-123",  // Easy to spot!
  url: "/api/endpoint",
  args: { other: "data" }
}
```

### **2. AppSignal Integration**
```typescript
// correlationId now appears as a dedicated tag in AppSignal
tags: {
  type: "error",
  code: "WEB-SRV-4",
  correlationId: "abc-123",  // Dedicated tag for filtering/searching
  url: "/api/endpoint",
  args: "{\"other\":\"data\"}"
}
```

### **3. Cleaner args Object**
```typescript
// Before - args mixed correlation ID with other data
args: { correlationId, timeout, contentType, responsePreview }

// After - args only contains contextual data
args: { timeout, contentType, responsePreview }
```

---

## Usage Examples

### **Error Reporting**
```typescript
reportError({
  message: errorCodes.message('WEB-SRV-4'),
  code: 'WEB-SRV-4',
  correlationId: 'req-abc-123',  // Top-level
  url: '/api/endpoint',
  error: 'Connection refused',
  args: { timeout: 30000 }
})
```

### **Debug Logging**
```typescript
reportDebug({
  message: 'API request successful',
  correlationId: 'req-abc-123',  // Top-level
  url: '/api/endpoint',
  status: '200',
  args: { dataCount: 42 }
})
```

### **AppSignal Output**
```json
{
  "message": "Unable to connect to backend service. Please try again later.",
  "tags": {
    "type": "error",
    "code": "WEB-SRV-4",
    "correlationId": "req-abc-123",
    "url": "/api/endpoint",
    "args": "{\"timeout\":30000}"
  }
}
```

---

## Advantages

1. ✅ **First-Class Citizen** - correlationId treated as important as code, url, status
2. ✅ **Easy to Filter** - AppSignal can filter/search by correlationId tag directly
3. ✅ **Better Traceability** - Correlation IDs visible at top level in logs
4. ✅ **Cleaner Structure** - args object only contains contextual data
5. ✅ **Consistent Pattern** - Matches other top-level properties (code, url, status)
6. ✅ **TypeScript Support** - Proper typing for correlationId property

---

## Files Modified

1. ✅ `/src/lib/reporter/module.ts`
   - Added `correlationId?` to `Code` interface
   - Added `correlationId` to AppSignal tags

2. ✅ `/src/lib/server/apiV2/helpers.ts`
   - Moved `correlationId` from `args` to top-level in 6 reporter calls

3. ✅ `/src/lib/server/apiV2/api.ts`
   - Moved `correlationId` from `args` to top-level in 2 reporter calls

---

## Migration Pattern

For any future reporter calls, use this pattern:

```typescript
// ✅ Correct
reportError({
  message: 'Error message',
  code: 'ERROR-CODE',
  correlationId: requestId,  // Top-level
  url: '/api/endpoint',
  status: '500',
  error: errorDetails,
  args: { contextualData }
})

// ❌ Incorrect
reportError({
  message: 'Error message',
  code: 'ERROR-CODE',
  url: '/api/endpoint',
  status: '500',
  error: errorDetails,
  args: { correlationId: requestId, contextualData }  // Don't bury it
})
```

---

## Verification

- [x] `correlationId` added to `Code` interface
- [x] `correlationId` added to AppSignal tags
- [x] All helpers.ts reporter calls updated (6 calls)
- [x] All api.ts reporter calls updated (2 calls)
- [x] `correlationId` removed from `args` objects
- [x] TypeScript types updated
- [x] No compilation errors

---

**correlationId is now a first-class property in the reporter!** 🎉
