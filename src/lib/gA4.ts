import type { CartItem } from 'src/features/groups/consumer/modules/cart/types'
import type { Sku } from 'src/types/sku'
type PurchaseParams = {
	deliveryAddressId: string|null
	fulfillmentName: string
	orderId: string
	pickUpLocationId: string|null
}
type CartParams = {
	event: string
	skuId: string
	qty: number
}
type ViewItemParams = {
	sku: Sku|null
	skuId: string|null
}
interface AG4 {
	checkoutAuth:	() => void
	checkoutSignUp:	() => void
	checkoutLogIn:	() => void
	checkoutBegin:	() => void
	purchase:		(params:PurchaseParams) => void
	cart:			(params:CartParams) => void
	viewItem:		(params:ViewItemParams) => void
}

import currency from 'currency.js'
import { user as u } from 'src/stores/user'
import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
import { skus as s } from 'src/stores/skus'
import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
import { systemSettings as sS } from 'src/stores/systemSettings'



const push	= sS.val('integration.googleTagManager')
const log	= sS.val('log.googleTagManager')

const _push = (data:any) => {

	// Initialize dataLayer
	;(window as any).dataLayer = (window as any).dataLayer || []
	
	// Clear previous ecommerce data
	;(window as any).dataLayer.push({ ecommerce: null })
	
	// Push purchase event
	;(window as any).dataLayer.push(data)
}

const _processItems = (items:CartItem[]) => {

	return items
		.filter((item:CartItem) => item.quantity > 0)
		.map((item:CartItem, itemIndex:number) => {

			const sku = s.getById(item.skuId)
			
			return {
				item_id			: item.id,
				item_name		: sku?.variant.product.title || '',
				item_category	: sku?.variant.product.category || '',
				item_brand		: sku?.variant.product.company.name || '',
				price			: sku?.variant.price.number || 0,
				quantity		: item.quantity,
				index			: itemIndex
			}
		})
}


export const gA4: AG4 = {

	checkoutAuth : () => {

		if (!push && !log) return

		const data = {
			event		: 'checkout_auth',
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: c.get('subTotal')?.number || 0,
				currency	: 'USD',
				coupon		: c.get('promoCode') || '',
				items		: _processItems(c.get('items'))
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 checkout auth', data)
	},

	checkoutSignUp : () => {

		if (!push && !log) return

		const data = {
			event		: 'checkout_sign_up',
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: c.get('subTotal')?.number || 0,
				currency	: 'USD',
				coupon		: c.get('promoCode') || '',
				items		: _processItems(c.get('items'))
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 checkout sign up', data)
	},

	checkoutLogIn : () => {

		if (!push && !log) return

		const data = {
			event		: 'checkout_log_in',
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: c.get('subTotal')?.number || 0,
				currency	: 'USD',
				coupon		: c.get('promoCode') || '',
				items		: _processItems(c.get('items'))
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 checkout log in', data)
	},

	checkoutBegin : () => {

		if (!push && !log) return

		const data = {
			event		: 'begin_checkout',
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: c.get('subTotal')?.number || 0,
				currency	: 'USD',
				coupon		: c.get('promoCode') || '',
				items		: _processItems(c.get('items'))
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 begin checkout', data)
	},

	purchase : (params:PurchaseParams) => {

		if (!push && !log) return

		const data = {
			event		: 'purchase',
			user_id		: u.get('id') || '',
			ecommerce	: {
				transaction_id			: params.orderId,
				value					: c.get('total')?.number || 0,
				currency				: 'USD',
				tax						: c.get('tax')?.number || 0,
				shipping				: 0,
				coupon					: c.get('promoCode') || '',
				items					: _processItems(c.get('items')),
				fulfillment_method		: params.fulfillmentName,
				pick_up_location_name	: params.fulfillmentName == 'pickup' ? pL.get(params.pickUpLocationId)?.title || '' : 'n/a',
				delivery_zip_code		: params.fulfillmentName == 'delivery' ? u.getAddress(params.deliveryAddressId)?.zipCode || '' : 'n/a'
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 purchase', data)
	},

	cart : (params:CartParams) => {

		if (!push && !log) return

		const sku: Sku|null				= s.getById(params.skuId)
		const item: Record<string, any>	= {
			item_id		: params.skuId,
			quantity	: params.qty
		}

		let value = 0

		if (sku) {

			// Use high precision for accurate cart value calculation
			value = currency(sku.variant.price.number, { precision: 9 }).multiply(params.qty).value

			item.name		= sku.variant.product.title || ''
			item.index		= 0
			item.brand		= sku.variant.product.company.name || ''
			item.category	= sku.variant.product.category || ''
			item.price		= sku.variant.price.number || 0
		}

		const data = {
			event		: params.event,
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: value,
				currency	: 'USD',
				items		: [item]
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 cart', data)
	},

	viewItem : (params:ViewItemParams) => {

		const item: Record<string, any>	= {
			item_id		: params.skuId,
			quantity	: 1
		}

		let value = 0

		if (params.sku) {

			value = params.sku.variant.price.number

			item.name		= params.sku.variant.product.title || ''
			item.index		= 0
			item.brand		= params.sku.variant.product.company.name || ''
			item.category	= params.sku.variant.product.category || ''
			item.price		= params.sku.variant.price.number || 0
		}

		const data = {
			event		: 'view_item',
			user_id		: u.get('id') || '',
			ecommerce	: {
				value		: value,
				currency	: 'USD',
				items		: [item]
			}
		}

		if (push) _push(data)

		if (log) console.log('gA4 viewItem', data)
	},
}