import type { Cookies } from '@sveltejs/kit'

import { fail } from '@sveltejs/kit'
import { auth } from 'src/lib/server/auth'
import { api } from 'src/lib/server/api/api'



export const product = {

	add : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const input					= variables.input				as File
		const description			= variables.description			as string
		const price_amount			= variables.price_amount		as string
		const title					= variables.title				as string
		const unit					= variables.unit				as string
		// const forPickUp				= variables.forPickUp			as string
		// const forDelivery			= variables.forDelivery			as string
		// const forDistribution		= variables.forDistribution		as string
		const availability			= variables.availability		as string

		// forPickUp ? variables.forPickUp = 'true' : variables.forPickUp = 'false'
		// forDelivery ? variables.forDelivery = 'true' : variables.forDelivery = 'false'
		// forDistribution ? variables.forDistribution = 'true' : variables.forDistribution = 'false'

		// const hasFulfillment = forPickUp || forDelivery || forDistribution

		// const preorderEnabled	= variables.preorderEnabled	=== 'on'

		const error:Record<string,string> = {_type:'group'}

		if (!input)					error['_image']					= 'Image is required'
		if (!description)			error['_tinymce-description']	= 'Description is required'
		if (!price_amount)			error['price_amount']			= 'Price is required'
		if (!title)					error['title']					= 'Title is required'
		if (!unit)					error['unit']					= 'Unit is required'
		// if (!hasFulfillment)		error['_check-fulfillment']		= 'At least one fulfillemnt method is required'
		if (!availability)			error['availability']			= 'Availability is required'

		if (Object.keys(error).length > 1) return fail(400, {error})

		delete variables.input

		const { product, error:errorAdd } = await api.productCreate({ variables, ...auth.token(cookies) })

		let image,
			errorAddImage

		if (input && product.id) ({ image, error:errorAddImage } = await api.productAddImage({ variables:{productId:product.id, input}, ...auth.token(cookies) }))

		if (image) product.image = image

		return { data:product, error:errorAdd || errorAddImage ? {update:errorAdd, addImage:errorAddImage} : undefined }
	},

	update : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const variables = Object.fromEntries(await request.formData())

		const productId				= variables.productId			as string
		const input					= variables.input				as File
		const description			= variables.description			as string
		const price_amount			= variables.price_amount		as string
		const title					= variables.title				as string
		const unit					= variables.unit				as string
		// const forPickUp				= variables.forPickUp			as string
		// const forDelivery			= variables.forDelivery			as string
		// const forDistribution		= variables.forDistribution		as string
		const availability			= variables.availability		as string

		// forPickUp ? variables.forPickUp = 'true' : variables.forPickUp = 'false'
		// forDelivery ? variables.forDelivery = 'true' : variables.forDelivery = 'false'
		// forDistribution ? variables.forDistribution = 'true' : variables.forDistribution = 'false'

		// const hasFulfillment = forPickUp || forDelivery || forDistribution

		const imageChanged	= variables.imageChanged === 'true'

		const error:Record<string,string> = {_type:'group'}
		
		if (imageChanged && !input)	error['_image']					= 'Image is required'
		if (!description)			error['_tinymce-description']	= 'Description is required'
		if (!price_amount)			error['price_amount']			= 'Price is required'
		if (!title)					error['title']					= 'Title is required'
		if (!unit)					error['unit']					= 'Unit is required'
		// if (!hasFulfillment)		error['_check-fulfillment']		= 'At least one fulfillemnt method is required'
		if (!availability)			error['availability']			= 'Availability is required'

		if (Object.keys(error).length > 1) return fail(400, {error})

		let errorUpdateImage = null

		if (input) {
			
			({ error:errorUpdateImage } = await api.productAddImage({ variables:{productId, input}, ...auth.token(cookies) }))

			if (errorUpdateImage) return { error:errorUpdateImage}

			delete variables.input
		}

		let product,
			errorUpdate
		
		if (!errorUpdateImage) {
			
			({ product, error:errorUpdate } = await api.productUpdate({ variables, ...auth.token(cookies) }))

			if (errorUpdate) return { error:errorUpdate }
		}

		return { data:product }
	}
}