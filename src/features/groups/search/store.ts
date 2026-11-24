import type { Search } from 'src/features/groups/search/types'

interface SearchStore extends ReturnType<typeof setGet> {
	subscribe: 			(run:(value:Search) => void, invalidate?:(value?:Search) => void) => () => void
	clear: 				(keepFocus?:boolean, redirect?:boolean) => void
	setApi:				(api:string) => void
	setSortType:		(type:string) => void
	setSortLocationId:	(locationId:string|null) => void
	check:				() => void
	do:					() => void
	setTerm:			(term:string) => void
	setFunction:		(func:any) => void
}

import { writable } from 'svelte/store'
import { goto } from '$app/navigation'
import { page } from '$app/stores'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import { routes } from 'src/lists/routes'
import { api } from 'src/lib/api'



const initialValues : Search = {
	account				: null,
	active				: false,
	api					: '',
	ariaLabel			: '',
	defaultZipCode		: null,
	enteredZipCode		: null,
	fulfillment			: null, // query param
	function			: null,
	input				: false,
	localZipCode		: null,
	locationName		: null,
	placeholder			: '',
	progTerm			: '',
	proximity			: null, // query param
	results				: null,
	searching			: false,
	sort				: {type:null, locationId:null},
	storedZipCode		: null,
	term				: '',
	zipCode				: null, // query param
	zipCodeChecked		: false
}

const { subscribe, update } = writable(initialValues)

const createSearch = () : SearchStore => {

	let searchTimeout: ReturnType<typeof setTimeout>

	const _products = (search:Search) => {
	
		const query: Record<string,string|number> = {}
	
		if (search.zipCode) query.zipCode = search.zipCode
		
		if (search.fulfillment) query.fulfillment = search.fulfillment

		if (search.proximity) query.proximity = search.proximity
	
		goto(routes.pathname('search', {path:{term:search.term}, query}), { keepFocus:true })
	}
	
	const _companyProducts = async (search:Search) => {
	
		let all: any[] = []
	
		const variables:Record<string,any> = {defaultCompany:true, filterBy_active:true, filterBy_term:search.term}
	
		const { products:active } = await api.productSearch_company({ variables })
	
		if (active) all = active

		variables.filterBy_active = false
	
		const { products:hidden } = await api.productSearch_company({ variables })
	
		if (hidden) all = all.concat(hidden)
	
		update((v:Search) => { 
			
			v.searching = false
	
			v.results = all
			
			return v
		})
	}
	
	const _companySortByOrder = async (search:Search) => {

		if (!search.function?.byOrder) return
	
		// const variables:Record<string,any> = {defaultCompany:true, filterBy_phoneNumber:search.term}

		// if (search.sort.locationId) variables.filterBy_distributorLocationId = search.sort.locationId
	
		await search.function.byOrder(search.sort.locationId, search.term)
	
		update((v:Search) => { 
			
			v.searching	= false
			v.results	= true
			
			return v
		})
	}
	
	const _companySortByProduct = async (search:Search) => {

		if (!search.function?.byProduct) return
	
		// const variables:Record<string,any> = {defaultCompany:true, filterBy_active:null, filterBy_term:search.term}

		// if (search.sort.locationId) variables.filterBy_distributorLocationId = search.sort.locationId
	
		await search.function.byProduct(search.sort.locationId, search.term)
	
		update((v:Search) => { 
			
			v.searching	= false
			v.results	= true
			
			return v
		})
	
	}
	
	const clear = (keepFocus = false, redirect = true) => {
	
		update((v:Search) => {
	
			v.input		= false
			v.term		= ''
			v.progTerm	= ''
			v.results	= null
			v.active	= false
			v.searching	= false
			
			return v
		})
	
		if (redirect) {
	
			const $page		= get({subscribe:page.subscribe})
			const pathname	= $page.url.pathname
	
			if (routes.same('search', pathname)) {
				
				goto(routes.pathname('home'), { keepFocus })
	
				setTimeout(() => document.getElementById('search-input')?.focus(), 10)
			}
		}
	}
	
	const store = {subscribe, ...setGet(subscribe, update),

		clear,

		setApi : (api:string) => update((v:Search) => {

			if (api == 'companyProducts') {

				v.api			= api
				v.placeholder	= 'Search'
				v.ariaLabel		= 'product search'

			} else if (api == 'companySortByOrder') {

				v.api			= api
				v.placeholder	= 'Search by Phone Number'
				v.ariaLabel		= 'order search'

			} else if (api == 'companySortByProduct') {

				v.api			= api
				v.placeholder	= 'Search by Product Name'
				v.ariaLabel		= 'order search'
			
			} else {

				v.api			= 'products'
				v.placeholder	= "I'm searching for..."
				v.ariaLabel		= 'product search'
			}

			return v
		}),

		setSortType : (type:string) => update((v:Search) => {
			
			clear()
			
			v.sort.type = type
			
			return v
		}),

		setSortLocationId : (locationId:string|null) => update((v:Search) => {
			
			// clear()
			
			v.sort.locationId = locationId
			
			return v
		}),

		check : () => {

			// console.log('=> check')

			const search: Search = get(store)
			
			if (search.active) clear()
		},

		do : () => {

			const search: Search = get(store)

			// console.log('=> do')

			clearTimeout(searchTimeout)

			update((v:Search) => {
						
				v.input	= true
				
				return v
			})

			if (search.term.length >= 3) {

				searchTimeout = setTimeout(async () => {

					update((v:Search) => {
						
						v.input		= false
						v.results	= null
						v.searching	= true
						v.active	= true
						
						return v
					})

					if		(search.api == 'products')				_products(search)
					else if	(search.api == 'companyProducts')		_companyProducts(search)
					else if	(search.api == 'companySortByOrder')	_companySortByOrder(search)
					else if (search.api == 'companySortByProduct')	_companySortByProduct(search)

				}, 500)

			} else if (search.term.length === 0) clear(true)
		},

		setTerm : (term:string) => update((v:Search) => {v.progTerm = term; return v}),

		setFunction : (func:any) => update((v:Search) => {v.function = func; return v})
	}

	return store
}

export const search = createSearch()