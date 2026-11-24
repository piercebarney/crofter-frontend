type Blueprint = {
	path:	string[]
	query?:	string[]
}
type Route = {
	pathname: 		string
	name: 			string
	title: 			string
	user:			boolean
	protected:		boolean
	auth:			boolean
	type:			string
	blueprint:		Blueprint|null
	[key: string]:	any
}
type RouteList = Route[]

import { account } from 'src/features/pages/account/store'
import { user } from 'src/stores/user'
import { company as c } from 'src/stores/company/store'
import { goto } from '$app/navigation'
import { listFuncs } from 'src/lists/listHelpers'
import { companyRoles } from 'src/lists/company-roles'



const consumerDefaultRoute		= 'home'
const producerDefaultRoute		= 'producer-dashboard'
const distributorDefaultRoute	= 'distributor-orders'
const authRoute					= 'welcome'
const loginRoute				= 'login'

const list:RouteList = [
	{pathname:'/verify/company-email',				name:'user-email-verify',			title:'Verify Email',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/verify/user-email',					name:'company-email-verify',		title:'Verify Email',		user:true,		protected:true,		auth:false,		type:'consumer',	blueprint:null},
	{pathname:'/account',							name:'account',						title:'Account',			user:true,		protected:true,		auth:false,		type:'all',			blueprint:null},
	{pathname:'/admin',								name:'admin',						title:'Admin',				user:true,		protected:true,		auth:false,		type:'consumer',	blueprint:null},
	{pathname:'/api',								name:'api',							title:'API',				user:false,		protected:false,	auth:false,		type:'all',			blueprint:null},
	{pathname:'/application/shop-details',			name:'shop-details',				title:'Shop Details',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/application/products/create',		name:'application-product-create',	title:'Create Product',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/application/products/edit',			name:'application-product-edit',	title:'Edit Product',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:{path:['id']}},
	{pathname:'/application/products',				name:'application-products',		title:'Products',			user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/application/payment-processing',	name:'payment-processing',			title:'Payment Processing',	user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/application',						name:'application',					title:'Seller Application',	user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/auth',								name:'auth',						title:'Auth',				user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/checkout',							name:'checkout',					title:'Checkout',			user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:null},
	{pathname:'/d/fulfillment',						name:'distributor-orders',			title:'Fulfillment',		user:true,		protected:true,		auth:false,		type:'distributor',	blueprint:null},
	{pathname:'/d/products/edit',					name:'distributor-product-edit',	title:'Edit Product',		user:true,		protected:true,		auth:false,		type:'distributor',	blueprint:{path:['id']}},
	{pathname:'/d/products',						name:'distributor-products',		title:'Products',			user:true,		protected:true,		auth:false,		type:'distributor',	blueprint:null},
	{pathname:'/d/stock',							name:'distributor-stock',			title:'Stock',				user:true,		protected:true,		auth:false,		type:'distributor',	blueprint:null},
	{pathname:'/data-deletion',						name:'data-deletion',				title:'Data Deletion',		user:false,		protected:false,	auth:false,		type:'all',			blueprint:null},
	{pathname:'/forgot',							name:'forgot',						title:'Forgot Password',	user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/legal',								name:'legal',						title:'Legal',				user:false,		protected:false,	auth:false,		type:'all',			blueprint:null},
	{pathname:'/login',								name:'login',						title:'Login',				user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/logout',							name:'logout',						title:'Logout',				user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/orders',							name:'orders',						title:'Orders',				user:true,		protected:true,		auth:false,		type:'consumer',	blueprint:null},
	{pathname:'/dashboard',							name:'producer-dashboard',			title:'Dashboard',			user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/fulfillment',						name:'producer-orders',				title:'Fulfillment',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/policies',							name:'policies',					title:'Policies',			user:false,		protected:false,	auth:false,		type:'all',			blueprint:null},
	{pathname:'/products/create',					name:'product-create',				title:'Create Product',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/products/edit',						name:'product-edit',				title:'Edit Product',		user:true,		protected:true,		auth:false,		type:'producer',	blueprint:{path:['id']}},
	{pathname:'/products',							name:'producer-products',			title:'Products',			user:true,		protected:true,		auth:false,		type:'producer',	blueprint:null},
	{pathname:'/register',							name:'register',					title:'Register',			user:true,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/reset',								name:'reset',						title:'Reset Password',		user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/sign-up',							name:'signup',						title:'Sign Up',			user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/welcome',							name:'welcome',						title:'Welcome',			user:false,		protected:false,	auth:true,		type:'all',			blueprint:null},
	{pathname:'/c',									name:'producer',					title:'Producer',			user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:{path:['id', 'name:spinalCase']}},
	{pathname:'/d',									name:'distributor',					title:'Distributor',		user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:{path:['id', 'name:spinalCase']}},
	{pathname:'/p',									name:'product',						title:'Product',			user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:{path:['id', 'title:spinalCase']}},
	{pathname:'/s',									name:'search',						title:'Search',				user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:{path:['term:encodeURIComponent'], query:['zipCode_as_z', 'fulfillment_as_f', 'proximity_as_p']}},
	{pathname:'/',									name:'home',						title:'',					user:true,		protected:false,	auth:false,		type:'consumer',	blueprint:null},
]

export const routeList = list

export const routes = {

	get : listFuncs(list).get,

	accountType : async (pathname:string, cancel:(()=>void)|null = null) => {

		if (account) {

			const routeType = matchPathname(pathname, 'type')

			const { id, type } = account.get('active')

			// console.log({pathname, routeType, id, type}, user.get('id'))

			if (routeType != 'all') {

				if (routeType == 'consumer' && (routeType != type || id != user.get('id'))) account.switchTo('consumer', user.get('id'))
				else if (!['all', 'consumer'].includes(routeType) && routeType != type)	{

					const companies = user.get('companies')

					if (companies && companies.length > 0) {

						for (const company of companies) {

							const role = companyRoles.name(company.role)

							if (role == routeType) {

								const id = company.id

								account.switchTo(role, id)

								await c.load(id)
							}
						}
					
					} else {

						if (cancel) cancel()

						goto(matchName('account', {}, 'pathname'))
					}
				}
			}
		
		} else console.error('account is undefined') //invalidateAll()
	},

	pathname : (name:string, values:Record<string,any>={}) : string => matchName(name, values, 'pathname'),

	name : (pathname:string) : string => matchPathname(pathname, 'name'),

	title : (pathname:string) : string => matchPathname(pathname, 'title'),

	user : (pathname:string) : boolean => matchPathname(pathname, 'user'),

	protected : (pathname:string) : boolean => matchPathname(pathname, 'protected'),

	auth : (pathname:string) : boolean => matchPathname(pathname, 'auth'),

	same : (name:string, pathname:string) : boolean => name === matchPathname(pathname, 'name'),

	default : () => {

		let name = consumerDefaultRoute

		const { type } = account.get('active')

		if		(type == 'producer')	name = producerDefaultRoute
		else if (type == 'distributor')	name = distributorDefaultRoute
		
		return list.find((route:Record<string,any>) => route.name === name)?.pathname || '/'
	},

	consumerDefaultRoute,

	producerDefaultRoute,

	distributorDefaultRoute,

	authRoute,

	loginRoute,

	consumerDefaultPathname : list.find((route:Record<string,any>) => route.name === consumerDefaultRoute)?.pathname || '/',

	producerDefaultPathname : list.find((route:Record<string,any>) => route.name === producerDefaultRoute)?.pathname || '/',

	distributorDefaultPathname : list.find((route:Record<string,any>) => route.name === distributorDefaultRoute)?.pathname || '/',

	authPathname : list.find((route:Record<string,any>) => route.name === authRoute)?.pathname || '/',

	loginPathname : list.find((route:Record<string,any>) => route.name === loginRoute)?.pathname || '/'
}

const matchName = (name:string, values:Record<string,any>, property:string) : any => {

	if (name == 'default') {

		name = consumerDefaultRoute

		if (user.get('id')) {

			const { type } = account.get('active')

			if		(type == 'producer')	name = producerDefaultRoute
			else if (type == 'distributor')	name = distributorDefaultRoute
		}
	}

	const route = list.find((route: Record<string,any>) => route.name === name)

	if (!route) {

		console.error(`ROUTES: ${name} is not a route`)

		return '/'
	}

	if (property == 'pathname' && route.blueprint && Object.keys(values).length > 0) return buildPathname(route.pathname, values, route.blueprint)

	return route[property]
}

const matchPathname = (pathname:string, property:string) : any => {

	// const segment = `/${pathname.split('/')[1]}`

	// const route = list.find((route:Record<string,any>) => route.pathname == segment)

	const route = list.find((route:Record<string,any>) => pathname.includes(route.pathname))

	if (property && route) return route[property]

	return route 
}

const functionList: Record<string,any> = {

	encodeURIComponent : (value:string): string => encodeURIComponent(value).replace(/'/g, '%27'),

	spinalCase : (value:string) : string => encodeURIComponent(value.replace(/[_\s]/g, '-').toLowerCase()).replace(/'/g, '%27'),
}

const buildPathname = (pathname:string, values:Record<string,any>, blueprint:Record<string,string[]>) : string => {

	const path	= [pathname],
		query	= []

	if (Object.hasOwn(blueprint, 'path') && Object.hasOwn(values, 'path')) {

		for (const item of blueprint.path) {

			let segment = ''

			if (item.includes(':')) {

				const parts = item.split(':')

				const value = values.path[parts[0]]

				segment = functionList[parts[1]](value)
			}
			else segment = values.path[item]
			
			path.push(segment)
		}
	}

	if (Object.hasOwn(values, 'query')) {

		const keys = Object.keys(values.query)

		for (const key of keys) {

			const value = values.query[key]

			let parameter = ''

			const item = Object.hasOwn(blueprint, 'query') ? blueprint.query.find((item:string) => item.includes(key)) : null

			if (item && item.includes('_as_')) {

				const parts = item.split(':')[0].split('_as_')

				parameter = `${parts[1]}=`
			
			} else parameter = `${key}=`

			if (item && item.includes(':')) {
			
				const parts = item.split(':')

				parameter += functionList[parts[1]](value)
			
			} else parameter += value
			
			query.push(parameter)
		}
	}

	const url = `${path.join('/')}${query.length > 0 ? `?${query.join('&')}` : ''}`

	return url
}