# Circuit Breaker Enhanced Logging

## Problem

Circuit breaker was opening due to failures but not logging the actual error details, making it impossible to diagnose the root cause.

**Before**:
```
[ERROR] Circuit breaker OPENED - too many failures {
  correlationId: undefined,
  name: 'api',
  failureCount: 5,
  threshold: 5,
  nextAttempt: '2025-12-09T05:33:21.469Z'
}
```

No information about **what** was failing!

---

## Solution

Enhanced the circuit breaker to log error details at every failure point.

### **Changes Made**

**File**: `/src/lib/utils/circuitBreaker.ts`

1. **Updated `onFailure` signature** (line 140)
   - Added `error?: any` parameter
   - Now receives the actual error object

2. **Added error logging to all failure paths**:
   
   **Half-Open Recovery Failure** (lines 151-156):
   ```typescript
   logger.error('Circuit breaker reopened - recovery test failed', {
     correlationId,
     name: this.name,
     nextAttempt: new Date(this.nextAttempt).toISOString(),
     error: error?.message || String(error)  // ← NEW
   })
   ```

   **Threshold Exceeded** (lines 164-171):
   ```typescript
   logger.error('Circuit breaker OPENED - too many failures', {
     correlationId,
     name: this.name,
     failureCount: this.failureCount,
     threshold: this.failureThreshold,
     nextAttempt: new Date(this.nextAttempt).toISOString(),
     lastError: error?.message || String(error)  // ← NEW
   })
   ```

   **Individual Failures** (lines 172-181) - NEW:
   ```typescript
   logger.warn('Circuit breaker failure recorded', {
     correlationId,
     name: this.name,
     failureCount: this.failureCount,
     threshold: this.failureThreshold,
     error: error?.message || String(error)  // ← NEW
   })
   ```

3. **Updated execute method** (line 110)
   - Now passes error to `onFailure(correlationId, error)`

---

## New Logging Output

### **Individual Failures (Before Threshold)**

```
[WARN] Circuit breaker failure recorded {
  correlationId: 'req-abc-123',
  name: 'api',
  failureCount: 1,
  threshold: 5,
  error: 'fetch failed'
}
```

### **Circuit Opens (At Threshold)**

```
[ERROR] Circuit breaker OPENED - too many failures {
  correlationId: 'req-abc-123',
  name: 'api',
  failureCount: 5,
  threshold: 5,
  nextAttempt: '2025-12-09T05:33:21.469Z',
  lastError: 'fetch failed'  ← Shows what caused the circuit to open
}
```

### **Recovery Test Failure**

```
[ERROR] Circuit breaker reopened - recovery test failed {
  correlationId: 'req-abc-123',
  name: 'api',
  nextAttempt: '2025-12-09T05:34:21.469Z',
  error: 'Connection refused'  ← Shows why recovery failed
}
```

---

## Benefits

✅ **Immediate visibility** - See what's failing as it happens  
✅ **Root cause analysis** - Know exactly what error caused the circuit to open  
✅ **Early warning** - Individual failure warnings before circuit opens  
✅ **Recovery debugging** - See why recovery attempts are failing  
✅ **Better monitoring** - Error details flow to AppSignal  

---

## Debugging Workflow

1. **See individual failures** (WARN logs)
   - Identify if it's a pattern or intermittent issue
   - Check error messages for clues

2. **Circuit opens** (ERROR log)
   - `lastError` shows the final straw
   - `failureCount` shows how many failures occurred
   - `nextAttempt` shows when recovery will be attempted

3. **Recovery attempts** (INFO/ERROR logs)
   - HALF_OPEN transition logged
   - Recovery test failures show current error state
   - Success shows when service is back

4. **Circuit closes** (INFO log)
   - Service recovered
   - Normal operation resumed

---

## Example Debugging Session

```
[WARN] Circuit breaker failure recorded {
  error: 'ECONNREFUSED'
}
↓
[WARN] Circuit breaker failure recorded {
  error: 'ECONNREFUSED'
}
↓
[WARN] Circuit breaker failure recorded {
  error: 'ECONNREFUSED'
}
↓
[ERROR] Circuit breaker OPENED - too many failures {
  lastError: 'ECONNREFUSED'
}
```

**Diagnosis**: Backend service is down (connection refused)  
**Action**: Check if backend is running, check network connectivity

---

**Now you'll always know WHY the circuit breaker opened!** 🎉
