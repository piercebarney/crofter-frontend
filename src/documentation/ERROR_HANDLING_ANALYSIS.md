# Comprehensive Error Handling Analysis
**Crofter Web Application**  
*Generated: January 7, 2026*

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Error Handling Categories](#error-handling-categories)
3. [User-Facing Error Messages](#user-facing-error-messages)
4. [Silent Failures (Console Only)](#silent-failures-console-only)
5. [API & Server Error Handling](#api--server-error-handling)
6. [Client-Side Error Handling](#client-side-error-handling)
7. [Recommendations](#recommendations)

---

## Executive Summary

This document provides a comprehensive analysis of all error handling mechanisms in the Crofter web application's `/src` directory. Error handling is categorized by:

- **User-Facing**: Errors displayed to users via Alert modals or inline error messages
- **Silent Failures**: Errors logged to console but not shown to users
- **API Errors**: Server-side and API communication error handling
- **Client Errors**: Browser/client-side error handling

**Confidence Levels:**
- 🟢 **High**: Definitely error handling (95%+ confidence)
- 🟡 **Medium**: Likely error handling (70-95% confidence)
- 🟠 **Low**: Possibly error handling (50-70% confidence)

---

## Error Handling Categories

### 1. User-Facing Error Messages (system) √

#### 1.1 Alert Modal System (system) √
**Location**: `src/features/modules/modal/`

The application uses a modal-based alert system for displaying errors to users.

##### Alert Modal Implementation
**File**: `src/features/modules/modal/modals/alert.svelte`  
**Confidence**: 🟢 High

```typescript
// Alert structure
{
  type: 'info' | 'warning' | 'error' | 'success',
  title?: string,
  message: string,
  buttons?: {
    accept?: string,
    deny?: string
  }
}
```

**Usage Pattern**:
```typescript
modal.open('alert', {
  alert: {
    type: 'error',
    title: 'Error Title',
    message: 'Error message to user'
  }
})
```

##### Alert Modal Store
**File**: `src/features/modules/modal/store/helpers.ts`  
**Confidence**: 🟢 High

- Manages alert state (`alert.open`, `alert.data`, `alert.closing`)
- Provides `modal.alert()` method for programmatic alerts
- Handles alert lifecycle and callbacks

---

#### 1.2 Payment Error Alerts (system) √
**File**: `src/stores/company/orderHelpers.ts`  
**Confidence**: 🟢 High

**Surfaces to User**: ✅ Yes

##### Payment Processing Errors (Lines 107-113)
```typescript
if (error) {
  const alert = paymentAlert
  if (error?.message) alert.message = error.message
  modal.open('alert', {alert})
}
```
**User Impact**: Payment failures are shown via alert modal with error message.

##### Order Status Update Errors (Lines 249-256, 283-290)
```typescript
if (error) {
  const alert = paymentAlert
  alert.message = alert.message.replace('ERROR_MESSAGE', ` (${error.message})`)
  modal.open('alert', {alert})
} else modal.open('alert', {alert:statusAlert})
```
**User Impact**: Order status change failures shown to user.

##### Order Completion Errors (Lines 335-340)
```typescript
if (error) {
  if (orderStatuses.name(newStatus) == 'ready') modal.open('alert', {alert:paymentAlert})
  else modal.open('alert', {alert:statusAlert})
}
```
**User Impact**: Order completion errors displayed via alert.

---

#### 1.3 Navigation Confirmation Alerts (system) √
**File**: `src/lib/nav.ts`  
**Confidence**: 🟢 High

**Surfaces to User**: ✅ Yes (Warning, not error)

##### Unsaved Changes Warning (Lines 37-42)
```typescript
const alertPromise = new Promise((resolve) => modal.open('alert', {
  alert: {
    ...backAlert, 
    resolve,
    message: "You have unsaved changes..."
  }
}))
```
**User Impact**: Warns users before navigation with unsaved changes.

---

#### 1.4 Link Confirmation Alerts (system) √
**File**: `src/components/elements/a.svelte`  
**Confidence**: 🟢 High

**Surfaces to User**: ✅ Yes (Confirmation, not error)

##### Link Action Confirmation (Lines 63-68)
```typescript
e.preventDefault()
const alertPromise = new Promise((resolve) => 
  modal.open('alert', {alert:{...alert, resolve}})
)
alertPromise.then(() => actions())
```
**User Impact**: Shows confirmation before executing link actions.

---

#### 1.5 Inline Error Messages (system) √

##### Authentication Pages
**Files**: 
- `src/routes/(app)/(auth)/(user)/login/+page.svelte`
- `src/routes/(app)/(auth)/(user)/sign-up/+page.svelte`
- `src/routes/(app)/(auth)/(user)/forgot/+page.svelte`
- `src/routes/(app)/(auth)/(user)/reset/+page.svelte`

**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes

All auth pages pass `error` prop to their components:
```svelte
<Login error={form?.error || data?.error} />
<SignUp error={form?.error} />
<Forgot error={form?.error} />
<Reset error={form?.error} />
```

**User Impact**: Form validation and authentication errors displayed inline.

---

#### 1.6 Admin Portal Error Messages (ignore) √
**Files**: 
- `src/features/groups/admin/pages/portal/units/company/unit.svelte`
- `src/features/groups/admin/pages/portal/units/user/unit.svelte`
- `src/features/groups/admin/pages/portal/units/product/unit.svelte`

**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes

Uses `messageUpdate()` to display inline error messages:

##### Company Unit Errors
```typescript
// Role update error (Lines 88-93)
if (roleError) {
  console.error('company: update role error', roleError)
  messageUpdate('company-lookup', { 
    message: 'Server Error: Could not update role', 
    type: 'error' 
  })
}

// ZiftId update error (Lines 110-115)
if (ziftIdError) {
  console.error('company: update ziftId error', ziftIdError)
  messageUpdate('company-lookup', { 
    message: 'Server Error: Could not update ziftId', 
    type: 'error' 
  })
}

// Product addition error (Lines 142-147)
if (error) {
  console.error('company: update product error', error)
  messageUpdate('company-lookup', { 
    message: 'Server Error: Could not add product', 
    type: 'error' 
  })
}

// Fetch all companies error (Lines 179-184)
if (error) {
  console.error('company: fetch all error', error)
  messageUpdate('company-all', { 
    message: 'Server Error: Could not fetch companies', 
    type: 'error' 
  })
}

// Fetch company error (Lines 216-221)
if (error) {
  console.error('company: fetch error', error)
  messageUpdate('company-lookup', { 
    message: 'Server Error: Could not fetch company', 
    type: 'error' 
  })
}
```

##### User Unit Errors
```typescript
// Role update error (Lines 49-54)
if (roleError) {
  console.error('user: update role error', roleError)
  messageUpdate('user-lookup', { 
    message: 'Server Error: Could not update role', 
    type: 'error' 
  })
}

// User fetch error (Lines 80-85)
if (error) {
  console.error('user: fetch error', error)
  messageUpdate('user-lookup', { 
    message: 'Server Error: Could not fetch user', 
    type: 'error' 
  })
}
```

##### Product Unit Errors
```typescript
// Active status update error (Lines 61-66)
if (activeError) {
  console.error('product: update active error', activeError)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not update active', 
    type: 'error' 
  })
}

// Fulfillment update error (Lines 91-96)
if (fulfillmentError) {
  console.error('product: update fulfillment error', fulfillmentError)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not update fulfillment', 
    type: 'error' 
  })
}

// Distributor update error (Lines 119-124)
if (error) {
  console.error('product: update distributor error', error)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not update distributor', 
    type: 'error' 
  })
}

// Distribution location update error (Lines 151-156)
if (error) {
  console.error('product: update distributor location error', error)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not update distribution location', 
    type: 'error' 
  })
}

// Product deletion error (Lines 180-185)
if (error) {
  console.error('product: delete error', error)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not delete product', 
    type: 'error' 
  })
}

// Fetch all products error (Lines 219-223)
if (error) {
  console.error('product: fetch all error', error)
  messageUpdate('product-lookup', { 
    message: 'Server Error: Could not fetch products', 
    type: 'error' 
  })
}
```

**User Impact**: Admin users see inline error messages for all CRUD operations.

---

### 2. Silent Failures (Console Only)

These errors are logged but NOT shown to users. **Recommendation: Review each to determine if user notification is needed.**

---

#### 2.1 API & Network Errors

##### API V2 Client
**File**: `src/lib/apiV2.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Console + AppSignal only)

**Should Surface**: ⚠️ Depends on context

```typescript
// Timeout errors (Lines 347-375)
catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    const isTimeout = true
    const errorCode = isTimeout ? 'WEB-NET-2' : 'WEB-API-5'
    const abortError = errorCodes.object(errorCode)
    const processedError = processErrors([abortError])[0]
    
    const errorReport: ErrorReport = {
      error: processedError,
      location: isTimeout ? 'api.timeout' : 'api.cancelled',
      message: processedError.message || 'Request aborted',
      correlationId,
      args: buildArgs(options)
    }
    
    const errorMessage = reportError(errorReport)
    throw new Error(typeof errorMessage === 'string' ? errorMessage : processedError.message)
  }
}

// Network/fetch errors (Lines 377-417)
reportDebug({
  message: 'API request failed',
  correlationId,
  error: error instanceof Error ? error.message : String(error),
  args: { name: name.toString() }
})

const errorCode = 'WEB-NET-1'
const errorDetail = error instanceof Error ? error.message : String(error)
const networkError = errorCodes.object(errorCode)
const processedError = processErrors([networkError])[0]

const errorReport: ErrorReport = {
  error: processedError,
  location: 'api.network',
  message: processedError.message || errorDetail,
  correlationId,
  args: buildArgs(options)
}

const errorMessage = reportError(errorReport)
throw new Error(typeof errorMessage === 'string' ? errorMessage : processedError.message || 'API Error')
```

**Current Behavior**: Errors are thrown and logged to AppSignal but may not reach user.  
**Recommendation**: ⚠️ Critical API failures should show user-friendly error messages.

---

##### Legacy API Client
**File**: `src/lib/api.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ⚠️ Yes, if still in use

```typescript
// API errors (Lines 115-128)
catch (error) {
  const errorReport: ErrorReport = {
    action,
    location: 'api.catch',
    message: error instanceof Error ? error.message : String(error),
    args: { action, ...options }
  }
  
  const errorMessage = reportError(errorReport)
  throw new Error(typeof errorMessage === 'string' ? errorMessage : 'API Error')
}
```

**Recommendation**: ⚠️ If this is still used, errors should be surfaced to users.

---

#### 2.2 Storage Errors

**File**: `src/lib/storage.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Returns error in response object)

**Should Surface**: ⚠️ Depends on operation criticality

```typescript
// setActive error (Lines 70-72)
catch (e:any) {
  response.error = 'setActive: ' + e.message
}

// getActive error (Lines 101-103)
catch (e:any) {
  response.error = 'getActive: ' + e.message
}

// getActive reset error (Lines 132-134)
catch(e:any) {
  response.error = 'getActive: ' + e.message
}

// getData error (Lines 171-173)
catch (e:any) {
  response.error = 'getData: ' + e.message
}

// getData parse error (Lines 216-218)
catch(e:any) {
  response.error = 'getData: ' + e.message
}

// setData error (Lines 268-270)
catch(e:any) {
  response.error = 'setData: ' + e.message
}

// Error logging (Line 44)
if (response.error && response.message != 'not in browser') {
  console.error('LS ERROR', response)
}
```

**Current Behavior**: Errors returned in response object, logged to console.  
**Recommendation**: ⚠️ Critical storage failures (cart data, user preferences) should notify users.

---

#### 2.3 Cart Synchronization Errors

**File**: `src/features/groups/consumer/modules/cart/store.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Stored in `syncError` state)

**Should Surface**: ⚠️ Yes, for critical cart operations

```typescript
// Cart sync failure (Lines 822-829)
catch (error) {
  console.error('Cart sync failed:', error)
  
  update((v:Cart) => {
    v.syncError = error instanceof Error ? error : new Error(String(error))
    return v
  })
}

// Cart storage sync failure (Lines 891-897)
catch (error) {
  // console.error('Cart storage sync failed:', error)
  v.syncError = error instanceof Error ? error : new Error(String(error))
}

// Checkout totals calculation error (Lines 1453-1458)
if (error) {
  response.error = error
  // console.error('processCheckoutTotal', error)
  return response
}
```

**Current Behavior**: Errors stored in state but not displayed to user.  
**Recommendation**: ⚠️ **Critical** - Cart sync failures should notify users, especially during checkout.

---

#### 2.4 Checkout Page Errors

**File**: `src/features/groups/consumer/pages/checkout/segments/place-order/segment.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Console only)

**Should Surface**: ⚠️ **Yes - Critical**

```typescript
// Cart sync before totals calculation (Lines 193-196)
catch (err) {
  console.error('Cart sync failed before calculating totals:', err)
  // Sets totalsError = true but no user message
}
```

**Current Behavior**: Error logged, `totalsError` flag set, but no user notification.  
**Recommendation**: 🚨 **Critical** - Users must know if checkout totals can't be calculated.

---

#### 2.5 Email Sending Errors

##### Zip Code Email
**File**: `src/features/groups/consumer/pages/home/units/zip-code/unit.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ⚠️ Possibly

```typescript
// Email send failure (Lines 82-87)
if (!response.ok) console.error('Failed to send email:', response.statusText)

catch (error) {
  console.error('Error sending email:', error)
}
```

**Recommendation**: ⚠️ User should know if their zip code notification request failed.

---

#### 2.6 Service Worker Errors

**File**: `src/hooks.client.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Reported to AppSignal)

**Should Surface**: ❌ No (Background operation)

```typescript
// Service worker registration error (Lines 48-56)
catch (error) {
  reportError({
    location: 'service_worker',
    message: 'Service worker registration failed',
    args: { error: error instanceof Error ? error.message : String(error) }
  })
}

// Capacitor initialization error (Lines 76-84)
.catch(error => {
  reportError({
    location: 'capacitor',
    message: 'Capacitor initialization failed',
    args: { error: error instanceof Error ? error.message : String(error) }
  })
})
```

**Recommendation**: ✅ Correct - Background failures don't need user notification.

---

#### 2.7 Capacitor Plugin Errors

**File**: `src/lib/capacitor/index.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ❌ No (Non-critical UI enhancements)

```typescript
// Status bar configuration error (Lines 67-69)
catch (statusBarError) {
  console.error('Error configuring status bar:', statusBarError)
}

// Splash screen error (Lines 77-79)
.catch((err: unknown) => {
  console.error('Error hiding splash screen:', err)
})

// Plugin initialization error (Lines 82-84)
catch (error: unknown) {
  console.error('Error initializing Capacitor plugins:', error)
}
```

**Recommendation**: ✅ Correct - Non-critical native features don't need user notification.

---

#### 2.8 Third-Party Integration Errors

##### Tawk.to Integration
**File**: `src/features/layouts/app/helpers.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ❌ No (Non-critical feature)

```typescript
// Tawk visitor data error (Lines 163-173)
tawkApi.setAttributes(attributes, (error: any) => {
  if (error) console.error('Error setting Tawk visitor attributes:', error)
})

catch (err) {
  console.error('Error in updateTawkVisitorData:', err)
}
```

**Recommendation**: ✅ Correct - Chat widget failures don't need user notification.

##### Zapier UTM Tracking
**File**: `src/features/layouts/app/helpers.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ❌ No (Analytics tracking)

```typescript
// Zapier UTM send error (Lines 473-475)
catch (error) {
  console.error('Error sending UTM data to Zapier:', error)
}
```

**Recommendation**: ✅ Correct - Analytics failures don't need user notification.

##### Klaviyo Hero Loading
**File**: `src/features/groups/consumer/pages/home/units/hero/unit.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ⚠️ Partial (Shows fallback)

**Should Surface**: ✅ Already handled

```typescript
// Klaviyo load timeout (Lines 91-95)
if (!klaviyoLoaded) {
  console.warn('Klaviyo hero failed to load after 10s')
  showFallback = true
}
```

**Recommendation**: ✅ Correct - Shows fallback UI to user.

---

#### 2.9 Component Import Errors

**File**: `src/components/elements/select.svelte`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ❌ No

**Should Surface**: ⚠️ Possibly (Component won't work)

```typescript
// Select data import error (Line 30)
.catch(() => console.error('Could not import select data from', `/src/lists/${list}.ts`))
```

**Recommendation**: ⚠️ If select component fails to load data, user should see an error or disabled state.

---

#### 2.10 Data Parsing Errors

**File**: `src/features/partials/store-hours.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Falls back to defaults)

**Should Surface**: ❌ No (Has fallback)

```typescript
// JSON parse errors (Lines 33-38)
if (typeof parsed === 'object' && parsed !== null) weeklyHours = parsed
else console.error('Parsed openHours is not an object', parsed)

catch (e) {
  console.error('Failed to parse openHours as JSON', e)
}
```

**Recommendation**: ✅ Correct - Falls back to default hours.

---

#### 2.11 Modal Component Loading

**File**: `src/features/modules/modal/store.ts`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ❌ No

**Should Surface**: ⚠️ Possibly (Modal won't work)

```typescript
// Modal name parsing error (Lines 21-25)
if (parse) return [parse[1], svelteModule.default]

console.error('Could not get name for modal at', path)
return []
```

**Recommendation**: ⚠️ If modal fails to load, user should see an error or the modal shouldn't open.

---

#### 2.12 Application Loading Timeout

**File**: `src/features/groups/company/producer/pages/application/shop-details.svelte`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ❌ No

**Should Surface**: ⚠️ Yes

```typescript
// Application not found (Lines 107-111)
if (i > 10) {
  console.error('application not found')
  clearInterval(check)
}
```

**Recommendation**: ⚠️ User should know if application data fails to load.

---

#### 2.13 Layout Data Loading Errors

**File**: `src/features/layouts/app/layout.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Console warning)

**Should Surface**: ⚠️ Depends on severity

```typescript
// Layout errors (Lines 33-38)
if (layoutErrors && layoutErrors.length > 0) {
  console.warn('Layout data loading errors:', layoutErrors)
  // Report to AppSignal in production (commented out)
}
```

**Recommendation**: ⚠️ Critical layout data failures (locations, products) may need user notification.

---

#### 2.14 Service Worker Detection

**File**: `src/features/layouts/app/layout.svelte`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ❌ No

**Should Surface**: ❌ No (Graceful degradation)

```typescript
// Service worker not found (Line 115)
else console.error('serviceWorker not found')
```

**Recommendation**: ✅ Correct - App works without service worker.

---

#### 2.15 Asset Fetch Duplicate Prevention

**File**: `src/features/layouts/app/helpers.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

**Should Surface**: ❌ No (Developer warning)

```typescript
// Duplicate fetch warning (Lines 81-85)
if (listenerActive) {
  console.warn('assetHelpers.fetch() already active')
  return () => {}
}
```

**Recommendation**: ✅ Correct - Developer-facing warning.

---

#### 2.16 Cart Initialization Timeout

**File**: `src/features/groups/consumer/layouts/checkout.svelte`  
**Confidence**: 🟢 High  
**Surfaces to User**: ⚠️ Partial (Page refresh)

**Should Surface**: ⚠️ Better UX needed

```typescript
// Cart init timeout (Lines 40-61)
const safetyTimeout = setTimeout(() => {
  console.warn('Cart initialization timeout - refreshing page')
  
  const reportError = reporter({type:'error', file:'/src/features/groups/consumer/layouts/checkout.svelte'})
  
  reportError({
    message: 'Cart initialization timeout - refreshing page',
    args: {
      checkout: $c.checkout,
      count: $c.count,
      initialized: $c.initialized
    },
    location: 'afterNavigate',
    raw: {
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled
    }
  })
  
  window.location.reload()
}, 3 * 1000)
```

**Current Behavior**: Automatically refreshes page after 3 seconds.  
**Recommendation**: ⚠️ Show loading indicator or error message before forcing refresh.

---

### 3. API & Server Error Handling

#### 3.1 API V2 Endpoint Handler

**File**: `src/routes/api/v2/+server.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### JSON Parse Error (Lines 48-64)
```typescript
catch (parseError: any) {
  const errorCode = 'WEB-SRV-5'
  const errorObj = errorCodes.object(errorCode)
  
  reportError({
    message: errorObj.message,
    code: errorCode,
    correlationId,
    error: parseError.message
  })
  
  return addNoCacheHeaders(json({
    success: false,
    error: [errorObj],
    status: 400
  }), correlationId || undefined)
}
```

**User Impact**: Client receives structured error response.

##### Endpoint Not Found (Lines 66-85)
```typescript
if (!endpoint) {
  const errorCode = 'WEB-SRV-4'
  const errorObj = errorCodes.object(errorCode)
  
  reportError({
    message: errorObj.message,
    code: errorCode,
    correlationId,
    error: `API endpoint '${name}' does not exist`,
    args: { endpoint: name }
  })
  
  return addNoCacheHeaders(json({
    success: false,
    error: [errorObj],
    status: 404
  }), correlationId || undefined)
}
```

**User Impact**: Client receives 404 error response.

##### Unexpected Server Error (Lines 105-122)
```typescript
catch (unexpectedError: any) {
  const errorCode = 'WEB-SRV-1'
  const errorObj = errorCodes.object(errorCode)
  
  reportError({
    message: errorObj.message,
    code: errorCode,
    correlationId,
    error: unexpectedError.message || String(unexpectedError)
  })
  
  return addNoCacheHeaders(json({
    success: false,
    error: [errorObj],
    status: 500
  }), correlationId || undefined)
}
```

**User Impact**: Client receives 500 error response.

---

#### 3.2 Server-Side API Helpers

**File**: `src/lib/server/apiV2/helpers.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### Fetch Timeout (Lines 398-401)
```typescript
catch (fetchError) {
  clearTimeout(timeoutId)
  throw fetchError
}
```

##### Network Error (Lines 427-493)
```typescript
catch (fetchError: any) {
  if (fetchError instanceof Error && fetchError.name === 'AbortError') {
    // Handle timeout with proper response format
    const errorCode = 'WEB-SRV-2'
    const errorObj = errorCodes.object(errorCode)
    
    return {
      ok: false,
      status: 408,
      statusText: 'Request Timeout',
      json: async () => ({
        errors: [errorObj]
      })
    }
  }
  throw fetchError
}
```

##### JSON Parse Error (Lines 498-520)
```typescript
catch (parseError: any) {
  const errorCode = 'WEB-SRV-5'
  const errorObj = errorCodes.object(errorCode)
  
  error = [errorObj]
  data = null
}
```

##### Structured Error Throwing (Lines 640-650)
```typescript
const apiError: any = new Error(errorMessage)
apiError.code = errorCode
apiError.status = status
apiError.errors = error
apiError.correlationId = correlationId

throw apiError
```

**User Impact**: Errors propagate to client with structured format.

---

#### 3.3 Server-Side API Proxy

**File**: `src/lib/server/apiV2/api.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### Circuit Breaker Error (Lines 107-127)
```typescript
if (!gracefulErrors) throw new Error(errorObj.message)

return {
  data: null,
  error: [errorObj],
  success: false,
  status: 500,
  apiError: {
    type: String(prop),
    message: errorObj.message,
    code: errorCode,
    correlationId
  }
}
```

##### API Call Error (Lines 150-208)
```typescript
catch (error: any) {
  const correlationId = options?.correlationId
  
  const errorInfo = {
    type: error.code || 'unknown',
    message: error.message || 'API request failed',
    code: error.code || 'WEB-SRV-3',
    correlationId
  }
  
  return {
    data: null,
    error: error.errors || [errorInfo],
    success: false,
    status: error.status || 500,
    apiError: errorInfo
  }
}
```

**User Impact**: Graceful error responses returned to client.

---

#### 3.4 GraphQL Client Helpers

**File**: `src/lib/server/clientHelpers.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### Query Building Error (Lines 414-430)
```typescript
catch (error:any) {
  let message: any
  
  if (error instanceof Error) message = error.message
  else message = String(error)
  
  result.error = {
    type: 'query_build_error',
    message,
    code: 'GQL-001'
  }
}
```

##### Retryable Request Error (Lines 616-635)
```typescript
catch (error:any) {
  if (isRetryableError(error) && attempt < maxRetries) {
    // Retry logic
  } else {
    // Final error after retries
    result.error = {
      type: error.type || 'unknown',
      message: error.message || 'Request failed',
      code: error.code || 'GQL-999'
    }
  }
}
```

**User Impact**: GraphQL errors returned with structured format.

---

#### 3.5 Email API Endpoint

**File**: `src/routes/api/send-email/+server.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### Validation Error (Line 13)
```typescript
if (!to || !subject || !message) {
  return json({ error: 'Missing required fields: to, subject, message' }, { status: 400 })
}
```

##### MailChannels API Error (Lines 55-59)
```typescript
if (!response.ok) {
  const errorData = await response.text()
  console.error('MailChannels error response:', errorData)
  throw new Error(`MailChannels API error: ${response.status} - ${errorData}`)
}
```

##### General Email Error (Lines 66-70)
```typescript
catch (error) {
  console.error('Error sending email:', error)
  return json({ error: 'Failed to send email' }, { status: 500 })
}
```

**User Impact**: Email failures returned as API errors.

---

#### 3.6 Zapier Webhook Endpoint

**File**: `src/routes/api/zapier/utm/+server.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ✅ Yes (via API response)

##### Configuration Error (Lines 22-25)
```typescript
if (!env.ZAPIER_ACCOUNT_ID || !env.UTM_ZAP_HOOK_ID) {
  console.error('Zapier environment variables not configured')
  return json({ error: 'Service not configured' }, { status: 503 })
}
```

##### Webhook Failure (Lines 35-40)
```typescript
if (!response.ok) {
  console.error('Zapier webhook failed:', response.status)
  return json({ error: 'Failed to send data to Zapier' }, { status: 500 })
}
```

##### General Error (Lines 44-48)
```typescript
catch (error) {
  console.error('Error in Zapier UTM endpoint:', error)
  return json({ error: 'Internal server error' }, { status: 500 })
}
```

**User Impact**: Webhook errors returned as API errors.

---

### 4. Client-Side Error Handling

#### 4.1 Global Error Handler

**File**: `src/hooks.client.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Reported to AppSignal)

**Should Surface**: ⚠️ Depends on error type

```typescript
export const handleError: HandleClientError = ({ error, event }) => {
  const message = 'An unexpected error occurred'
  
  // Error handling logic
}
```

**Recommendation**: ⚠️ Some client errors should show user-friendly messages.

---

#### 4.2 Utility Error Handling

##### Logger Utility
**File**: `src/lib/utils/logger.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

```typescript
// Reporter failure (Lines 111-114)
catch (err) {
  console.error('Failed to send to external reporter:', err)
}
```

**Recommendation**: ✅ Correct - Internal logging failures don't need user notification.

##### Circuit Breaker
**File**: `src/lib/utils/circuitBreaker.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Returns error in response)

```typescript
// Operation failure (Lines 107-110)
catch (error) {
  this.onFailure(correlationId, error)
  throw error
}
```

**Recommendation**: ✅ Correct - Circuit breaker errors propagate to caller.

##### Retry Utility
**File**: `src/lib/utils/retry.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No (Throws after retries)

```typescript
// Retry exhausted (Lines 48-50)
catch (error: any) {
  lastError = error
  // Continues retry loop or throws
}
```

**Recommendation**: ✅ Correct - Retry errors propagate to caller.

---

#### 4.3 Reporter/AppSignal Integration

##### AppSignal Server
**File**: `src/lib/reporter/appsignal-server.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

```typescript
// AppSignal init error (Lines 17-19)
catch (error: any) {
  console.error('Failed to initialize server-side AppSignal:', error)
}
```

**Recommendation**: ✅ Correct - Reporter initialization failures logged only.

##### Reporter Module
**File**: `src/lib/reporter/module.ts`  
**Confidence**: 🟢 High  
**Surfaces to User**: ❌ No

```typescript
// AppSignal send error (Lines 180-182)
catch (error: any) {
  console.error('Error sending AppSignal report:', error)
}

// Error report logging (Line 218)
if (shouldLog) console.error(`Error Report: ${report.message}`, report)
```

**Recommendation**: ✅ Correct - Reporter errors logged only.

---

#### 4.4 Image Upload Module

**File**: `src/features/modules/image-upload/store.ts`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ⚠️ Unknown (need to see full implementation)

**Should Surface**: ⚠️ Likely yes (user-initiated action)

*Note: Only found try/catch reference, need to examine full file for error handling.*

---

#### 4.5 Impersonation Store

**File**: `src/stores/impersonation.ts`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ⚠️ Unknown (need to see full implementation)

**Should Surface**: ⚠️ Possibly (admin feature)

*Note: Only found try/catch reference, need to examine full file for error handling.*

---

#### 4.6 PWA Install Handler

**File**: `src/lib/pwa/install-handler.ts`  
**Confidence**: 🟡 Medium  
**Surfaces to User**: ⚠️ Unknown (need to see full implementation)

**Should Surface**: ❌ Likely no (optional feature)

*Note: Only found try/catch reference, need to examine full file for error handling.*

---

### 5. Recommendations

#### 5.1 Critical Issues Requiring User Notification

🚨 **High Priority**

1. **Cart Synchronization Failures** (`src/features/groups/consumer/modules/cart/store.ts`)
   - Currently: Errors stored in `syncError` state but not shown
   - Impact: Users unaware of cart data loss
   - Recommendation: Show alert modal when sync fails during critical operations

2. **Checkout Totals Calculation Failure** (`src/features/groups/consumer/pages/checkout/segments/place-order/segment.svelte`)
   - Currently: Console error only, `totalsError` flag set
   - Impact: Users may see incorrect totals or can't complete checkout
   - Recommendation: Display error message and disable checkout button

3. **Cart Initialization Timeout** (`src/features/groups/consumer/layouts/checkout.svelte`)
   - Currently: Auto-refreshes page after 3 seconds
   - Impact: Poor UX, users confused by sudden refresh
   - Recommendation: Show loading indicator, then error message with manual retry option

---

#### 5.2 Important Issues Requiring User Notification

⚠️ **Medium Priority**

4. **API Timeout/Network Errors** (`src/lib/apiV2.ts`)
   - Currently: Thrown errors, logged to AppSignal
   - Impact: Users may not know why actions failed
   - Recommendation: Show user-friendly error messages for network failures

5. **Storage Failures** (`src/lib/storage.ts`)
   - Currently: Errors in response object, console logged
   - Impact: Silent data loss for cart, preferences
   - Recommendation: Notify users when critical data can't be saved

6. **Email Send Failures** (`src/features/groups/consumer/pages/home/units/zip-code/unit.svelte`)
   - Currently: Console error only
   - Impact: Users think notification was sent
   - Recommendation: Show success/error message after submission

7. **Component Loading Failures**
   - Select component (`src/components/elements/select.svelte`)
   - Modal component (`src/features/modules/modal/store.ts`)
   - Currently: Console errors only
   - Impact: Components don't work, users confused
   - Recommendation: Show error state or disable component

8. **Application Data Loading Timeout** (`src/features/groups/company/producer/pages/application/shop-details.svelte`)
   - Currently: Console error only
   - Impact: Page appears broken
   - Recommendation: Show loading error with retry option

---

#### 5.3 Correctly Handled (No Changes Needed)

✅ **Properly Handled**

9. **Service Worker Failures** - Background operation, graceful degradation
10. **Capacitor Plugin Errors** - Non-critical native features
11. **Third-Party Integration Failures** (Tawk, Zapier, Klaviyo) - Non-critical features with fallbacks
12. **Reporter/AppSignal Errors** - Internal logging, doesn't affect users
13. **Circuit Breaker Errors** - Properly propagated to callers
14. **Admin Portal Errors** - Already showing inline error messages

---

#### 5.4 Error Handling Best Practices

**Standardization Recommendations:**

1. **Create Error Display Service**
   ```typescript
   // src/lib/errorHandler.ts
   export const errorHandler = {
     // Show user-friendly error
     show: (error: any, context?: string) => {
       const userMessage = getUserFriendlyMessage(error, context)
       modal.open('alert', {
         alert: {
           type: 'error',
           title: 'Error',
           message: userMessage
         }
       })
     },
     
     // Log error without showing
     log: (error: any, context?: string) => {
       console.error(context, error)
       reportError({ error, location: context })
     },
     
     // Show error and log
     showAndLog: (error: any, context?: string) => {
       this.show(error, context)
       this.log(error, context)
     }
   }
   ```

2. **Error Message Mapping**
   - Create user-friendly messages for common error codes
   - Map technical errors to actionable user messages
   - Include recovery suggestions when possible

3. **Consistent Error States**
   - Use consistent error state patterns across components
   - Standardize error display components
   - Provide retry mechanisms for recoverable errors

4. **Error Boundaries**
   - Implement Svelte error boundaries for component failures
   - Graceful degradation for non-critical features
   - Fallback UI for critical component failures

5. **Error Monitoring**
   - Ensure all critical errors reach AppSignal
   - Add correlation IDs for error tracking
   - Monitor error rates and patterns

---

## Summary Statistics

### Error Handling Distribution

- **Total Error Handling Instances**: 51+ try/catch blocks
- **User-Facing Errors**: ~15 instances
- **Silent Failures**: ~30 instances
- **API/Server Errors**: ~10 instances

### User Notification Status

- ✅ **Properly Surfaced**: ~20 instances
- ⚠️ **Should Surface**: ~12 instances (Critical: 3, Important: 9)
- ❌ **Correctly Silent**: ~19 instances

### Priority Actions

1. 🚨 **3 Critical** issues requiring immediate attention
2. ⚠️ **9 Important** issues requiring user notification
3. ✅ **19 Correctly handled** silent failures

---

## Appendix: Error Code System

The application uses a structured error code system defined in `src/lists/error-codes.ts`:

### Error Code Categories

- **WEB-SRV-X**: Server-side errors
  - `WEB-SRV-1`: Unexpected server error
  - `WEB-SRV-2`: Request timeout
  - `WEB-SRV-3`: API request failed
  - `WEB-SRV-4`: Endpoint not found
  - `WEB-SRV-5`: JSON parse error

- **WEB-NET-X**: Network errors
  - `WEB-NET-1`: Network error
  - `WEB-NET-2`: Request timeout

- **WEB-API-X**: API errors
  - `WEB-API-5`: Request cancelled

- **GQL-XXX**: GraphQL errors
  - `GQL-001`: Query build error
  - `GQL-999`: Unknown GraphQL error

Each error code maps to user-friendly messages via the `errorCodes.object()` method.

---

*End of Analysis*
