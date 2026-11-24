/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	important: '.tailwind-scope', // Add !important to all utilities inside .tailwind-scope to override Pico
	corePlugins: {
		preflight: false, // Disable preflight to avoid conflicts with Pico
	}
	// Note: Theme colors are defined in app.css using @theme directive (Tailwind v4 approach)
	// Border radius utilities are also defined in app.css via CSS variables
}
