# buildArgs Centralized ✅

## Changes Made

### **1. reporter/module.ts** ✅

**Added centralized `buildArgs` function**:
```typescript
// Build args object with only defined values (filters out undefined/null)
export const buildArgs = (options?: Record<string, any>) => {
	if (!options) return undefined
	const args: Record<string, any> = {}
	if (options.id !== undefined && options.id !== null) args.id = options.id
	if (options.attributes !== undefined && options.attributes !== null) args.attributes = options.attributes
	if (options.filter !== undefined && options.filter !== null) args.filter = options.filter
	if (options.limit !== undefined && options.limit !== null) args.limit = options.limit
	if (options.page !== undefined && options.page !== null) args.page = options.page
	return Object.keys(args).length > 0 ? args : undefined
}
```

**AppSignal already handles args**:
```typescript
// Line 123 in appSignalSend
if (report?.args) tags.args = JSON.stringify(report.args)
```

---

### **2. helpers.ts** ✅

**Removed duplicate `_buildArgs`**:
```typescript
// REMOVED local _buildArgs function

// ADDED import
import { reporter, buildArgs } from 'src/lib/reporter/module'
```

**Updated all 6 calls**:
```typescript
// All reporter calls now use:
args: buildArgs(options)
```

---

### **3. api.ts** ✅

**Removed duplicate `_buildArgs`**:
```typescript
// REMOVED local _buildArgs function

// ADDED import
import { reporter, buildArgs } from 'src/lib/reporter/module'
```

**Updated both calls**:
```typescript
// Both reporter calls now use:
const args = buildArgs(options)
reportError({
  // ...
  args: args ? { ...args, method: String(prop) } : { method: String(prop) }
})
```

---

## Benefits

### **1. No Code Duplication** ✅
- Single source of truth for building args
- Consistent behavior across all files
- Easy to maintain and update

### **2. Centralized in Reporter** ✅
- Makes sense conceptually - args are for reporting
- Can be imported anywhere it's needed
- Reporter module already handles args in AppSignal tags

### **3. Clean Exports** ✅
```typescript
// From reporter/module.ts
export const buildArgs = (options?: Record<string, any>) => { ... }
export const reporter = (o?: Options) => { ... }
```

---

## Usage

### **In helpers.ts and api.ts**:
```typescript
import { reporter, buildArgs } from 'src/lib/reporter/module'

const reportError = reporter({ type: 'error', file: 'myfile.ts' })

// Use buildArgs to filter out undefined/null values
reportError({
  message: 'Error occurred',
  code: 'WEB-SRV-4',
  correlationId,
  url,
  error: errorMessage,
  args: buildArgs(options)  // Only includes defined values
})
```

### **In api.ts (with method name)**:
```typescript
const args = buildArgs(options)
reportError({
  message: 'Method not found',
  code: 'WEB-SRV-6',
  correlationId,
  error: `Method '${String(prop)}' does not exist`,
  args: args ? { ...args, method: String(prop) } : { method: String(prop) }
})
```

---

## AppSignal Output

**With values**:
```json
{
  "tags": {
    "type": "error",
    "code": "WEB-SRV-4",
    "correlationId": "req-123",
    "url": "/api/orders",
    "args": "{\"id\":42,\"filter\":{\"status\":\"active\"}}"
  }
}
```

**Without values**:
```json
{
  "tags": {
    "type": "error",
    "code": "WEB-SRV-6",
    "correlationId": "req-456",
    "args": "{\"method\":\"skusOrderedByCompany\"}"
  }
}
```

**No args at all** (if buildArgs returns undefined):
```json
{
  "tags": {
    "type": "error",
    "code": "WEB-SRV-4",
    "correlationId": "req-789"
    // No args property
  }
}
```

---

## Files Modified

1. ✅ `/src/lib/reporter/module.ts`
   - Added `buildArgs` export
   - Already handles `args` in AppSignal tags (line 123)

2. ✅ `/src/lib/server/apiV2/helpers.ts`
   - Removed local `_buildArgs`
   - Imported `buildArgs` from reporter
   - Updated all 6 reporter calls

3. ✅ `/src/lib/server/apiV2/api.ts`
   - Removed local `_buildArgs`
   - Imported `buildArgs` from reporter
   - Updated both reporter calls

---

**buildArgs is now centralized in the reporter module!** 🎯
