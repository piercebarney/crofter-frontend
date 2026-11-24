import type { User } from 'src/types/user'
import type { Address } from 'src/types/address'
import type { Company_Partial } from 'src/types/company'

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'


const values: User = {
	addresses		: [],
	companies		: [],
	defaultAddress	: null,
	email			: '',
	emailVerified	: null,
	firstName		: '',
	id				: null,
	insertedAt		: '',
	lastName		: '',
	paymentToken	: null,
	phoneNumber		: '',
	role			: '',
	zipCode			: ''
}

const { subscribe, update } = writable(values)

export const user = (():any => ({ subscribe, ...setGet(subscribe, update),

	clear : () => update((v:User) => {

		v = {
			addresses		: [],
			companies		: [],
			defaultAddress	: null,
			email			: '',
			emailVerified	: null,
			firstName		: '',
			id				: null,
			insertedAt		: '',
			lastName		: '',
			paymentToken	: null,
			phoneNumber		: '',
			role			: '',
			zipCode			: ''
		}

		return v
	}),

	fullName : () => {

		const $user: User = get({subscribe})

		const fullName = []

		if ($user.firstName) fullName.push($user.firstName)
		if ($user.lastName) fullName.push($user.lastName)

		return fullName.join(' ')
	},

	addressAdd : (address:Address) => update((v:User) => { v.addresses.push(address); return v }),

	getAddress : (id:string|null = null) => {

		const $user: User = get({subscribe})

		if (!id) return null

		return $user.addresses.find((address:Address) => address.id === id) ?? null
	},

	addressUpdate : (address:Address) => update((v:User) => {
		
		const index = v.addresses.findIndex((a:Address) => a.id == address.id)

		v.addresses[index] = address

		return v
	}),

	addressUpdateDefault : (address:Address) => update((v:User) => {

		v.addresses.forEach((a:Address) => a.isDefault = false)
		
		const index = v.addresses.findIndex((a:Address) => a.id == address.id)

		v.addresses[index].isDefault = true

		return v
	}),

	addressDelete : (addressId:string) => update((v:User) => {

		v.addresses = v.addresses.filter((a:Address) => a.id != addressId)

		return v
	}),

	companyAdd : (company:Company_Partial) => update((v:User) => { v.companies.push(company); return v }),

	companyUpdate : (company:Company_Partial) => update((v:User) => {

		const index = v.companies.findIndex((c:Company_Partial) => c.id == company.id)

		v.companies[index].name = company.name

		return v
	})

}))()