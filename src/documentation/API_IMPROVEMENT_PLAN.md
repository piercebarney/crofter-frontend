# API System Improvement Plan

## Overview
This document outlines improvements to enhance robustness and efficiency of the API system across three layers:
- Client Layer: `/src/lib/apiV2.ts`
- Server Endpoint: `/src/routes/api/v2/+server.ts`
- Server Helpers: `/src/lib/server/apiV2/helpers.ts`

---

## Phase 1: Critical Robustness Improvements

### 1.1 Add Request Timeout and Abort Handling
**Priority:** High  
**Impact:** Prevents hanging requests, improves UX  
**Effort:** Low (2-3 hours)

**Implementation:**
```typescript
// In apiV2.ts
const TIMEOUT_MS = 30000 // 30 seconds

const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

try {
	const response = await doFetch(url, {
		...options,
		signal: controller.signal
	})
} catch (error) {
	if (error.name === 'AbortError') {
		throw new Error('Request timeout - please try again')
	}
	throw error
} finally {
	clearTimeout(timeoutId)
}
```

**Files to modify:**
- `/src/lib/apiV2.ts` (lines 90-107)
- `/src/lib/server/apiV2/helpers.ts` (line 336)

**Testing:**
- Simulate slow backend responses
- Verify timeout triggers correctly
- Ensure cleanup happens on success/failure

---

### 1.2 Implement Retry Logic with Exponential Backoff
**Priority:** High  
**Impact:** Handles transient network failures gracefully  
**Effort:** Medium (4-5 hours)

**Implementation:**
```typescript
// New utility: /src/lib/utils/retry.ts
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	options = {
		maxRetries: 3,
		initialDelay: 1000,
		maxDelay: 10000,
		backoffMultiplier: 2,
		retryableStatuses: [408, 429, 500, 502, 503, 504]
	}
): Promise<T> {
	let lastError: Error
	
	for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
		try {
			return await fn()
		} catch (error) {
			lastError = error
			
			// Don't retry on client errors (4xx except specific ones)
			if (error.status && !options.retryableStatuses.includes(error.status)) {
				throw error
			}
			
			if (attempt < options.maxRetries) {
				const delay = Math.min(
					options.initialDelay * Math.pow(options.backoffMultiplier, attempt),
					options.maxDelay
				)
				await new Promise(resolve => setTimeout(resolve, delay))
			}
		}
	}
	
	throw lastError
}
```

**Files to modify:**
- Create `/src/lib/utils/retry.ts`
- Update `/src/lib/apiV2.ts` to wrap fetch calls
- Update `/src/lib/server/apiV2/helpers.ts` for server-side retries

**Configuration:**
- Make retry behavior configurable per API call
- Add option to disable retries for mutations (POST/PATCH/DELETE)

**Testing:**
- Mock intermittent network failures
- Verify backoff timing
- Ensure non-retryable errors fail immediately

---

### 1.3 Add Request Deduplication
**Priority:** High  
**Impact:** Reduces unnecessary backend load, improves performance  
**Effort:** Medium (3-4 hours)

**Implementation:**
```typescript
// In apiV2.ts
const inflightRequests = new Map<string, Promise<ApiResponse>>()

function getRequestKey(name: string, options: ApiOptions): string {
	// Create stable hash of request parameters
	return `${name}:${JSON.stringify(options, Object.keys(options).sort())}`
}

// In proxy get handler:
const requestKey = getRequestKey(name as string, options)

if (inflightRequests.has(requestKey)) {
	return inflightRequests.get(requestKey)
}

const requestPromise = (async () => {
	try {
		// ... existing fetch logic
	} finally {
		inflightRequests.delete(requestKey)
	}
})()

inflightRequests.set(requestKey, requestPromise)
return requestPromise
```

**Files to modify:**
- `/src/lib/apiV2.ts` (lines 40-175)

**Considerations:**
- Only deduplicate GET requests (not mutations)
- Add TTL for cache entries (e.g., 5 seconds)
- Provide option to bypass deduplication

