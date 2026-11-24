import type { Cookies } from '@sveltejs/kit'

import { fail } from '@sveltejs/kit'
import { validate } from 'src/lib/validate'
import { auth } from 'src/lib/server/auth'
import { api } from 'src/lib/server/api/api'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const account = {

	passwordUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const oldPassword = variables.oldPassword as string

		const { fail:passwordFail } = validate.password(variables, 'newPassword')

		if (!oldPassword)	return fail(400, { variables, error:'Current Password is required' })
		if (passwordFail)	return fail(400, { variables, error:passwordFail })

		const { error } = await api.passwordUpdate({ variables, ...auth.token(cookies) })

		return { error }
	},

	userUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const id		= variables.id			as string
		const firstName	= variables.firstName 	as string
		const lastName	= variables.lastName	as string

		delete variables.id

		const { fail:emailFail }		= validate.email(variables)
		const { fail:phoneNumberFail }	= validate.phoneNumber(variables, false)

		if (!firstName)			return fail(400, { variables, error:'First name is required' })
		if (!lastName)			return fail(400, { variables, error:'Last name is required' })
		if (emailFail)			return fail(400, { variables, error:emailFail })
		if (phoneNumberFail)	return fail(400, { variables, error:phoneNumberFail })

		const { user, error } = await apiV2.user({ id, set:variables, ...auth.token(cookies) })

		return { data:user, error }
	},

	paymentTokenCreate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables	= Object.fromEntries(await request.formData())

		const expiration = variables.expiration as string

		variables.expiration = expiration.replace(/\//g, '')

		const { paymentToken, error } = await api.paymentTokenCreate({ variables, ...auth.token(cookies) })

		return { data:paymentToken, error }
	},

	paymentTokenUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {
	
		const variables = Object.fromEntries(await request.formData())

		const expiration = variables.expiration as string

		variables.expiration = expiration.replace(/\//g, '')

		const { paymentToken, error } = await api.paymentTokenUpdate({ variables, ...auth.token(cookies) })

		return { data:paymentToken, error }
	},

	addressAdd_user : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {
	
		const variables = Object.fromEntries(await request.formData())

		const city		= variables.city		as string
		const state		= variables.state		as string
		const zipCode	= variables.zipCode		as string

		const { fail:addressFail }		= validate.address(variables)

		if (addressFail)	return fail(400, { variables, error:addressFail })
		if (!city)			return fail(400, { variables, error:'City is required' })
		if (!state)			return fail(400, { variables, error:'State is required' })
		if (!zipCode)		return fail(400, { variables, error:'Zip code is required' })

		const { address, error } = await api.addressAdd_user({ variables, ...auth.token(cookies) })

		return { data:address, error }
	},

	addressAdd_company : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {
	
		const variables = Object.fromEntries(await request.formData())

		const city		= variables.city		as string
		const state		= variables.state		as string
		const zipCode	= variables.zipCode		as string

		const { fail:addressFail } = validate.address(variables)

		if (addressFail)	return fail(400, { variables, error:addressFail })
		if (!city)			return fail(400, { variables, error:'City is required' })
		if (!state)			return fail(400, { variables, error:'State is required' })
		if (!zipCode)		return fail(400, { variables, error:'Zip code is required' })

		const { address, error } = await api.addressAdd_company({ variables, ...auth.token(cookies) })

		return { data:address, error }
	},

	addressUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const city		= variables.city		as string
		const state		= variables.state		as string
		const zipCode	= variables.zipCode		as string

		const { fail:addressFail } = validate.address(variables)

		if (addressFail)	return fail(400, { variables, error:addressFail })
		if (!city)			return fail(400, { variables, error:'City is required' })
		if (!state)			return fail(400, { variables, error:'State is required' })
		if (!zipCode)		return fail(400, { variables, error:'Zip code is required' })

		const { address, error } = await api.addressUpdate({ variables, ...auth.token(cookies) })

		return { data:address, error }
	},

	companyCreate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const name				= variables.name				as string
		const address_city		= variables.address_city		as string
		const address_state		= variables.address_state		as string
		const address_zipCode	= variables.address_zipCode		as string

		const { fail:emailFail }		= validate.email(variables)
		const { fail:phoneNumberFail }	= validate.phoneNumber(variables, false)
		const { fail:addressFail }		= validate.address(variables, false)

		if (!name)				return fail(400, { variables, error:'Name is required' })
		if (addressFail)		return fail(400, { variables, error:addressFail })
		if (!address_city)		return fail(400, { variables, error:'City is required' })
		if (!address_state)		return fail(400, { variables, error:'State is required' })
		if (!address_zipCode)	return fail(400, { variables, error:'Zip code is required' })
		if (emailFail)			return fail(400, { variables, error:emailFail })
		if (phoneNumberFail)	return fail(400, { variables, error:phoneNumberFail })

		const { company, error } = await api.companyCreate({ variables, ...auth.token(cookies) })

		return { data:company, error }
	},

	companyUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const companyId			= variables.companyId		as string
		const input				= variables.input 			as File
		const name				= variables.name			as string
		// const operatingHours	= variables.operatingHours	as string
		// const bio				= variables.bio				as string

		const { fail:emailFail }		= validate.email(variables)
		const { fail:phoneNumberFail }	= validate.phoneNumber(variables, false)

		if (!name)				return fail(400, { variables, error:'Name is required' })
		// if (!operatingHours)	return fail(400, { variables, error:'Operating Hours is required' })
		// if (!bio)				return fail(400, { variables, error:'Bio is required' })
		if (emailFail)			return fail(400, { variables, error:emailFail })
		if (phoneNumberFail)	return fail(400, { variables, error:phoneNumberFail })

		let errorAddImage

		if (input) {
			
			({ error:errorAddImage } = await api.companyAddImage({ variables:{companyId, input}, ...auth.token(cookies) }))

			if (errorAddImage) return { error:errorAddImage }

			delete variables.input
		}

		let company,
			errorUpdate

		if (!errorAddImage) {
		
			({ company, error:errorUpdate } = await api.companyUpdate({ variables, ...auth.token(cookies) }))

			if (errorUpdate) return { error:errorUpdate }
		}

		return { data:company }
	},

	companyUpdateZiftAccountId : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const ziftAccountId	= variables.ziftAccountId as string

		if (!ziftAccountId) return fail(400, { variables, error:'Code is required' })

		const { company, error } = await api.companyUpdateZiftAccountId({ variables, ...auth.token(cookies) })

		return { data:company, error }
	},

	applicationShopDetails : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		/*
		company.bio
		company.image
		company.name > business.businessName
		company.operatingHours
		company.phoneNumber > business.descriptorPhone & business.contactPhone

		address.address1 > business.address.street1
		address.address2 > business.address.street2
		address.city > business.address.city
		address.state > business.address.state
		address.zipCode > business.address.zipCode

		business.legalName
		business.timeZoneCode
		*/

		const formData = await request.formData()
		const variables: Record<string, any> = {}

		console.log({formData})

		// Convert FormData to object and handle empty strings
		for (const [key, value] of formData.entries()) variables[key] = value === '' ? null : value

		if (variables?.form == 'sd') {

			// validate
			const error:Record<string,string> = {_type:'group'}

			const { fail:phoneNumberFail }	= validate.phoneNumber(variables, false)
			const { fail:zipCodeFail }		= validate.zipCode(variables)

			if (phoneNumberFail)		error['phoneNumber']	= phoneNumberFail as string
			if (!variables.address1)	error['address1']		= 'Address is required'
			if (!variables.city)		error['city']			= 'City is required'
			if (!variables.state)		error['state']			= 'State is required'
			if (zipCodeFail)			error['zipCode']		= zipCodeFail as string

			if (Object.keys(error).length > 1) return fail(400, {error})

			if (variables.name) {
	
				variables.business_businessName = variables.name
				variables.business_paymentCardDescriptor = `CROFTER ${variables.name}`
				variables.business_directDebitDescriptor = `CROFTER ${variables.name}`
			}
			if (variables.phoneNumber) {
				
				variables.business_descriptorPhone = variables.phoneNumber
				variables.business_contactPhone = variables.phoneNumber
			}
			if (variables.address1)	variables.business_address_address1 = variables.address1
			if (variables.address2)	variables.business_address_address2 = variables.address2
			if (variables.city)		variables.business_address_city = variables.city
			if (variables.state)	variables.business_address_state = variables.state
			if (variables.zipCode)	variables.business_address_zipCode = variables.zipCode
		}

		let application: any		= null,
			errorApplication: any	= null,
			address: any			= null,
			errorAddress: any		= null

		if (variables?.form != 'b') {

			// update application
			({ application, error:errorApplication } = await api.companyMerchantApplicationSave({ variables, ...auth.token(cookies) }))

			// error check
			if (errorApplication) return fail(422, { variables, error:errorApplication })

			// add/update address
			if (variables?.form == 'sd') {

				if	(variables.addressId)	({ address, error:errorAddress } = await api.addressUpdate({ variables, ...auth.token(cookies) }))
				else						({ address, error:errorAddress } = await api.addressAdd_company({ variables, ...auth.token(cookies) }))
			
				// error check
				if (errorAddress) return fail(422, { variables, error:errorAddress })
			}
		
		// add image
		} else if ('input' in variables) {

			const { error:errorImage } = await api.companyAddImage({ variables, ...auth.token(cookies) })

			// error check
			if (errorImage) return fail(422, { variables, error:errorImage })
		}

		// update company
		const { company, error:errorCompany } = await api.companyUpdate({ variables, ...auth.token(cookies) })

		// error check
		if (errorCompany) return fail(422, { variables, error:errorCompany })

		return { data:{company, address, application} }
	},

	applicationPaymentProcessing : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		/*
		business.description
		business.ownershipStructureType
		business.registrationYear
		business.taxId

		estimates.annualCardsVolume > annualDirectDebitVolume
		estimates.avgCardsTransactionAmount > avgDirectDebitTransactionAmount
		estimates.maxTransactionAmount

		officer.firstName
		officer.lastName
		officer.title
		officer.phone
		officer.socialSecurity
		officer.address.address1
		officer.address.address2
		officer.address.city
		officer.address.state
		officer.address.zipCode
		officer.birthDate
		officer.email

		owners.firstName
		owners.lastName
		owners.phone
		owners.socialSecurity
		owners.address.address1
		owners.address.address2
		owners.address.city
		owners.address.state
		owners.address.zipCode
		owners.birthDate
		owners.email
		owners.stakePercentage
		*/
	
		const formData = await request.formData()
		const variables: Record<string, any> = {}

		// Convert FormData to object and handle empty strings
		for (const [key, value] of formData.entries()) variables[key] = value === '' ? null : value

		if (variables.estimates_annualCardsVolume)			variables.estimates_annualDirectDebitVolume = variables.estimates_annualCardsVolume
		if (variables.estimates_avgCardsTransactionAmount)	variables.estimates_avgDirectDebitTransactionAmount = variables.estimates_avgCardsTransactionAmount

		// update application
		const { application, error:errorApplication } = await api.companyMerchantApplicationSave({ variables, ...auth.token(cookies) })

		// error check
		if (errorApplication) return fail(422, { variables, error:errorApplication })

		return { data:application }
	},

	applicationSubmit : async ({ request, cookies}:{request:Request, cookies:Cookies}) => {

		/*
		accountNumber
		accountType
		bankName
		holderName
		routingNumber
		*/

		const formData = await request.formData()
		const variables: Record<string, any> = {}

		// Convert FormData to object and handle empty strings
		for (const [key, value] of formData.entries()) variables[key] = value === '' ? null : value

		// submit application
		const { application, error:errorApplication } = await api.companyMerchantApplicationSubmit({ variables, ...auth.token(cookies) })

		// error check
		if (errorApplication) return fail(422, { variables, error:errorApplication })

		return { data:application }
	},
}