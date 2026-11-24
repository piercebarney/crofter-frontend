# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit-based e-commerce webapp built for deployment on Cloudflare Workers. The application supports multiple user types (consumers, producers, distributors) with distinct interfaces and features for each role.

## Development Commands

### Development Server
```bash
npm run dev           # Local development on port 5173
npm run dev-lan       # LAN-accessible development on port 3333  
npm run dev-cf        # Cloudflare Workers development mode
```

### Building & Deployment
```bash
npm run build         # Build for prod environment
npm run preview       # Preview production build
npm run pub-dev       # Deploy to dev environment
npm run pub-stag      # Deploy to staging environment
npm run pub-prod      # Deploy to prod environment
```

### Code Quality
```bash
npm run lint          # Run Stylelint on SCSS files
npm run check         # SvelteKit sync and type checking
npm run check:watch   # Type checking in watch mode
```

### Dependency Management
**Important:** Always use `--legacy-peer-deps` flag due to Vite 6 compatibility issues:
```bash
npm install --legacy-peer-deps
npm update --legacy-peer-deps
npm add [package] --legacy-peer-deps
```

## Architecture

### Tech Stack
- **Framework:** SvelteKit with Svelte 5
- **Deployment:** Cloudflare Workers via Wrangler
- **Styling:** SCSS with Pico CSS framework, custom Crofter theme
- **State Management:** Svelte stores with persistence
- **API:** GraphQL (Apollo Client) + REST endpoints
- **Build Tool:** Vite 6 with PWA support
- **TypeScript:** Configured with strict mode

### Directory Structure

**src/features/groups/** - Feature-based organization by user type:
- `consumer/` - Consumer-facing features (shopping, checkout, orders)
- `producer/` - Producer dashboard and product management
- `distributor/` - Distributor inventory and fulfillment
- `admin/` - Admin portal
- `auth/` - Authentication flows

**src/lib/** - Core utilities:
- `api.ts`, `api-v2.ts` - API proxy handlers with automatic auth redirects
- `server/` - Server-side API implementations
- `auth.ts` - Authentication utilities
- `storage.ts` - Local storage management
- `reporter/` - Error reporting system

**src/stores/** - Global state management:
- `user.ts` - User authentication state
- `company/` - Company-specific data and helpers
- `distributorLocations.ts` - Location management

**src/routes/** - SvelteKit routing:
- Organized by user type with nested layouts
- API routes at `/api/v1` and `/api/v2`

### API Architecture

The app uses a dual API approach:
1. **GraphQL API** (via Apollo Client) for complex data fetching
2. **REST API Proxy** (`/api/v1`, `/api/v2`) that forwards to backend services

API calls are made through proxy handlers that:
- Add authentication headers automatically
- Handle auth redirects when tokens expire
- Include cache-busting headers
- Report errors via the reporter module

### Authentication Flow

- JWT-based authentication stored in cookies
- Automatic token refresh on API calls
- Server-side user validation in hooks
- Auth state managed in `src/stores/user.ts`

### Multi-Role Support

The app supports three main user roles with distinct experiences:
1. **Consumers** - Browse products, manage cart, place orders
2. **Producers** - Manage products, view fulfillment, handle applications
3. **Distributors** - Manage SKUs, handle fulfillment, product management

Each role has dedicated:
- Layouts (`src/features/groups/*/layouts/`)
- Pages (`src/features/groups/*/pages/`)
- Modals (`src/features/groups/*/modals/`)

### PWA & Service Worker

- PWA configuration in `vite.config.js`
- Service worker with runtime caching strategies
- Offline support via service worker
- App manifest at `/static/pwa/manifest.webmanifest`

### Environment Configuration

Environments configured in `wrangler.toml`:
- `dev` - Development environment
- `staging` - Staging environment  
- `prod` - Production environment

Environment variables accessed via:
- `$env/static/private` for server-side secrets
- Platform bindings for Cloudflare-specific features

## Known Issues

1. **Vite 6 Compatibility**: Some plugins don't officially support Vite 6. Use `--legacy-peer-deps` for all npm operations.

2. **Security Vulnerabilities**: 
   - esbuild in wrangler (moderate)
   - tinymce < 7.0.0 XSS vulnerability (moderate)
   - cookie < 0.7.0 (low)

3. **TypeScript**: Using `skipLibCheck: true` due to dependency type conflicts

## Testing Approach

Currently no automated tests are configured. The project uses:
- SvelteKit's built-in type checking (`npm run check`)
- Stylelint for SCSS validation (`npm run lint`)
- Manual testing in development environments

## Deployment Notes

- Cloudflare Workers deployment via Wrangler
- Static assets served from Cloudflare's edge
- Environment-specific builds using Vite modes
- Observability enabled for all environments

## Cart & State Persistence

- Cart state persisted to localStorage
- User preferences stored locally
- Company data cached in stores with helpers for common operations