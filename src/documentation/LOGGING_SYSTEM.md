# Logging System Architecture

## Overview

The application now has a unified logging system that combines structured logging with production error tracking.

## Components

### 1. Logger (`/src/lib/utils/logger.ts`)

**Primary logging interface** for all application code.

```typescript
import { createLogger } from 'src/lib/utils/logger'

const logger = createLogger('myModule')

logger.info('User logged in', { userId: '123', correlationId })
logger.error('API call failed', { correlationId, error, statusCode: 500 })
```

**Features:**
- Structured log format with timestamps
- Correlation ID support
- Module tracking
- Environment-aware (skips debug logs in production)
- Automatic AppSignal integration for errors/warnings

**Log Levels:**
- `debug` - Development debugging (hidden in production)
- `info` - General information
- `warn` - Warnings (sent to AppSignal in production)
- `error` - Errors (sent to AppSignal in production)

### 2. Reporter (`/src/lib/reporter/module.ts`)

**AppSignal integration** for production error tracking.

- Registers itself with the logger system
- Automatically sends errors/warnings to AppSignal in production
- Maintains backward compatibility with existing reporter API
- Adds rich metadata (tags, context, correlation IDs)

### 3. Correlation IDs (`/src/lib/utils/correlationId.ts`)

**Request tracking** across the entire stack.

Every API request gets a unique correlation ID that flows through:
1. Client → 2. SvelteKit endpoint → 3. Server API → 4. Backend API

All logs and errors include the correlation ID for easy tracing.

## Usage Patterns

### API Calls

```typescript
// Client (apiV2.ts)
const correlationId = generateCorrelationId()
logger.error('API request failed', { 
  correlationId, 
  name: 'products',
  error: error.message 
})
```

### Server-Side

```typescript
// Server (helpers.ts)
logger.info('API request completed', {
  correlationId,
  method: 'GET',
  url: '/api/products',
  status: 200
})
```

### Error Reporting

```typescript
// Errors automatically go to AppSignal in production
logger.error('Payment processing failed', {
  correlationId,
  userId,
  amount,
  error: error.message
})
```

## Log Format

### Console Output
```
[2024-12-05T23:30:00.000Z] [ERROR] [apiV2] API request failed (1701234567890-a3f9c2)
```

### Structured Data
```json
{
  "timestamp": "2024-12-05T23:30:00.000Z",
  "level": "error",
  "location": "client",
  "module": "apiV2",
  "message": "API request failed",
  "correlationId": "1701234567890-a3f9c2",
  "name": "products",
  "error": "Request timeout"
}
```

## Migration Guide

### Old Code (Reporter)
```typescript
const reportError = reporter({type:'error', file:'src/lib/apiV2.ts'})

reportError({
  error,
  location: 'api.catch',
  message: 'API Error',
  args: { name, ...options }
})
```

### New Code (Logger)
```typescript
const logger = createLogger('apiV2')

logger.error('API Error', {
  correlationId,
  location: 'api.catch',
  name,
  error: error.message,
  ...options
})
```

## Benefits

1. **Unified Interface** - Single logging API across the application
2. **Correlation Tracking** - Trace requests end-to-end with correlation IDs
3. **Production Ready** - Automatic AppSignal integration
4. **Structured** - Consistent format for log aggregation
5. **Environment Aware** - Different behavior in dev/staging/production
6. **Backward Compatible** - Existing reporter still works

## Environment Behavior

| Level | Local | Dev/Staging | Production |
|-------|-------|-------------|------------|
| debug | ✅ Console | ✅ Console | ❌ Hidden |
| info | ✅ Console | ✅ Console | ✅ Console |
| warn | ✅ Console | ✅ Console | ✅ Console + AppSignal |
| error | ✅ Console | ✅ Console | ✅ Console + AppSignal |

## Future Enhancements

- Add log sampling for high-volume endpoints
- Integrate with additional services (Sentry, LogRocket, etc.)
- Add performance metrics logging
- Implement log rotation for server-side logs
