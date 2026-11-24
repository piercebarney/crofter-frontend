import type { Company } from 'src/types/company'

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { browser } from '$app/environment'
import { api } from 'src/lib/api'
import { setGet } from 'src/stores/helpers'
import { addressHelpers } from 'src/stores/company/addressHelpers'
import { orderHelpers, orderHelpersV2 } from 'src/stores/company/orderHelpers'
import { productHelpers } from 'src/stores/company/productHelpers'
import { merchantApplicationHelpers } from 'src/stores/company/merchantApplicationHelpers'
import { stockHelpers } from 'src/stores/company/stockHelpers'



const values: Record<string,Company[]> = { companies:[] }

const { subscribe, update } = writable(values)

const _companiesUpdate = (update:any) => (updatedCompany:Company) => {

	// console.log('companies update', updatedCompany)
	
	update((v:Record<string,Company[]>) => {

		const index = v.companies.findIndex((c:Company) => c.id == updatedCompany.id)

		if (index) v.company[index] = updatedCompany

		return v
	})
}

const _companyUpdate = (update:any) => (fn:any) => {

	// console.log('company update')

	return update((v:Company) => {

		const updatedCompany:Company = fn(v)

		_companiesUpdate(updatedCompany)

		return updatedCompany
	})
}

const _companyHelpers = (subscribe:any, update:any) => {

	return {
		
		...setGet(subscribe, update),
		...addressHelpers(subscribe, update),
		...orderHelpers(subscribe, update),
		...orderHelpersV2(subscribe, update),
		...productHelpers(update),
		...merchantApplicationHelpers(subscribe, update),
		...stockHelpers(subscribe, update),

		update : (data:any) => update((v:Company) => {

			if (data?.bio)				v.bio				= data.bio
			if (data?.email)			v.email				= data.email
			if (data?.image)			v.image				= data.image
			if (data?.name)				v.name				= data.name
			if (data?.operatingHours)	v.operatingHours	= data.operatingHours
			if (data?.phoneNumber)		v.phoneNumber		= data.phoneNumber
		
			return v
		}),
	}
}

const _companyStoreCreate = (company:Company) => {

	const { subscribe, update } = writable(company)

	return (():any => ({ subscribe, ..._companyHelpers(subscribe, _companyUpdate(update)) }))()
}

const load = (companyId:string) => {

	// console.log('company load', companyId)

	const company = cGet(companyId)

	if (browser && !company && companyId) api.company({ variables:{companyId} })
		.then( (data:any) => {

			if (data) {

				delete data.company._typename
	
				const company: Company = data.company

				company.merchantApplicationDetails	= null
				company.ordersByOrder				= null
				company.ordersByOrderSearch			= null
				company.ordersByProduct				= null
				company.ordersByProductSearch		= null
				company.products					= null
				company.stockItems					= null
				company.skus						= null
				company.storageLocations			= null
				company.orders						= {open:null, closed:null}
	
				update((v:Record<string,Company[]>) => {

					// console.log('company update', company)
				
					v.companies.push(company)

					return v
				})
			}
		})
}

const cGet = (companyId:string) => {

	// console.log('company get', companyId)

	const $company: Record<string,Company[]> = get({subscribe})

	const company = $company.companies.find((c:Company) => c.id == companyId)

	if	(company)	return _companyStoreCreate(company)
	else			return null
}

export const company = (():any => ({ subscribe,

	load,
	get : cGet

}))()