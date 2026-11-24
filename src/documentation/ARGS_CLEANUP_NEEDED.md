# args Cleanup Required ✅

## Issue

The `args` property in reporter calls currently contains diagnostic/contextual metadata instead of only the actual API request parameters.

## What `args` Should Contain

**Only API request parameters** that were passed to the API call:
- `id` - Resource ID
- `attributes` - Data being created/updated
- `filter` - Query filters
- `limit` - Pagination limit
- `page` - Page number
- `sort` - Sort parameters
- `join` - Include relationships

## What `args` Should NOT Contain

**Diagnostic/contextual data** (these should be top-level properties or removed):
- ❌ `timeout` - This is a system setting, not request data
- ❌ `contentType` - This is response metadata
- ❌ `responsePreview` - This is response data
- ❌ `errorTitle` - This is error metadata
- ❌ `dataCount` - This is response metadata
- ❌ `errors` - This is error metadata
- ❌ `originalError` - This is error metadata

## Required Changes in helpers.ts

### **1. Timeout Error (Line ~433-446)**
```typescript
// BEFORE
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  error: fetchError.message,
  args: { timeout: options.timeout || 30000 }  // ❌ Wrong
})

// AFTER
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  error: fetchError.message,
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

### **2. Connection Error (Line ~454-474)**
```typescript
// BEFORE
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  error: fetchError.message || String(fetchError)
  // No args at all
})

// AFTER
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  error: fetchError.message || String(fetchError),
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

### **3. JSON Parse Error (Line ~495-504)**
```typescript
// BEFORE
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: parseError.message,
  args: { contentType }  // ❌ Wrong
})

// AFTER
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: parseError.message,
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

### **4. Non-JSON Response (Line ~560-574)**
```typescript
// BEFORE
reportError({
  message: errorCodeMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: errorDetail,
  args: {
    contentType,          // ❌ Wrong
    errorTitle,           // ❌ Wrong
    responsePreview: ...  // ❌ Wrong
  }
})

// AFTER
reportError({
  message: errorCodeMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: errorDetail,
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

### **5. External API Error (Line ~619-632)**
```typescript
// BEFORE
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: error[0]?.detail || error[0]?.title || errorMessage,
  args: {
    errors: error,              // ❌ Wrong
    originalError: error[0]...  // ❌ Wrong
  }
})

// AFTER
reportError({
  message: errorMessage,
  code: errorCode,
  correlationId,
  url,
  status: status.toString(),
  error: error[0]?.detail || error[0]?.title || errorMessage,
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

### **6. Success Debug Log (Line ~648-658)**
```typescript
// BEFORE
reportDebug({
  message: 'API request successful',
  correlationId,
  url,
  status: status.toString(),
  args: {
    dataCount: Array.isArray(data) ? data.length : (data ? 1 : 0)  // ❌ Wrong
  }
})

// AFTER
reportDebug({
  message: 'API request successful',
  correlationId,
  url,
  status: status.toString(),
  args: {
    id: options?.id,
    attributes: options?.attributes,
    filter: options?.filter,
    limit: options?.limit,
    page: options?.page
  }
})
```

---

## Purpose of `args`

The `args` property should allow you to see **what data was sent in the API request** so you can:

1. **Reproduce the error** - Know exactly what parameters caused the issue
2. **Debug data issues** - See if invalid data was passed
3. **Track request patterns** - Understand what filters/queries are being used

### Example AppSignal Output

**Before** ❌:
```json
{
  "tags": {
    "code": "WEB-SRV-5",
    "correlationId": "req-123",
    "url": "/api/orders",
    "args": "{\"contentType\":\"text/html\"}"  // Not helpful!
  }
}
```

**After** ✅:
```json
{
  "tags": {
    "code": "WEB-SRV-5",
    "correlationId": "req-123",
    "url": "/api/orders",
    "args": "{\"id\":\"42\",\"attributes\":{\"status\":\"shipped\"}}"  // Helpful!
  }
}
```

Now you can see that the request was trying to update order #42 with status "shipped" when the error occurred.

---

## Implementation Note

**File needs to be manually fixed** - The multi_edit tool created errors and duplicated code. The file `/src/lib/server/apiV2/helpers.ts` needs to be manually reviewed and corrected to apply these changes properly.

---

**Once fixed, all `args` will contain only the actual API request parameters!** 🎯
