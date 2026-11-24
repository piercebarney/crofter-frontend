# Error Code System

## Overview

The error code system provides user-friendly error messages for backend error codes. When the backend returns an error with a `code` field, the system automatically maps it to a human-readable message.

## Backend Error Format

The backend returns errors in JSON:API format with error codes:

```json
{
  "errors": [
    {
      "code": "ORD-CRT-1",
      "detail": "Missing delivery address for delivery fulfillment",
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "422",
      "title": "Missing Delivery Address"
    }
  ]
}
```

## Frontend Processing

### 1. Error Code Mapping

**File**: `/src/lists/error-codes.ts`

Defines user-friendly messages for each error code:

```typescript
{
  id: 'ORD-CRT-1',
  message: 'Please provide a delivery address for delivery orders.'
}
```

### 2. Hybrid Processing (Client + Server)

**Architecture**: Errors are processed in two places for different purposes:

#### Server-Side (`/src/lib/server/apiV2/helpers.ts`)
**Purpose**: Logging and monitoring

The `_processErrors()` function:
1. Processes backend errors for server-side logging
2. Sends user-friendly messages to AppSignal
3. Provides context for debugging server issues

#### Client-Side (`/src/lib/apiV2.ts`)
**Purpose**: User display and frontend error handling

The `processErrors()` function:
1. Processes ALL errors (backend + frontend)
2. Final error formatting for UI display
3. Handles client-specific error codes
4. Works for any API system, not just apiV2

### 3. Why Both?

**Server Processing**:
- ✅ Better logging with user-friendly messages
- ✅ AppSignal gets meaningful error context
- ✅ Server-side rendering (SSR) error messages

**Client Processing**:
- ✅ Universal error handling for all APIs
- ✅ Can add frontend-only error codes
- ✅ Consistent UX across the application
- ✅ Works with direct fetch calls, WebSockets, etc.

### 3. Error Structure After Processing

```typescript
{
  code: "ORD-CRT-1",
  message: "Please provide a delivery address for delivery orders.",  // ← User-friendly
  title: "Missing Delivery Address",                                   // ← Original (for debugging)
  detail: "Missing delivery address for delivery fulfillment",         // ← Original (for debugging)
  originalTitle: "Missing Delivery Address",                           // ← Preserved
  originalDetail: "Missing delivery address for delivery fulfillment", // ← Preserved
  status: "422",
  id: "550e8400-e29b-41d4-a716-446655440000"
}
```

## Error Code Categories

### Backend Error Codes

#### Account Errors (ACT-*)
- `ACT-USR-1` - User account processing errors
- `ACT-IMP-1` - Impersonation errors

#### Order Creation Errors (ORD-CRT-*)
- `ORD-CRT-0` - General order creation failure
- `ORD-CRT-1` - Missing delivery address
- `ORD-CRT-2` - Order processing error
- `ORD-CRT-3` - Invalid order configuration
- `ORD-CRT-4` - Order creation failure

#### Order Ready Errors (ORD-RDY-*)
- `ORD-RDY-1` - Cannot mark order as ready
- `ORD-RDY-2` - Order status update failure
- `ORD-RDY-3` - Invalid order state
- `ORD-RDY-4` - Order update failure

#### Payment Errors (PMT-CHG-*)
- `PMT-CHG-1` - Payment processing failure
- `PMT-CHG-2` - Payment method error

### Frontend Error Codes (Future)

When adding frontend-specific error codes, use the `FE-` prefix:

#### Network Errors (FE-NET-*)
- `FE-NET-1` - Network connection lost
- `FE-NET-2` - Request timeout
- `FE-NET-3` - Too many requests

#### Validation Errors (FE-VAL-*)
- `FE-VAL-1` - Invalid form data
- `FE-VAL-2` - Required field missing
- `FE-VAL-3` - Invalid format

#### Storage Errors (FE-STR-*)
- `FE-STR-1` - Local storage full
- `FE-STR-2` - Session expired
- `FE-STR-3` - Cache error

## Usage in Components

### Displaying Errors

```typescript
// Error object from API
const error = {
  code: "ORD-CRT-1",
  message: "Please provide a delivery address for delivery orders.",
  status: "422"
}

// Display to user
<p>{error.message}</p>  // Shows user-friendly message
```

### Fallback Behavior

If an error code is not found in the mapping:
- The original `title` and `detail` from the backend are used
- No `message` field is added
- Error is returned as-is

## Adding New Error Codes

### Backend Error Codes

1. **Get error code from backend team**
   - Format: `CATEGORY-ACTION-NUMBER`
   - Example: `ORD-CRT-1`

2. **Add to `/src/lists/error-codes.ts`**
   ```typescript
   {
     id: 'ORD-CRT-1',
     message: 'Please provide a delivery address for delivery orders.'
   }
   ```

3. **Test the error**
   - Trigger the error condition
   - Verify user-friendly message appears
   - Check that original details are preserved

### Frontend Error Codes

1. **Define error code**
   - Format: `FE-CATEGORY-NUMBER`
   - Example: `FE-NET-1`

2. **Add to `/src/lists/error-codes.ts`**
   ```typescript
   {
     id: 'FE-NET-1',
     message: 'Network connection lost. Please check your internet connection.'
   }
   ```

3. **Create error in your code**
   ```typescript
   // Example: Network timeout in apiV2.ts
   if (error.name === 'AbortError') {
     throw {
       code: 'FE-NET-2',
       title: 'Request Timeout',
       detail: 'The request took too long to complete',
       status: '408'
     }
   }
   ```

4. **Error gets processed automatically**
   - `processErrors()` in `apiV2.ts` maps the code
   - User sees: "Request timed out. Please try again."
   - Original error preserved for debugging

## Best Practices

### Writing Error Messages

✅ **Good**:
- "Please provide a delivery address for delivery orders."
- "Payment processing failed. Please check your payment method."
- "Unable to create order. Please try again."

❌ **Avoid**:
- Technical jargon: "Validation failed on delivery_address field"
- Error codes: "ORD-CRT-1"
- Blame: "You didn't provide an address"

### Message Guidelines

1. **Be specific** - Tell users what went wrong
2. **Be actionable** - Suggest what they can do
3. **Be friendly** - Use conversational tone
4. **Be concise** - Keep messages short and clear

## Debugging

### Viewing Original Errors

The system preserves original backend errors:

```typescript
console.log(error.originalTitle)   // Backend's title
console.log(error.originalDetail)  // Backend's detail
console.log(error.code)            // Error code
```

### Checking Error Processing

Look for logs in the browser console:
```
[2024-12-05T23:50:00.000Z] [ERROR] [apiV2/helpers] API request failed
{
  correlationId: "1701234567890-a3f9c2",
  error: [...],
  status: 422
}
```

## Future Enhancements

- [ ] Add i18n support for multi-language error messages
- [ ] Create error code documentation generator
- [ ] Add error analytics tracking
- [ ] Implement error recovery suggestions