**Testing:**
- Fire multiple identical requests simultaneously
- Verify only one backend call is made
- Ensure all callers receive the response

---

## Phase 2: Performance Optimizations

### 2.1 Optimize Case Conversion with Memoization
**Priority:** Medium  
**Impact:** Reduces CPU overhead on every request  
**Effort:** Low (2 hours)

**Implementation:**
```typescript
// In helpers.ts
const caseConversionCache = new Map<string, string>()
const MAX_CACHE_SIZE = 1000

function memoizedSnakeToCamel(str: string): string {
	if (caseConversionCache.has(str)) {
		return caseConversionCache.get(str)!
	}
	
	const result = snakeToCamelCase(str)
	
	if (caseConversionCache.size < MAX_CACHE_SIZE) {
		caseConversionCache.set(str, result)
	}
	
	return result
}

// Similar for camelToSnake
```

**Files to modify:**
- `/src/lib/server/apiV2/helpers.ts` (update all case conversion calls)
- `/src/lib/helpers.ts` (if case conversion functions are there)

**Metrics:**
- Measure cache hit rate
- Monitor memory usage
- Benchmark before/after performance

---

### 2.2 Remove Redundant Cache Headers
**Priority:** Low  
**Impact:** Cleaner code, minimal performance gain  
**Effort:** Low (30 minutes)

**Implementation:**
```typescript
// In apiV2.ts - Remove client-side cache headers
const response = await doFetch(url, {
	method: 'POST',
	body: JSON.stringify({ name, options, _t: Date.now() }),
	headers: { 
		'content-type': 'application/json'
		// Remove: Cache-Control, Pragma, Expires
	},
	cache: 'no-store' // Keep this
})
```

**Files to modify:**
- `/src/lib/apiV2.ts` (lines 98-103)

**Rationale:**
- POST requests aren't cached by browsers anyway
- Server-side headers are sufficient
- Reduces request header size

---

### 2.3 Replace Manual Cookie Parsing
**Priority:** Low  
**Impact:** Cleaner code, slightly better performance  
**Effort:** Low (1 hour)

**Implementation:**
```typescript
// In apiV2.ts - Simpler cookie parsing
function getCookie(name: string): string | null {
	return document.cookie
		.split('; ')
		.find(row => row.startsWith(`${name}=`))
		?.split('=')[1] ?? null
}
```

**Files to modify:**
- `/src/lib/apiV2.ts` (lines 47-74)

**Alternative:**
- Consider using a tiny cookie library (js-cookie ~2KB)
- Or extract to shared utility function

---

## Phase 3: Observability & Resilience

### 3.1 Add Error Correlation IDs
**Priority:** Medium  
**Impact:** Dramatically improves debugging  
**Effort:** Medium (3-4 hours)

**Implementation:**
```typescript
// New utility: /src/lib/utils/correlation.ts
export function generateCorrelationId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// In apiV2.ts
const correlationId = generateCorrelationId()

const response = await doFetch(url, {
	// ...
	headers: {
		'content-type': 'application/json',
		'x-correlation-id': correlationId
	}
})

// Pass through all layers
// Include in error reports
```

**Files to modify:**
- Create `/src/lib/utils/correlation.ts`
- `/src/lib/apiV2.ts` (add to headers)
- `/src/routes/api/v2/+server.ts` (pass through)
- `/src/lib/server/apiV2/helpers.ts` (add to backend requests)
- `/src/lib/reporter/module.ts` (include in error reports)

**Benefits:**
- Track requests across all layers
- Correlate client errors with server logs
- Essential for production debugging

---

### 3.2 Implement Structured Logging
**Priority:** Medium  
**Impact:** Better production debugging, log aggregation  
**Effort:** Medium (4-5 hours)

