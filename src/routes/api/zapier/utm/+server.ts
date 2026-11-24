import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'

export const POST: RequestHandler = async ({ request }) => {

	try {

		const data = await request.json()

		const formData = new URLSearchParams()

		formData.append('name', data.name || '')
		formData.append('phone', data.phone || '')
		formData.append('email', data.email || '')
		formData.append('utm_source', data.utm_source || '')
		formData.append('utm_medium', data.utm_medium || '')
		formData.append('utm_campaign', data.utm_campaign || '')
		formData.append('utm_content', data.utm_content || '')
		formData.append('utm_term', data.utm_term || '')

		if (!env.ZAPIER_ACCOUNT_ID || !env.UTM_ZAP_HOOK_ID) {
			console.error('Zapier environment variables not configured')
			return json({ error: 'Service not configured' }, { status: 503 })
		}

		const zapierUrl = `https://hooks.zapier.com/hooks/catch/${env.ZAPIER_ACCOUNT_ID}/${env.UTM_ZAP_HOOK_ID}/`

		const response = await fetch(zapierUrl, {
			method	: 'POST',
			headers	: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body	: formData
		})

		if (!response.ok) {

			console.error('Zapier webhook failed:', response.status)

			return json({ error: 'Failed to send data to Zapier' }, { status: 500 })
		}

		return json({ success: true })

	} catch (error) {

		console.error('Error in Zapier UTM endpoint:', error)

		return json({ error: 'Internal server error' }, { status: 500 })
	}
}
