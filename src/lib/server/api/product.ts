import { mutate, query } from 'src/lib/server/client'
import { Money } from 'src/lib/server/api/common'
import { Address_CityState } from 'src/lib/server/api/address'



export const CompanyProductCard:string = `
	products {
		active
		company {
			name
		}
		distributors {
			id
		}
		forDelivery
		forDistribution
		forPickUp
		id
		image
		price {
			${Money}
		}
		title
		unit
	}`

export const ProductCartItem:string = `
	company {
		addresses {
			city
			state
		}
		image
		name
	}
	forDelivery
	forDistribution
	forPickUp
	id
	image
	price {
		${Money}
	}
	title
	unit`

export const ProductCard:string = `
	availability
	company {
		id
		image
		name
	}
	forDelivery
	forDistribution
	forPickUp
	id
	image
	price {
		${Money}
	}
	title
	unit`

export const ProductCardV1:string = `
	active
	availability
	company {
		addresses {
			city
			state
		}
		id
		image
		name
		role
	}
	distributors {
		id
	}
	forDelivery
	forDistribution
	forPickUp
	id
	image
	price {
		${Money}
	}
	title
	unit`

export const Product:string = `
	active
	availability
	company {
		addresses {
			${Address_CityState}
		}
		id
		image
		name
		role
	}
	description
	forDelivery
	forDistribution
	forPickUp
	id
	image
	isDeleted
	price {
		${Money}
	}
	title
	unit`

const Distributors:string = `
	distributors {
		id
		name
	}`

const DistributionLocations:string = `
	distributorLocations {
		city
		id
	}`

export const ProductAdmin:string = `
	active
	availability
	${DistributionLocations}
	${Distributors}
	forDelivery
	forDistribution
	forPickUp
	id
	price {
		${Money}
	}
	title
	unit`

export const ProductsAdmin:string = `
	products {
		${ProductAdmin}
	}`

export const DistributorLocationProduct:string = `
	products {
		${ProductCard}
	}`


export const product = {

	product : async (options:Record<string,any> = {}) => await query('product', {

		variables	: {productId:'String!'},
		fields		: Product

	}, {...options}),

	products : async (options:Record<string,any> = {}) => await query('user/companies', {
		
		variables : {
			_sub : {
				products : {
					args : {
						filterBy : {
							active					: 'Boolean',
							distributorLocationId	: 'String'
						}
					}
				}
			}
		},
		fields		: CompanyProductCard
	
	}, {index:0, field:'products', ...options}),

	productSearch : async (options:Record<string,any> = {}) => await query('productSearch', {

		variables : {
			'args!' : {
				filterBy : {
					forDelivery		: 'Boolean',
					forDistribution	: 'Boolean',
					forPickUp		: 'Boolean',
					proximity		: {
						address	: {
							city	: 'String',
							state	: 'String',
							zipCode	: 'String!'
						},
						miles	: 'Int'
					},
					term			: 'String'
				}
			}
		},
		fields		: ProductCardV1
	
	}, {key:'products', cacheQuery:false, ...options}),

	productCreate : async (options:Record<string,any> = {}) => await mutate('productCreate', {
	
		variables	: {
			companyId	: 'String!',
			input		: {
				active			: 'Boolean',
				availability	: 'String!',
				description		: 'String!',
				forDelivery		: 'Boolean',
				forDistribution	: 'Boolean',
				forPickUp		: 'Boolean',
				price			: {
					amount : 'Decimal!'
				},
				title			: 'String!',
				unit			: 'String!'
			}
		},
		fields		: Product,
		
	}, {key:'product', cacheQuery:false, ...options}),

	productUpdate : async (options:Record<string,any> = {}) => await mutate('productUpdate', {
	
		variables	: {
			productId	: 'String!',
			input		: {
				active				: 'Boolean',
				availability		: 'String',
				description			: 'String',
				forDelivery			: 'Boolean',
				forDistribution		: 'Boolean',
				forPickUp			: 'Boolean',
				price				: {
					amount : 'Decimal!'
				},
				title				: 'String',
				unit				: 'String'
			}
		},
		fields		: Product,
		
	}, {key:'product', cacheQuery:false, ...options}),

	productDelete : async (options:Record<string,any> = {}) => await mutate('productDelete', {

		variables	: {productId : 'String!'},
		fields		: 'success'

	}, {...options}),

	productAddImage : async (options:Record<string,any> = {}) => await mutate('productAddImage', {
	
		variables	: {
			productId	: 'String!',
			input		: 'Upload!'
		},
		fields		: 'image',
		
	}, {cacheQuery:false, ...options}),

	productSearch_company : async (options:Record<string,any> = {}) => await query('user/companies', {

		variables	: {_sub	: {
			products : {
				args : {
					filterBy : {
							active	: 'Boolean',
							term	: 'String'
						}
					}
				}
			}
		},
		fields		: CompanyProductCard

	}, {index:0, field:'products', ...options}),

	productsAdmin : async (options:Record<string,any> = {}) => await query('companyAdmin', {
	
		variables	: {
			getBy : {
				email		:'String',
				id			:'String',
				phoneNumber	:'String',
			}
		},
		fields		: ProductsAdmin
	
	}, {field:'products', ...options}),

	productAdmin : async (options:Record<string,any> = {}) => await query('product', {

		variables	: {productId:'String!'},
		fields		: ProductAdmin

	}, {...options}),

	productAddDistributor : async (options:Record<string,any> = {}) => await mutate('productAddDistributor', {

		variables	: {
						distributorId	: 'String!',
						productId		: 'String!'
					},
		fields		: Distributors,
		
	}, {key:'product', cacheQuery:false, ...options}),

	productRemoveDistributor : async (options:Record<string,any> = {}) => await mutate('productRemoveDistributor', {

		variables	: {
						productId		: 'String!',
						distributorId	: 'String!'
					},
		fields		: Distributors,
		
	}, {key:'product', cacheQuery:false, ...options}),

	productAddDistributorLocation : async (options:Record<string,any> = {}) => await mutate('productAddDistributorLocation', {

		variables	: {
						addressId	: 'String!',
						productId	: 'String!'
					},
		fields		: DistributionLocations,
		
	}, {key:'product', cacheQuery:false, ...options}),

	productRemoveDistributorLocation : async (options:Record<string,any> = {}) => await mutate('productRemoveDistributorLocation', {

		variables	: {
						productId		: 'String!',
						addressId		: 'String!'
					},
		fields		: DistributionLocations,
		
	}, {key:'product', cacheQuery:false, ...options}),

	distributorLocationProducts : async (options:Record<string,any> = {}) => await query('distributorLocation', {

		variables	: {addressId:'String!'},
		fields		: DistributorLocationProduct

	}, {field:'products', ...options})
}