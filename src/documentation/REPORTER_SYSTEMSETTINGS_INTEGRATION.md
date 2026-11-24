# Reporter + systemSettings Integration ✅

## Overview

Successfully integrated `systemSettings` with the `reporter` module to provide centralized control over console logging while maintaining environment-based AppSignal reporting.

---

## Changes Made

### **1. systemSettings.json** ✅

Added two new logging controls:

```json
{
  "log": {
    "debug": {"deny": ["prod"]},      // Existing
    "info": {"deny": ["prod"]},        // NEW - Controls info logging
    "error": {"allow": ["all"]},       // Existing
    "signal": {"deny": ["prod"]}       // NEW - Controls signal logging
  }
}
```

**Behavior by Environment**:

| Setting | Local | Dev/Staging | Prod |
|---------|-------|-------------|-------------------|
| `log.debug` | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| `log.info` | ✅ Enabled | ✅ Enabled | ❌ Disabled |
| `log.error` | ✅ Enabled | ✅ Enabled | ✅ Enabled |
| `log.signal` | ✅ Enabled | ✅ Enabled | ❌ Disabled |

---

### **2. systemSettings.ts** ✅

Added corresponding settings to the store:

```typescript
log: {
  debug: {
    value: false,
    valueType: 'boolean',
    conditions: settingsConfig.log.debug,
    evaluator: 'envCheck'
  },
  info: {
    value: false,
    valueType: 'boolean',
    conditions: settingsConfig.log.info,
    evaluator: 'envCheck'
  },
  error: {
    value: false,
    valueType: 'boolean',
    conditions: settingsConfig.log.error,
    evaluator: 'envCheck'
  },
  signal: {
    value: false,
    valueType: 'boolean',
    conditions: settingsConfig.log.signal,
    evaluator: 'envCheck'
  }
}
```

---

### **3. reporter/module.ts** ✅

Integrated systemSettings for console logging control:

#### **Before** ❌
```typescript
const error = (o:Options, r:ErrorReport, rO?: ReportOptions) => {
  // Complex environment-based logic for console logging
  const log = (o.log || rO.log) && (
    (IS_PROD && (o.prodLog || rO.prodLog)) || 
    (IS_DEV && (o.devLog || rO.devLog)) || 
    (IS_LOCAL && (o.localLog || rO.localLog))
  )
  
  if (log) console.error(`Error Report: ${report.message}`, report)
}
```

#### **After** ✅
```typescript
const error = (o:Options, r:ErrorReport, rO?: ReportOptions) => {
  // Simple systemSettings check for console logging
  const shouldLog = sS.val('log.error')
  
  if (shouldLog) console.error(`Error Report: ${report.message}`, report)
  
  // AppSignal still uses environment-based logic
  if (signal) appSignalSend('error', report)
}
```

**Updated all 4 reporter types**:
- ✅ `error()` - Uses `sS.val('log.error')`
- ✅ `debug()` - Uses `sS.val('log.debug')`
- ✅ `signal()` - Uses `sS.val('log.signal')`
- ✅ `info()` - Uses `sS.val('log.info')`

---

## How It Works

### **Console Logging** (systemSettings)

```typescript
// Controlled by systemSettings
const shouldLog = sS.val('log.error')  // true in all envs
const shouldLog = sS.val('log.debug')  // false in prod, true elsewhere
```

**Benefits**:
- ✅ Centralized control in `systemSettings.json`
- ✅ Easy to change per environment
- ✅ Consistent with rest of application
- ✅ Can be toggled at runtime (if needed)

### **AppSignal Reporting** (Environment-based)

```typescript
// Still environment-based (production only by default)
const signal = (IS_PROD && rO.prodSignal) || 
               (IS_DEV && rO.devSignal) || 
               (IS_LOCAL && rO.localSignal)
```

**Benefits**:
- ✅ Prevents dev/local errors from flooding AppSignal
- ✅ Can be overridden per call if needed
- ✅ Production-first approach

---

## Usage Examples

### **Error Reporting** (Console + AppSignal)

```typescript
const reportError = reporter({ type: 'error', file: 'myfile.ts' })

reportError({
  message: 'API request failed',
  code: 'WEB-SRV-4',
  url: '/api/endpoint',
  error: 'Connection refused'
})
```

**What happens**:
- Console: Logs if `sS.val('log.error')` is `true` (all environments)
- AppSignal: Reports if in production (default behavior)

### **Debug Logging** (Console only)

```typescript
const reportDebug = reporter({ type: 'debug', file: 'myfile.ts' })

reportDebug({
  message: 'Processing data',
  args: { count: 42 }
})
```

**What happens**:
- Console: Logs if `sS.val('log.debug')` is `true` (local/dev/staging only)
- AppSignal: Not sent (debug is console-only by default)

### **Info Logging** (Console only)

```typescript
const reportInfo = reporter({ type: 'info', file: 'myfile.ts' })

reportInfo({
  message: 'User logged in',
  args: { userId: 123 }
})
```

**What happens**:
- Console: Logs if `sS.val('log.info')` is `true` (local/dev/staging only)
- AppSignal: Never sent (info is console-only)

### **Signal Reporting** (Console + AppSignal)

```typescript
const reportSignal = reporter({ type: 'log', file: 'myfile.ts' })

reportSignal({
  message: 'Important event occurred'
})
```

**What happens**:
- Console: Logs if `sS.val('log.signal')` is `true` (local/dev/staging only)
- AppSignal: Reports if in production (default behavior)

---

## Override Options

You can still override the default behavior per call:

```typescript
// Force AppSignal in dev environment
reportError({
  message: 'Critical error',
  code: 'WEB-SRV-1'
}, {
  devSignal: true  // Override: send to AppSignal even in dev
})

// Force AppSignal for debug (normally console-only)
reportDebug({
  message: 'Important debug info'
}, {
  signal: true,
  prodSignal: true  // Override: send to AppSignal in production
})
```

---

## Benefits of This Approach

1. ✅ **Single Source of Truth** - systemSettings controls console logging
2. ✅ **Centralized Configuration** - All settings in one JSON file
3. ✅ **Environment-Aware** - Different behavior per environment
4. ✅ **Flexible** - Can override per call if needed
5. ✅ **Consistent** - Uses same pattern as rest of app
6. ✅ **Clean Code** - Removed complex conditional logic
7. ✅ **Production-Safe** - AppSignal only in production by default

---

## Next Steps

Now that reporter is integrated with systemSettings, we can:

1. **Remove logger from helpers.ts and api.ts**
   - Replace `logger.error()` with `reportError()`
   - Replace `logger.debug()` with `reportDebug()`
   - Single call for both console and AppSignal

2. **Simplify error handling code**
   - One function call instead of two
   - Cleaner, more maintainable code

3. **Consistent logging across app**
   - All logging uses reporter
   - All controlled by systemSettings

---

## Configuration Reference

### **systemSettings.json**

```json
{
  "log": {
    "debug": {"deny": ["prod"]},        // Console debug logs
    "info": {"deny": ["prod"]},         // Console info logs
    "error": {"allow": ["all"]},        // Console error logs
    "signal": {"deny": ["prod"]}        // Console signal logs
  }
}
```

### **Environment Values**

- `"local"` - Local development
- `"dev"` - Development server
- `"staging"` - Staging server
- `"prod"` - Production

### **Condition Syntax**

- `{"allow": ["local", "dev"]}` - Only these environments
- `{"deny": ["prod"]}` - All except these
- `{"allow": ["all"]}` - All environments
- `{"deny": ["all"]}` - No environments

---

**Reporter is now fully integrated with systemSettings!** 🎉
