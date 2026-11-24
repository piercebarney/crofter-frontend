import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { PUBLIC_FROM_EMAIL } from '$env/static/public'
import { dev } from '$app/environment'

export const POST: RequestHandler = async (event) => {

	try {

		const { to, subject, message } = await event.request.json()

		// Validate required fields
		if (!to || !subject || !message) return json({ error: 'Missing required fields: to, subject, message' }, { status: 400 })

		if (dev) {
			// In development, just log the email
			console.log('📧 Email would be sent in production:')
			console.log(`From: ${PUBLIC_FROM_EMAIL}`)
			console.log(`To: ${to}`)
			console.log(`Subject: ${subject}`)
			console.log(`Message: ${message}`)
			
			return json({ success: true, message: 'Email logged (development mode)' })
		}

		// Production: Use MailChannels (only works in Cloudflare Workers)
		const emailPayload = {
			personalizations: [{
				to: [{ email: to }]
			}],
			from: { 
				email: PUBLIC_FROM_EMAIL,
				name: 'Crofter Market'
			},
			subject,
			content: [{
				type: 'text/plain',
				value: message
			}]
		}

		console.log('Sending email with payload:', JSON.stringify(emailPayload, null, 2))

		const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(emailPayload)
		})

		console.log('MailChannels response status:', response.status)
		console.log('MailChannels response headers:', Object.fromEntries(response.headers.entries()))

		if (!response.ok) {
			const errorData = await response.text()
			console.error('MailChannels error response:', errorData)
			throw new Error(`MailChannels API error: ${response.status} - ${errorData}`)
		}

		const responseData = await response.text()
		console.log('MailChannels success response:', responseData)

		return json({ success: true, message: 'Email sent successfully' })

	} catch (error) {

		console.error('Error sending email:', error)
		
		return json({ error: 'Failed to send email' }, { status: 500 })
	}
}
