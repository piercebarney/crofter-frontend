import { mutate, query } from 'src/lib/server/client'
import { Money } from 'src/lib/server/api/common'
import { ProductCartItem } from 'src/lib/server/api/product'



export const CartItem:string = `
	distributorLocation {
		id
	}
	fulfillment
	id
	priceWhenCarted {
		${Money}
	}
	product {
		${ProductCartItem}
	}
	quantity`

export const Cart:string = `
	cartItems {
		${CartItem}
	}
	id
	subTotal {
		${Money}
	}
	userUuid`

export const Total:string = `
	salesTax {
		${Money}
	}
	total {
		${Money}
	}`



export const cart =
{
	cart : async (options:Record<string,any> = {}) => await query('cart', {fields:Cart}, {...options}),

	cartTotal: async (options:Record<string,any> = {}) => await query('cart', {fields:Total}, {...options}),

	cartAddCartItem : async (options:Record<string,any> = {}) => await mutate('cartAddCartItem', {
		
		variables	: {input : {
			distributorLocationId	: 'String',
			fulfillment				: 'FulfillmentValues',
			productId				: 'String!',
			quantity				: 'Int!',
		}},
		fields		: CartItem,
	
	}, {...options}),

	cartAddCartItem_partial : async (options:Record<string,any> = {}) => await mutate('cartAddCartItem', {
		
		variables	: {input : {
			distributorLocationId	: 'String',
			fulfillment				: 'FulfillmentValues',
			productId				: 'String!',
			quantity				: 'Int!',
		}},
		fields		: 'id',
	
	}, {...options}),

	cartDeleteCartItem : async (options:Record<string,any> = {}) => await mutate('cartDeleteCartItem', {

		variables	: {cartItemId : 'String!'},
		fields		: 'success',

	}, {...options}),

	cartUpdateCartItem : async (options:Record<string,any> = {}) => await mutate('cartItemUpdate', {

		variables	: {
			cartItemId	: 'String!',
			input		: {
				fulfillment	: 'FulfillmentValues',
				id			: 'String',
				quantity	: 'Int',
			}
		},
		fields		: CartItem,

	}, {...options}),

	cartUpdateCartItem_partial : async (options:Record<string,any> = {}) => await mutate('cartItemUpdate', {

		variables	: {
			cartItemId	: 'String!',
			input		: {
				fulfillment	: 'FulfillmentValues',
				id			: 'String',
				quantity	: 'Int',
			}
		},
		fields		: 'id',

	}, {...options}),
}