**Implementation:**
```typescript
// New utility: /src/lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
	correlationId?: string
	userId?: string
	endpoint?: string
	[key: string]: any
}

export const logger = {
	debug: (message: string, context?: LogContext) => log('debug', message, context),
	info: (message: string, context?: LogContext) => log('info', message, context),
	warn: (message: string, context?: LogContext) => log('warn', message, context),
	error: (message: string, context?: LogContext) => log('error', message, context)
}

function log(level: LogLevel, message: string, context?: LogContext) {
	const entry = {
		timestamp: new Date().toISOString(),
		level,
		message,
		...context
	}
	
	// Development: pretty print
	if (import.meta.env.DEV) {
		console[level === 'debug' ? 'log' : level](message, context)
	} else {
		// Production: structured JSON for log aggregation
		console.log(JSON.stringify(entry))
	}
}
```

**Files to modify:**
- Create `/src/lib/utils/logger.ts`
- Replace all `console.log` in:
  - `/src/lib/apiV2.ts`
  - `/src/lib/server/apiV2/helpers.ts`

**Configuration:**
- Add log level filtering (env variable)
- Consider integration with logging service (Sentry, LogRocket, etc.)

---

### 3.3 Add Circuit Breaker Pattern
**Priority:** Medium  
**Impact:** Prevents cascade failures during outages  
**Effort:** High (6-8 hours)

**Implementation:**
```typescript
// New utility: /src/lib/utils/circuit-breaker.ts
enum CircuitState {
	CLOSED,  // Normal operation
	OPEN,    // Failing, reject immediately
	HALF_OPEN // Testing if backend recovered
}

export class CircuitBreaker {
	private state = CircuitState.CLOSED
	private failureCount = 0
	private lastFailureTime = 0
	private successCount = 0
	
	constructor(
		private options = {
			failureThreshold: 5,      // Open after 5 failures
			resetTimeout: 60000,      // Try again after 60s
			halfOpenSuccesses: 2      // Close after 2 successes
		}
	) {}
	
	async execute<T>(fn: () => Promise<T>): Promise<T> {
		if (this.state === CircuitState.OPEN) {
			if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
				this.state = CircuitState.HALF_OPEN
				this.successCount = 0
			} else {
				throw new Error('Circuit breaker is OPEN - service unavailable')
			}
		}
		
		try {
			const result = await fn()
			this.onSuccess()
			return result
		} catch (error) {
			this.onFailure()
			throw error
		}
	}
	
	private onSuccess() {
		this.failureCount = 0
		
		if (this.state === CircuitState.HALF_OPEN) {
			this.successCount++
			if (this.successCount >= this.options.halfOpenSuccesses) {
				this.state = CircuitState.CLOSED
			}
		}
	}
	
	private onFailure() {
		this.failureCount++
		this.lastFailureTime = Date.now()
		
		if (this.failureCount >= this.options.failureThreshold) {
			this.state = CircuitState.OPEN
		}
	}
}
```

**Files to modify:**
- Create `/src/lib/utils/circuit-breaker.ts`
- Update `/src/lib/server/apiV2/helpers.ts` to wrap backend calls

**Considerations:**
- One circuit breaker per backend service
- Expose circuit state for monitoring
- Add metrics/alerts when circuit opens

---

## Phase 4: Architecture Evaluation

### 4.1 Evaluate SvelteKit Endpoint Layer Necessity
**Priority:** Low  
**Impact:** Potential architecture simplification  
**Effort:** High (research + implementation if changed)

**Analysis Questions:**
1. **Why does the endpoint exist?**
   - Extracts HTTP-only cookies (security)
   - Validates endpoint existence
   - Adds no-cache headers

2. **Could this be simplified?**
   - Option A: Call helpers directly from `+page.server.ts` load functions
   - Option B: Keep endpoint but streamline
   - Option C: Use SvelteKit form actions for mutations

3. **Trade-offs:**
   - **Current approach:**
     - ✅ Works from any component
     - ✅ Consistent API across client/server
     - ❌ Extra serialization hop
     - ❌ Slightly higher latency
   
   - **Direct helper calls:**
     - ✅ Faster (no extra hop)
     - ✅ Less serialization
     - ❌ Only works in server context
     - ❌ Different patterns for client vs server

