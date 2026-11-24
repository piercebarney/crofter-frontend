import cloudflareWorkers from '@sveltejs/adapter-cloudflare-workers'
// import { vitePreprocess } from '@sveltejs/kit/vite'
import { sveltePreprocess } from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit : {
		adapter : cloudflareWorkers({ config: 'wrangler.toml' }),
		alias : {
			'src': './src',
			'src/*': './src/*',
			'$lib': './src/lib',
			'$lib/*': './src/lib/*'
		},
		csrf : {
			trustedOrigins: ['https://example.com'],
		},
		output : {
			preloadStrategy : 'preload-mjs',
		},
	},
	preprocess : [
		// vitePreprocess(),
		sveltePreprocess({
			scss : {
				legacy: false,
				prependData: '@use "./src/styles/css/prepend.scss" as *;',
			},
		}),
	],
}

export default config
