import type { Cookies } from '@sveltejs/kit'

import { fail } from '@sveltejs/kit'
import { auth } from 'src/lib/server/auth'
import { apiV2 } from 'src/lib/server/apiV2/api'



export const stock = {

	storageLocationAdd : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const error:Record<string,string> = {_type:'group'}

		if (!set.company_id)	error['company_id']	= 'An Error Occurred: missing company id'
		if (!set.name)			error['name']		= 'Name is required'
		if (!set.type)			error['type']		= 'Type is required'

		if (Object.keys(error).length > 1) return fail(400, {error})

		set.preferred = String(set.preferred === 'on')

		const { storageLocation, error:errorAdd } = await apiV2.storageLocation({ set, ...auth.token(cookies) })

		return { data:storageLocation, error:errorAdd }
	},

	storageLocationUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const id = set.id
		const error:Record<string,string> = {_type:'group'}

		if (!id)		error['id']		= 'An Error Occurred: missing storage location id'
		if (!set.name)	error['name']	= 'Name is required'

		delete set.id

		if (Object.keys(error).length > 1) return fail(400, {error})

		set.preferred = String(set.preferred === 'on')

		const { storageLocation, error:errorUpdate } = await apiV2.storageLocation({ id, set, ...auth.token(cookies) })

		return { data:storageLocation, error:errorUpdate }
	},

	skuAdd : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const error:Record<string,string> = {_type:'group'}

		if (!set.keeper_id)		error['keeper_id']	= 'An Error Occurred: missing keeper id'
		if (!set.variant_id)	error['variant_id']	= 'Product is required'
		if (!set.code)			error['code']		= 'Code is required'

		if (Object.keys(error).length > 1) return fail(400, {error})

		set.can_pick_up	= String(set.can_pick_up === 'on')
		set.can_deliver	= String(set.can_deliver === 'on')
		set.active		= String(set.active === 'on')

		const { sku, error:errorAdd } = await apiV2.sku({ set, ...auth.token(cookies) })

		return { data:sku, error:errorAdd }
	},

	skuUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const id = set.id
		const error:Record<string,string> = {_type:'group'}

		if (!id)		error['id']		= 'An Error Occurred: missing sku id'
		if (!set.code)	error['code']	= 'Code is required'

		delete set.id

		if (Object.keys(error).length > 1) return fail(400, {error})

		set.can_pick_up	= String(set.can_pick_up === 'on')
		set.can_deliver	= String(set.can_deliver === 'on')
		set.active		= String(set.active === 'on')

		const { sku, error:errorUpdate } = await apiV2.sku({ id, set, ...auth.token(cookies) })

		return { data:sku, error:errorUpdate }
	},

	stockItemAdd : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const error:Record<string,string> = {_type:'group'}

		if (!set.storage_location_id)	error['storage_location_id']	= 'Storage Location is required'
		if (!set.sku_id)				error['sku_id']					= 'SKU is required'

		if (Object.keys(error).length > 1) return fail(400, {error})

		const { stockItem, error:errorAdd } = await apiV2.stockItem({ set, ...auth.token(cookies) })

		return { data:stockItem, error:errorAdd }
	},

	stockItemUpdate : async ({ request, cookies }:{request:Request, cookies:Cookies}) => {

		const set = Object.fromEntries(await request.formData())

		const id = set.id

		delete set.id

		const { stockItem, error:errorUpdate } = await apiV2.stockItem({ id, set, ...auth.token(cookies) })

		return { data:stockItem, error:errorUpdate }
	},
}