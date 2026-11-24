import { PUBLIC_ZIFT_GATES_URL } from '$env/static/public'
import { ZIFT_GATES_UN } from '$env/static/private'
import { env } from '$env/dynamic/private'
import { mutate } from 'src/lib/server/client'



export const PaymentToken:string = `
	accountNumberMasked
	expiration
	extendedAccountType
	holderName
	id
	userId`

export const payment = {

	paymentInfoPassword : async () => {

		const headers = {
			'User-Agent'	: 'Super Agent/0.0.1',
			'Content-Type'	: 'application/x-www-form-urlencoded'
		}
		const data:Record<string,string> = {
			requestType	: 'authentication',
			userName	: ZIFT_GATES_UN,
			password	: env.ZIFT_GATES_PW,
			contextType	: 'proxynization'
		}
		
		const formBody = []

		for (const property in data) formBody.push(`${encodeURIComponent(property)}=${encodeURIComponent(data[property])}`)

		const options = {
			headers,
			method	: 'POST',
			body	: formBody.join('&')
		}

		const {body, status} = await fetch(PUBLIC_ZIFT_GATES_URL, options)

		if (status == 200) {

			const reader	= body?.getReader()
			const read		= await reader?.read()
			const value		= read?.value
			const string	= new TextDecoder().decode(value)
			const obj		= JSON.parse(`{"${decodeURI(string.replace(/&/g, "\",\"").replace(/=/g, "\":\"").replace(/\+/g, " "))}"}`)
			
			if		(obj.responseType == 'exception')	return { error:{message:`Zift Error | ${obj.failureCode} | ${obj.failureMessage}`} }
			else if	(obj.responseCode == 'A01')			return { password:obj.temporaryPassword }

		} else {

			return { error:{message:`response status code: ${status}`} }
		}
	},

	paymentTokenCreate : async (options:Record<string,any> = {}) => await mutate('paymentTokenCreate', {
	
		variables	: {input : {
						expiration	: 'String!',
						holderName	: 'String!',
						proxyNumber	: 'String!'
					}},
		fields		: PaymentToken

	}, {key:'paymentToken', ...options}),

	paymentTokenUpdate : async (options:Record<string,any> = {}) => await mutate('paymentTokenUpdate', {
	
		variables	: {
						paymentTokenId	: 'String!',
						input			: {
								expiration	: 'String!',
								holderName	: 'String!',
								proxyNumber	: 'String!'
							}
					},
		fields		: PaymentToken

	}, {key:'paymentToken', ...options}),

	paymentTokenDelete : async (options:Record<string,any> = {}) => await mutate('paymentTokenDelete', {

		variables	: {paymentTokenId : 'String!'},
		fields		: 'success'

	}, {...options}),
}