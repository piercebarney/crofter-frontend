import type { Company } from 'src/types/company'
import type { Address } from 'src/types/address'

import { get } from 'svelte/store'



export const addressHelpers = (subscribe:any, update:any) => {

	return {

		addressAdd : (address:Address) => update((v:Company) => { v.addresses.push(address); return v }),

		addressUpdate : (address:Address) => update((v:Company) => {
				
			const index = v.addresses.findIndex((a:Address) => a.id == address.id)

			v.addresses[index] = address

			return v
		}),

		addressUpdateDefault : (address:Address) => update((v:Company) => {

			v.addresses.forEach((a:Address) => a.isDefault = false)
			
			const index = v.addresses.findIndex((a:Address) => a.id == address.id)

			v.addresses[index].isDefault = true

			return v
		}),

		addressDelete : (addressId:string) => update((v:Company) => {

			v.addresses = v.addresses.filter((a:Address) => a.id != addressId)

			return v
		}),

		addressOptions : (withNone:boolean = true) => {

			const $company: Company	= get({subscribe})
			const addresses			= $company.addresses.map((a:Address) => ({value:a.id, option:a.address1 + ', ' + a.city + ', ' + a.state}))

			if (withNone) addresses.push({value:'', option:'None'})

			return addresses
		}
	}
}