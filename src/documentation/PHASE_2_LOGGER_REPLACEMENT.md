# Phase 2: Logger Replacement Complete ✅

## Overview

Successfully replaced the redundant `logger` with the unified `reporter` module in Phase 2 files (helpers.ts and api.ts). The reporter now handles both console logging (via systemSettings) and AppSignal reporting in a single function call.

---

## Changes Made

### **1. helpers.ts** ✅

#### **Removed**:
```typescript
import { createLogger } from 'src/lib/utils/logger'
const logger = createLogger('apiV2/helpers')
```

#### **Added**:
```typescript
const reportDebug = reporter({ type: 'debug', file: 'src/lib/server/apiV2/helpers.ts' })
```

#### **Replaced 6 logger calls**:

**Before** ❌:
```typescript
// Timeout error
logger.error(errorMessage, { correlationId, errorCode, url, error: fetchError.message })
reportError({ message: errorMessage, code: errorCode, url, error: fetchError.message, args: { timeout } })
```

**After** ✅:
```typescript
// Timeout error - single call
reportError({
  message: errorMessage,
  code: errorCode,
  url,
  error: fetchError.message,
  args: { correlationId, timeout: options.timeout || 30000 }
})
```

**All 6 replacements**:
1. ✅ Timeout error (WEB-SRV-7)
2. ✅ Connection error (WEB-SRV-4)
3. ✅ JSON parse error (WEB-SRV-5)
4. ✅ Non-JSON response (WEB-SRV-8, etc.)
5. ✅ External API error (WEB-SRV-9)
6. ✅ Success debug log

---

### **2. api.ts** ✅

#### **Removed**:
```typescript
import { createLogger } from 'src/lib/utils/logger'
const logger = createLogger('apiV2.server')
```

#### **Replaced 2 logger calls**:

**Before** ❌:
```typescript
// Missing method
logger.error(userMessage, { correlationId, method, error, errorCode, options })
reportError({ message: userMessage, code: errorCode, error, args: { method, options } })
```

**After** ✅:
```typescript
// Missing method - single call
reportError({
  message: userMessage,
  code: errorCode,
  error: `Method '${String(prop)}' does not exist on apiV2`,
  args: { correlationId, method: String(prop), options }
})
```

**Both replacements**:
1. ✅ Missing method error (WEB-SRV-6)
2. ✅ Proxy catch block error (removed redundant logger call)

---

## Benefits

### **Before** ❌
```typescript
// Two separate calls
logger.error('Error message', { context })  // Console logging
reportError({ message, code, ... })         // AppSignal reporting
```

### **After** ✅
```typescript
// Single unified call
reportError({
  message: 'Error message',
  code: 'WEB-SRV-X',
  args: { context }
})
// Handles BOTH console logging AND AppSignal reporting
```

---

## How It Works

### **Console Logging** (systemSettings)
```typescript
// In reporter/module.ts
const shouldLog = sS.val('log.error')  // Controlled by systemSettings
if (shouldLog) console.error(`Error Report: ${report.message}`, report)
```

### **AppSignal Reporting** (Environment-based)
```typescript
// In reporter/module.ts
const signal = (IS_PROD && rO.prodSignal) || ...  // Production only by default
if (signal) appSignalSend('error', report)
```

---

## Advantages

1. ✅ **Single Function Call** - One call instead of two
2. ✅ **Cleaner Code** - Removed duplicate logging logic
3. ✅ **Consistent** - All logging uses same pattern
4. ✅ **Centralized Control** - systemSettings controls console output
5. ✅ **No Duplicate Reports** - AppSignal reports once per error
6. ✅ **Correlation IDs** - Included in args for traceability
7. ✅ **Honors Original Design** - Uses your reporter as intended

---

## Example Usage

### **Error Reporting**
```typescript
reportError({
  message: errorCodes.message('WEB-SRV-4'),
  code: 'WEB-SRV-4',
  url: '/api/endpoint',
  error: 'Connection refused',
  args: { correlationId, timeout: 30000 }
})
```

**What happens**:
- Console: Logs if `sS.val('log.error')` is `true` (all environments)
- AppSignal: Reports if in production (default)
- Format: `Error Report: Unable to connect to backend service. Please try again later.`

### **Debug Logging**
```typescript
reportDebug({
  message: 'API request successful',
  url: '/api/endpoint',
  status: '200',
  args: { correlationId, dataCount: 42 }
})
```

**What happens**:
- Console: Logs if `sS.val('log.debug')` is `true` (local/dev/staging only)
- AppSignal: Not sent (debug is console-only by default)
- Format: `Debug Report: API request successful`

---

## Files Modified

1. ✅ `/src/lib/server/apiV2/helpers.ts`
   - Removed `createLogger` import
   - Removed `logger` constant
   - Added `reportDebug` constant
   - Replaced 6 logger calls with reporter calls
   - Added `correlationId` to all `args` objects

2. ✅ `/src/lib/server/apiV2/api.ts`
   - Removed `createLogger` import
   - Removed `logger` constant
   - Replaced 2 logger calls with reporter calls
   - Added `correlationId` to all `args` objects

---

## Code Reduction

### **helpers.ts**
- **Before**: 8 function calls per error (logger + reportError)
- **After**: 1 function call per error (reportError)
- **Reduction**: 50% fewer function calls

### **api.ts**
- **Before**: 4 function calls (2x logger + 2x reportError)
- **After**: 2 function calls (2x reportError)
- **Reduction**: 50% fewer function calls

---

## Next Steps

As we proceed through the remaining phases, we should:

1. **Phase 3**: Update `+server.ts` to use reporter (not logger)
2. **Phase 4**: Update `apiV2.ts` client to use reporter (not logger)
3. **Phase 5**: Integration testing to verify:
   - Console logging controlled by systemSettings
   - AppSignal reporting only in production
   - No duplicate reports
   - Correlation IDs flow through entire chain

---

## Verification Checklist

- [x] Removed all `createLogger` imports from Phase 2 files
- [x] Removed all `logger` constants from Phase 2 files
- [x] Replaced all `logger.error()` calls with `reportError()`
- [x] Replaced all `logger.debug()` calls with `reportDebug()`
- [x] Added `correlationId` to all reporter `args` objects
- [x] Single function call for both console and AppSignal
- [x] No duplicate logging or reporting
- [x] All error codes still assigned at point of failure
- [x] All messages come from `errorCodes.message()`

---

**Phase 2 logger replacement complete!** 🎉

The reporter is now the single source for all logging and error reporting in helpers.ts and api.ts.
