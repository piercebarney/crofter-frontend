# Crofter Market Frontend (archived)

This is the former web frontend of Crofter Market, a local food marketplace that connected independent food producers directly with consumers. It ran in production from 2023 until early 2026, when the platform moved to Elixir and Phoenix.

**Ownership:** This code is owned by Crofter Market, Inc. It is published here with the company's permission as a portfolio piece. It is not licensed for reuse.

## My role

I co-founded Crofter Market and built this frontend while I was the company's only employee. I was the primary developer for its whole life and wrote the large majority of its commits. I wrote the early versions by hand. From late 2024 on I used AI coding tools as part of my workflow.

## What it does

The app serves three kinds of users, each with its own layouts, pages and modals:

- **Consumers** browse products, manage a cart, check out and track orders.
- **Producers** manage their product listings, apply for payment processing and handle fulfillment.
- **Distributors** manage SKUs, inventory and fulfillment across locations.

It also supported a major business pivot, from a marketplace where producers fulfilled their own orders to an in-house distribution model.

## Stack

- SvelteKit with Svelte 5 and TypeScript
- SCSS with Pico CSS and a custom Crofter theme
- GraphQL (Apollo Client) plus a REST proxy layer that adds auth headers, handles expired tokens and reports errors
- JWT auth in cookies with server-side validation in hooks
- PWA support with a service worker and offline caching
- Deployed to Cloudflare Workers with Wrangler, with separate dev, staging and prod environments

## Where to look

- `src/features/groups/` holds the features for each user type (consumer, producer, distributor, admin, auth).
- `src/lib/` holds the API proxy handlers, auth utilities and the error reporter.
- `src/stores/` holds global state.
- `src/routes/` holds the SvelteKit routes, including the `/api/v1` and `/api/v2` proxies.

## Notes on this copy

- Environment files, Cloudflare account details, deployment workflows and API URLs were removed before publishing. Placeholders such as `example.com` stand in for them.
- The git history was not included.
- The backend API is not part of this repo, so the app will not run on its own.
