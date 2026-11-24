import type { Company } from 'src/types/company'

import { get } from 'svelte/store'
import { api } from 'src/lib/api'


export const merchantApplicationHelpers = (subscribe:any, update:any) => ({

	merchantApplicationFetch : async () => {

		const $company:	Company	= get({subscribe})
		const companyId			= $company.id

		const { merchantApplicationDetails } = await api.companyMerchantApplication({ variables:{companyId} })

		if (merchantApplicationDetails) update((v:Company) => {

			v.merchantApplicationDetails = merchantApplicationDetails

			return v
		})
	},

	merchantApplicationUpdate : (data:any) => update((v:Company) => {

		if (v.merchantApplicationDetails) v.merchantApplicationDetails.application = data.application

		return v
	}),

	merchantApplicationStatusUpdate : (data:any) => update((v:Company) => {

		if (v.merchantApplicationDetails) v.merchantApplicationDetails.status = data.status

		return v
	})
})