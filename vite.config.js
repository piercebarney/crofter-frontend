import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import { VitePWA } from 'vite-plugin-pwa';
import { resolve } from 'path';
import { typescriptEsm } from './vite-ts-plugin.js';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
	// console.log('NODE ENV:', process.env.NODE_ENV);
	// console.log('VITE MODE:', mode);

	return {
		root: process.cwd(),
		appType: 'custom',
		server: {
			host: '0.0.0.0', // Allow connections from any IP address
			strictPort: true,
			port: 5173
		},
		plugins: [
			typescriptEsm(),
			chunkSplitPlugin(),
			// Add a custom plugin to handle routes.ts specifically
			{
				name: 'routes-ts-static-only',
				enforce: 'pre',
				resolveId(id, importer) {
					// If this is a dynamic import from /lists, create a virtual module id when importer is select.svelte
					if (importer && id.includes('/lists/') && importer.includes('select.svelte')) {
						const importerDir = resolve(importer, '..');
						const fullPath = resolve(importerDir, id);
						return `\0dynamic-import:${fullPath}`;
					}
					// If this is a dynamic import of routes.ts or listHelpers.ts, return a custom id
					if (importer && (id.includes('routes.ts') || id.includes('listHelpers.ts')) && importer.includes('select.svelte')) {
						return '\0empty-module';
					}
					return null;
				},
				load(id) {
					// Return a virtual module that dynamically imports the actual content
					if (id.startsWith('\0dynamic-import:')) {
						const actualPath = id.replace('\0dynamic-import:', '');
						return `export const selectData = await import('${actualPath}').then(module => module.selectData);`;
					}
					// Return an empty module for our custom id
					if (id === '\0empty-module') {
						return 'export const selectData = { options: [], name: "", placeholder: "" };';
					}
					return null;
				}
			},
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: false,
				strategies: 'generateSW',
				filename: 'sw.js',
				scope: '/',
				base: '/',
				manifest: false,
				workbox: mode !== 'development' ? {
					maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // Increase limit if necessary
					globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
					globIgnores: ['_worker.js'], // Exclude _worker.js from being precached
					navigateFallback: undefined,
					navigateFallbackDenylist: [/^\/api\//],
					runtimeCaching: [
						{
							urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
							handler: 'CacheFirst',
							options: {
								cacheName: 'google-fonts-cache',
								expiration: {
									maxEntries: 10,
									maxAgeSeconds: 60 * 60 * 24 * 365,
								},
								cacheableResponse: {
									statuses: [0, 200],
								},
							},
						},
						{
							urlPattern: /\.(js|css|woff2?)(\?.*)?$/i,
							handler: 'StaleWhileRevalidate',
							options: {
								cacheName: 'static-resources',
								expiration: {
									maxAgeSeconds: 24 * 60 * 60,
								},
							},
						},
						{
							urlPattern: /^\/pwa\/icons\/.*\.png$/i,
							handler: 'StaleWhileRevalidate',
							options: {
								cacheName: 'icon-resources',
								expiration: {
									maxAgeSeconds: 24 * 60 * 60,
								},
							},
						},
					],
				} : undefined,
				devOptions: {
					enabled: mode === 'development',
					type: 'module'
				},
			}),
			tailwindcss(),
			sveltekit(),
		],
		resolve: {
			extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.svelte'],
			alias: {
				src: resolve(process.cwd(), './src')
			}
		},
		optimizeDeps: {
			exclude: ['@appsignal/nodejs'],
			esbuildOptions: {
				target: 'esnext'
			}
		},
		ssr: {
			noExternal: [],
			external: ['@appsignal/nodejs']
		},
		build: {
			target: 'esnext',
			chunkSizeWarningLimit: 5000,
			rollupOptions: {
				external: [
					'@appsignal/nodejs',
					/\.node$/
				],
				// Suppress warnings about list files
				onwarn(warning, warn) {
					// Check if this is a warning about a file being both statically and dynamically imported
					if (warning.message && warning.message.includes('is dynamically imported') && warning.message.includes('but also statically imported')) {
						// Check if it's a list file
						if (warning.message.includes('/lists/')) {
							return; // Skip this warning
						}
					}
					warn(warning);
				},
				output: {
					manualChunks(id) {
						// Vendor chunks
						if (id.includes('node_modules')) {
							if (id.includes('svelte')) return 'svelte';
							if (id.includes('currency.js')) return 'currency';
							if (id.includes('@sveltejs/kit')) return 'sveltekit';
							return 'vendor';
						}

						// Feature-based chunks
						if (id.includes('src/features/groups/consumer')) return 'consumer';
						if (id.includes('src/features/groups/admin')) return 'admin';
						if (id.includes('src/features/groups/company')) return 'company';
						if (id.includes('src/components')) return 'components';
						if (id.includes('src/lib')) return 'lib';
						if (id.includes('src/lists')) return 'lists';
					}
				}
			},
		},
		logLevel: 'warn',
		test: {
			include: ['src/**/*.test.ts'],
			environment: 'node',
		},
	};
});