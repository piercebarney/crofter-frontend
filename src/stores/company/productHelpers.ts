import type { Company } from 'src/types/company'
import type { Product } from 'src/types/product'

import { apiV2 } from 'src/lib/apiV2'



export const productHelpers = (update:any) => {

	return {

		productsFetch : async (distributorLocationId:string|null = null) => {

			const variables:Record<string,any> = {}

			if (distributorLocationId) variables.filterBy_distributorLocationId = distributorLocationId

			const { products } = await apiV2.productListItems()

			if (products) update((v:Company) => {

				v.products = products

				return v
			})
		},

		productAdd : (product:Product) => update((v:Company) => {

			if (v.products) {

				const productId = product.id
				const index		= v.products.findIndex(p => p.id == productId)

				if (index > -1) return v
				
			} else v.products = []

			v.products.unshift(product)

			return v
		}),

		productUpdate : (product:Product) => update((v:Company) => {

			if (v.products) {

				const productId = product.id
				const index		= v.products.findIndex(p => p.id == productId)

				if (index > -1) {

					v.products[index] = product	
				
					return v
				} 

			} else v.products = []

			v.products.unshift(product)

			return v
		}),

		productDelete : (productId:string) => update((v:Company) => {

			if (v.products) {

				const index = v.products.findIndex(p => p.id == productId)

				if (index > -1) v.products.splice(index, 1)
			}

			return v
		})
	}
}