import { PUBLIC_SECURE_COOKIES } from '$env/static/public'
import { redirect } from '@sveltejs/kit'
import type { Handle } from '@sveltejs/kit'
import { auth } from 'src/lib/server/auth'

export const handle = (async ({ event, resolve }) => {

	// Suppress logging for the specific Chrome DevTools path
	if (event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') {
		return new Response(null, { status: 404 });
	}


	// set locals
	const { user } = await auth.check(event.cookies, event.url)

	event.locals.user = user


	// set authRedirect to AuthRedirect cookie
	const authRedirect = event.cookies.get('AuthRedirect')


	// handle auth redirect
	if (event.cookies.get('AuthCheck') == 'reload' && authRedirect) {

		event.cookies.delete('AuthRedirect', { path: '/' })
		event.cookies.delete('AuthCheck', { path: '/' }) // Clear the reload flag immediately
		
		event.cookies.set('AuthCheck', 'pass', {
			httpOnly	: false,
			path		: '/',
			secure		: PUBLIC_SECURE_COOKIES === 'true',
			maxAge		: 60 * 60 * 24 * 30 // 30 days
		})

		event.locals.authRedirect = authRedirect

	} else delete event.locals.authRedirect


	// Process the response and handle 404s
	const response = await resolve(event, {

		transformPageChunk: ({ html }) => {

			if (html) {

				const initialData	= { userId: user?.id }
				const script		= `<script>window.__initialData = ${JSON.stringify(initialData)};</script>`

				return html.replace('</head>', `${script}</head>`)
			}

			return html
		},
		filterSerializedResponseHeaders: (name, _value) => {
			// Suppress logging for the specific 404 error related to Chrome DevTools
			if (name === 'X-Sveltekit-Error' && event.url.pathname === '/.well-known/appspecific/com.chrome.devtools.json') return false
			
			return true
		}
	})


	// Add CSP header for TinyMCE compatibility, Zift payment processing, and third-party integrations
	const SCRIPT_HOSTS = [
		'https:'
	]

	const FRAME_HOSTS = [
		'https:'
	]

	const dir = (name: string, values: string[]) => `${name} ${Array.from(new Set(values)).join(' ')}`

	const csp = [
		dir('script-src', [
			'\'self\'',
			'\'unsafe-inline\'',
			'\'unsafe-eval\'',
			...SCRIPT_HOSTS
		]),
		dir('worker-src', [
			'\'self\'',
			'blob:'
		]),
		dir('child-src', [
			'\'self\'',
			'blob:'
		]),
		dir('frame-src', [
			'\'self\'',
			...FRAME_HOSTS
		])
	].join('; ')

	response.headers.set('Content-Security-Policy', csp)


	// If the response is a 404, redirect to the homepage
	if (response.status === 404) {

		// Skip redirect for API routes and special paths
		if (!event.url.pathname.startsWith('/api/') && !event.url.pathname.includes('.well-known')) throw redirect(307, '/')
	}

	
	return response

}) satisfies Handle