**Recommendation:**
- **Keep the endpoint** for now - the convenience outweighs the performance cost
- Document the trade-off clearly
- Consider adding a "direct mode" for server-side only calls
- Revisit if performance becomes a bottleneck

**Documentation to add:**
```markdown
## Why the /api/v2 Endpoint?

This endpoint serves as a secure bridge between client and backend:

1. **Security**: Extracts HTTP-only cookies that client JS cannot access
2. **Consistency**: Same API interface works from components and server
3. **Validation**: Prevents calls to non-existent endpoints

Trade-off: Adds ~10-20ms latency and double serialization.

For server-side only code, you can import helpers directly:
```typescript
import { api } from 'src/lib/server/apiV2/helpers'
const result = await api('products', { token, isMany: true })
```
```

---

## Implementation Timeline

### Sprint 1 (Week 1-2): Critical Robustness
- ✅ Request timeout and abort handling
- ✅ Retry logic with exponential backoff
- ✅ Request deduplication
- **Goal:** Eliminate hanging requests and handle transient failures

### Sprint 2 (Week 3): Performance
- ✅ Case conversion memoization
- ✅ Remove redundant cache headers
- ✅ Simplify cookie parsing
- **Goal:** Reduce CPU overhead and clean up code

### Sprint 3 (Week 4-5): Observability
- ✅ Error correlation IDs
- ✅ Structured logging
- **Goal:** Improve production debugging capabilities

### Sprint 4 (Week 6-7): Resilience
- ✅ Circuit breaker pattern
- ✅ Architecture documentation
- **Goal:** Handle backend outages gracefully

---

## Testing Strategy

### Unit Tests
- Timeout behavior
- Retry logic with mocked failures
- Case conversion cache hits
- Circuit breaker state transitions

### Integration Tests
- End-to-end API calls with real backend
- Correlation ID propagation
- Error handling across layers

### Load Tests
- Concurrent request deduplication
- Circuit breaker under load
- Memory usage with caching

### Manual Testing
- Simulate network failures (Chrome DevTools)
- Test timeout scenarios
- Verify logging output

---

## Metrics to Track

### Before Implementation
- Average request duration
- P95/P99 latency
- Error rate
- Failed request patterns

### After Implementation
- Timeout trigger rate
- Retry success rate
- Cache hit rate (case conversion, deduplication)
- Circuit breaker state changes
- Correlation ID coverage in logs

---

## Rollout Strategy

1. **Feature flags** - Enable improvements gradually
2. **Canary deployment** - Test with small user percentage
3. **Monitoring** - Watch error rates and performance
4. **Rollback plan** - Keep old code paths available
5. **Documentation** - Update team on new patterns

---

## Success Criteria

- ✅ Zero hanging requests (timeout protection)
- ✅ 80%+ retry success rate for transient failures
- ✅ 50%+ reduction in duplicate requests
- ✅ 30%+ improvement in case conversion performance
- ✅ 100% correlation ID coverage in error logs
- ✅ Circuit breaker prevents cascade failures during outages
- ✅ No regression in existing functionality

---

## Future Considerations

### Request Batching
Allow multiple API calls in one HTTP request:
```typescript
await apiV2.batch([
	{ name: 'products', options: {...} },
	{ name: 'skus', options: {...} },
	{ name: 'orders', options: {...} }
])
```

### Response Streaming
For large datasets, stream and process incrementally:
```typescript
for await (const chunk of apiV2.productsStream()) {
	// Process chunk
}
```

### GraphQL Migration
Consider GraphQL for more flexible data fetching:
- Client specifies exact fields needed
- Single request for complex data requirements
- Built-in batching and caching

### Service Worker Caching
Strategic caching for read-only reference data:
- Product catalogs
- Pickup locations
- Static content

---

## Notes

- All improvements maintain backward compatibility
- Existing API calls continue to work unchanged
- New features are opt-in where possible
- Focus on incremental improvements over rewrites
