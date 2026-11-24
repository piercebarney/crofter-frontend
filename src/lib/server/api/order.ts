import { mutate, query } from 'src/lib/server/client'
import { Money } from 'src/lib/server/api/common'
import { AddressDelivery, Address } from 'src/lib/server/api/address'
import { Product, ProductCard } from 'src/lib/server/api/product'
import { Company } from 'src/lib/server/api/company'



export const OrderItem:string = `
	fulfillment
	id
	priceWhenOrdered {
		${Money}
	}
	product {
		${Product}
	}
	quantity
	status`

export const Order:string = `
	company {
		${Company}
	}
	createdDate
	deliveryAddress {
		${AddressDelivery}
	}
	id
	orderItems {
		${OrderItem}
	}
	user { 
		id
	}`

export const OrderError:string = `
	reason
	status`

export const OrderSubmissionResult:string = `
	... on Order {
		${Order}
	}
	... on OrderError {
		${OrderError}
	}`

export const OrderItem_Company:string = `
	distributorLocation {
		city
		id
	}
	fulfillment
	id
	product {
		id
		image
		title
		unit
	}
	quantity
	status`

export const OrderByOrder_Company:string = `
	orders {
		createdDate
		id
		orderItems {
			${OrderItem_Company}
		}
		updatedDate
		user {
			firstName
			lastName
			phoneNumber
		}
	}`

export const OrderByProduct_Company:string = `
	products {
		id
		image
		orders {
			createdDate
			id
			orderItems {
				distributorLocation {
					city
					id
				}
				fulfillment
				id
				quantity
				status
			}
			user {
				firstName
				lastName
			}
		}
		title
		unit
	}`

export const OrderDetails:string = `
	company {
		addresses {
			${Address}
		}
		id
		image
		name
	}
	id
	orderItems {
		fulfillment
		id
		priceWhenOrdered {
			${Money}
		}
		product {
			id
			image
			title
			unit
		}
		quantity
		status
	}
	salesTax {
		asString
	}
	subTotal {
		asString
	}
	total {
		asString
	}`

export const Order_Open:string = `
	createdDate
	id
	orderItems {
		distributorLocation {
			id
		}
		fulfillment
		id
		priceWhenOrdered {
			${Money}
		}
		product {
			company {
				name
			}
			id
			image
			price {
				${Money}
			}
			title
			unit
		}
		quantity
		status
	}
	salesTax {
		${Money}
	}
	total {
		${Money}
	}`
	

export const Order_Closed:string = `
	createdDate
	id
	orderItems {
		status
	}
	total {
		${Money}
	}`

export const Order_Recent:string = `
	orders {
		createdDate
		orderItems {
			product {
				${ProductCard}
			}
		}
	}`

export const OrderDetails_Company:string = `
	orders {
		createdDate
		deliveryAddress {
			${AddressDelivery}
		}
		id
		orderItems {
			distributorLocation {
				city
			}
			fulfillment
			priceWhenOrdered {
				asString
			}
			product {
				company {
					name
				}
				id
				title
				unit
			}
			quantity
			salesTax {
				asString
			}
			status
			subTotal {
				asString
			}
			total {
				asString
			}
		}
		salesTax {
			asString
		}
		subTotal {
			asString
		}
		total {
			asString
		}
		updatedDate
		user {
			email
			firstName
			lastName
			phoneNumber
		}
	}`


	
export const order = {

	orderSubmit : async (options:Record<string,any> = {}) => await mutate('orderSubmit', {

		variables	: {input : {
			addressId : 'String'
		}},
		fields		: OrderSubmissionResult

	}, {key:'orders', ...options}),

	orders : async (options:Record<string,any> = {}) => await query('user', {
		
		fields:`orders{${Order}}`
	
	}, {key:'orders', ...options}),

	order : async (options:Record<string,any> = {}) => await query('user/orderDetails', {
		
		variables	: {orderId:'String!'},
		fields		: Order
	
	}, {...options}),

	orders_open : async (options:Record<string,any> = {}) => await query('user/orders', {
		
		variables	: {
			args : {
				filterBy : {
					status	: 'StatusValues'
				}
			}
		},

		fields : Order_Open
	
	}, {key:'orders', variables:{filterBy_status:'OPEN'}, ...options}),

	orders_closed : async (options:Record<string,any> = {}) => await query('user/orders', {

		variables	: {
			args : {
				filterBy : {
					status	: 'StatusValues'
				}
			}
		},
		
		fields : Order_Closed
	
	}, {key:'orders', variables:{filterBy_status:'FULFILLED'}, ...options}),

	orders_recent : async (options:Record<string,any> = {}) => await query('user', {
		
		fields : Order_Recent
	
	}, {...options}),

	orderDetails : async (options:Record<string,any> = {}) => await query('user/orderDetails', {
		
		variables	: {orderId:'String!'},
		fields		: Order_Open
	
	}, {key:'order', ...options}),

	ordersByOrder_company : async (options:Record<string,any> = {}) => await query('user/companies', {

		variables : {
			_sub : {
				orders : {
					args : {
						filterBy	: {
							distributorLocationId	: 'String',
							phoneNumber				: 'String',
							status					: 'StatusValues'
						},
						limit		: 'Int',
						orderBy		: 'OrdersOrderBy'
					}
				}
			}
		},
		fields : OrderByOrder_Company

	}, {index:0, field:'orders', ...options}),

	ordersByOrderFulfilledTotal_company : async (options:Record<string,any> = {}) => await query('user/companies', {

		variables : {
			_sub : {
				orders : {
					args : {
						filterBy	: {
							distributorLocationId	: 'String',
							phoneNumber				: 'String',
							status					: 'StatusValues'
						},
						orderBy		: 'OrdersOrderBy'
					}
				}
			}
		},
		fields : 'orders{orderItems{distributorLocation{id}}}'

	}, {index:0, key:'total', field:'orders', ...options, variables:{...options.variables, filterBy_status:'FULFILLED'}}),

	ordersByProduct_company : async (options:Record<string,any> = {}) => await query('user/companies', {

		variables : {
			_sub : {
				products : {
					args : {
						filterBy : {
							active					: 'Boolean',
							distributorLocationId	: 'String',
							term					: 'String'
						}
					}
				}
			}
		},
		fields : OrderByProduct_Company

	}, {index:0, field:'products', ...options}),

	orderChangeStatus : async (options:Record<string,any> = {}) => await mutate('orderChangeStatus', {

		variables	: {
			input	: {
				status	: 'Status!'
			},
			orderId	: 'String!'
		},
		fields		: `orderItems {id, status}`

	}, {field:'orderItems', ...options}),

	orderItemChangeStatus : async (options:Record<string,any> = {}) => await mutate('orderItemChangeStatus', {

		variables	: {
			input		: {
				status	: 'Status!'
			},
			orderItemId	: 'String!'
		},
		fields		: `status`

	}, {...options}),

	orderDetails_company : async (options:Record<string,any> = {}) => await query('user/companies', {

		variables	: {
			defaultCompany	: 'Boolean',
			_sub			: {
				orders : {
					args : {
						filterBy : {
							id : 'String'
						}
					}
				}
			}
		},
		fields		: OrderDetails_Company

	}, {index:0, field:'orders', ...options}),

	orderCancel_company : async (options:Record<string,any> = {}) => await mutate('orderCancel', {

		variables	: {
			companyId	: 'String!',
			orderId		: 'String!'
		},
		fields		: 'success'

	}, {key:'result', ...options})
}