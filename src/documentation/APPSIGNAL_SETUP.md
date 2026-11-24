# AppSignal Universal Reporter Setup

## Overview

The reporter module now supports **both client-side and server-side** AppSignal error reporting using a unified API.

---

## Architecture

### **Client-Side (Browser)**
- Uses `@appsignal/javascript`
- Initialized per-request
- Key: `PUBLIC_APPSIGNAL_KEY`

### **Server-Side (Node.js)**
- Uses `@appsignal/nodejs`
- Singleton instance
- Key: `PUBLIC_APPSIGNAL_KEY` (same key)

---

## Environment Variables

### **Required Variables**

Only one key is needed for both client and server:

```bash
# AppSignal Key (works for both client and server)
PUBLIC_APPSIGNAL_KEY=your_appsignal_key_here
```

### **Where to Find Key**

1. Go to [AppSignal Dashboard](https://appsignal.com)
2. Select your app
3. Go to **App Settings** → **Push & Deploy**
4. Copy the **Push API Key**

---

## How It Works

### **Automatic Environment Detection**

```typescript
const reportError = reporter({ type: 'error', file: 'myfile.ts' })

// Same call works everywhere:
reportError({
  message: 'Something went wrong',
  code: 'WEB-SRV-4',
  correlationId: 'req-123',
  error: error.message
})
```

**Client-side**: Sends to AppSignal via JavaScript SDK  
**Server-side**: Sends to AppSignal via Node.js SDK  
**Both**: Console logs based on `systemSettings`

---

## Implementation Details

### **Server-Only Module (Avoiding Vite Bundling Issues)**

```typescript
// reporter/appsignal-server.ts (server-only file)

import { Appsignal } from '@appsignal/nodejs'
import { PUBLIC_APPSIGNAL_KEY } from '$env/static/public'

let appSignalServerInstance: Appsignal | null = null

export function getAppSignalServer(): Appsignal | null {
  if (!appSignalServerInstance && PUBLIC_APPSIGNAL_KEY) {
    appSignalServerInstance = new Appsignal({
      active: true,
      name: 'crofter-webapp',
      pushApiKey: PUBLIC_APPSIGNAL_KEY
    })
  }
  return appSignalServerInstance
}
```

**Why?** The Node.js SDK contains native `.node` files that can't be bundled for the browser. By putting it in a separate file and using dynamic imports, Vite won't try to bundle it for the client.

### **Lazy Loading on Server-Side**

```typescript
// reporter/module.ts (lines 139-156)

if (browser) {
  // Client-side: direct import
  const appsignal = new AppSignalBrowser({ key: PUBLIC_APPSIGNAL_KEY })
  appsignal.sendError(error, ...)
} else {
  // Server-side: lazy load to avoid bundling
  const { getAppSignalServer } = await import('./appsignal-server')
  const appSignalServer = getAppSignalServer()
  if (appSignalServer) {
    const tracer = appSignalServer.tracer()
    tracer.sendError(error, ...)
  }
}
```

### **Unified Sending**

```typescript
// reporter/module.ts (lines 130-178)

const appSignalSend = (type: string, report: any) => {
  // Build tags (same for both)
  const tags = { type, code, correlationId, ... }
  const error = new Error(report.message)
  
  if (browser) {
    // Client-side
    const appsignal = new AppSignalBrowser({ key: PUBLIC_APPSIGNAL_KEY })
    appsignal.sendError(error, span => {
      span.setAction(report.action || report.file)
      span.setTags(tags)
    })
  } else if (appSignalServerInstance) {
    // Server-side
    const tracer = appSignalServerInstance.tracer()
    tracer.sendError(error, span => {
      span.setAction(report.action || report.file)
      span.setTags(tags)
    })
  }
}
```

---

## Files Updated

### **1. reporter/module.ts** ✅
- Added `@appsignal/nodejs` import
- Added server-side key loading
- Added server-side instance initialization
- Updated `appSignalSend()` to support both environments

### **2. app.d.ts** ✅
- Added `APPSIGNAL_PUSH_API_KEY` to private env declarations

### **3. package.json** ✅
- Added `@appsignal/nodejs` dependency

---

## Usage Examples

### **Server-Side (helpers.ts, api.ts, +server.ts)**

```typescript
import { reporter, buildArgs } from 'src/lib/reporter/module'

const reportError = reporter({ type: 'error', file: 'helpers.ts' })

// Automatically sends to AppSignal server-side
reportError({
  message: errorObj.message,
  code: 'WEB-SRV-4',
  correlationId,
  url,
  status: '500',
  error: error.message,
  meta: { contentType, stack: error.stack },
  args: buildArgs(options)
})
```

### **Client-Side (apiV2.ts)**

```typescript
import { reporter, buildArgs } from 'src/lib/reporter/module'

const reportError = reporter({ type: 'error', file: 'apiV2.ts' })

// Automatically sends to AppSignal client-side
reportError({
  message: errorObj.message,
  code: 'WEB-NET-2',
  correlationId,
  error: error.message,
  args: buildArgs(options)
})
```

---

## Error Flow

```
Error Occurs
    ↓
reportError() called
    ↓
Detect Environment
    ├─ browser === true
    │   └─ Use @appsignal/javascript
    │       └─ Send to AppSignal (client-side)
    │
    └─ browser === false
        └─ Use @appsignal/nodejs
            └─ Send to AppSignal (server-side)
    ↓
Console Log (if enabled in systemSettings)
```

---

## Benefits

✅ **Single API** - Same code works everywhere  
✅ **Automatic routing** - No manual environment checks  
✅ **Full coverage** - Both client and server errors reported  
✅ **Consistent tags** - Same metadata structure  
✅ **Type safety** - Shared TypeScript interfaces  
✅ **No duplication** - One reporter module for all  

---

## Testing

### **Verify Server-Side Reporting**

1. Add `PUBLIC_APPSIGNAL_KEY` to `.env`
2. Trigger a server-side error (e.g., invalid API request)
3. Check AppSignal dashboard for error with:
   - `type: error`
   - `code: WEB-SRV-*`
   - `correlationId`
   - Server-side tags

### **Verify Client-Side Reporting**

1. Trigger a client-side error (e.g., network timeout)
2. Check AppSignal dashboard for error with:
   - `type: error`
   - `code: WEB-NET-*`
   - `correlationId`
   - Client-side tags

---

## Troubleshooting

### **Server errors not appearing in AppSignal**

1. Check `PUBLIC_APPSIGNAL_KEY` is set in environment
2. Check console for "Failed to initialize server-side AppSignal"
3. Verify key is correct in AppSignal dashboard
4. Check `PUBLIC_ENV` is set to `prod` (production)

### **Client errors not appearing**

1. Check `PUBLIC_APPSIGNAL_KEY` is set
2. Check browser console for AppSignal errors
3. Verify key is correct in AppSignal dashboard

---

**Universal AppSignal reporting is now active!** 🎉
