import type { Sku } from 'src/types/sku'
interface SkusStore extends ReturnType<typeof setGet> {
	subscribe: 			(run:(value:Sku[]) => void, invalidate?:(value?:Sku[]) => void) => () => void
	fetch: 				() => Promise<void>
	getByActive: 		(activity?:boolean) => Sku[]
	getById: 			(skuId:string) => Sku|null
	getByVariantId: 	(variantId:string) => Sku|null
	getByCategoryId: 	(categoryId:string) => Sku[]
	listByCategory: 	(orderBy:string|null) => {category:string, skus:Sku[]}[]
}

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import { apiV2 } from 'src/lib/apiV2'
import { categories as c } from 'src/lists/categories'


const initialValues: Sku[] = []

const { subscribe, update } = writable(initialValues)

const createSkuStore = (): SkusStore => {

	const store: SkusStore = {subscribe, ...setGet(subscribe, update),

		/**
		 * Fetches skus from the API
		 */
		fetch : async () => {

			const { skus } = await apiV2.skusOrderedByCompany()

			if (skus) update(() => skus)
		},

		/**
		 * Gets skus by activity
		 * @param active - Activity status
		 * @returns Array of skus
		 */
		getByActive : (active:boolean = true): Sku[] => get(store).filter((sku:Sku) => sku.active === active && (sku.canPickUp || sku.canDeliver)),

		/**
		 * Gets sku by id
		 * @param skuId - Sku id
		 * @returns Sku
		 */
		getById : (skuId:string): Sku|null => get(store).find((sku: Sku) => sku.id === skuId) || null,

		/**
		 * Gets sku by variant id
		 * @param variantId - Variant id to filter by
		 * @returns Sku
		 */
		getByVariantId : (variantId:string): Sku|null => get(store).find((sku: Sku) => sku.variantId === variantId) || null,

		/**
		 * Gets skus by category id
		 * @param categoryId - Category id to filter by ('other' includes uncategorized)
		 * @returns Array of active SKUs in the specified category
		 */
		getByCategoryId : (categoryId:string): Sku[] => {

			const $skus = get(store)

			if (!$skus || !Array.isArray($skus)) return []

			const skus = $skus.filter((sku:Sku) => {

				if (sku.active === false || (!sku.canPickUp && !sku.canDeliver)) return false
				
				const category = sku.variant.product.category

				if (categoryId === 'other')	return category === 'other' || !category
				else 						return category === categoryId
			})

			return skus
		},

		/**
		 * Lists skus by category
		 * @returns Array of objects with category and skus
		 */
		listByCategory : (orderBy:string|null = null) => {

			const $skus = get(store)

			if (!$skus || !Array.isArray($skus)) return []

			const byCategory: {category:string, skus:Sku[]}[] = []

			for (const sku of $skus) {

				// Skip inactive SKUs
				if (sku.active === false || (!sku.canPickUp && !sku.canDeliver)) continue
		
				const category = sku.variant.product.category ?? 'other'

				// Find or create category group
				let categoryGroup = byCategory.find((c) => c.category === category)

				if (!categoryGroup) {

					categoryGroup = {category, skus:[]}

					byCategory.push(categoryGroup)
				}

				// Add sku to category
				categoryGroup.skus.push(sku)
			}

			// sort each skus array by displayOrder (lowest to highest, nulls last), company name, then by product title
			// (sku.displayOrder, sku.variant.product.company.name, sku.variant.product.title)
			for (const group of byCategory) {
			
				group.skus.sort((a:Sku, b:Sku) => {

					// Handle nulls last
					if (a.displayOrder === null && b.displayOrder !== null) return 1
					if (a.displayOrder !== null && b.displayOrder === null) return -1
					if (a.displayOrder !== null && b.displayOrder !== null && a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder

					const aCompany = a?.variant?.product?.company?.name ?? ''
					const bCompany = b?.variant?.product?.company?.name ?? ''

					if (aCompany !== bCompany) return aCompany.localeCompare(bCompany)

					const aTitle = a?.variant?.product?.title ?? ''
					const bTitle = b?.variant?.product?.title ?? ''

					return aTitle.localeCompare(bTitle)
				})
			}

			switch(orderBy) {

				case 'displayOrder':
					return byCategory.sort((a, b) => {
				
						const aOrder = c.order(a.category)
						const bOrder = c.order(b.category)
						
						return aOrder - bOrder
					})

				default:
					// sort by category name with other at the end then return
					return byCategory.sort((a, b) => {

						if (a.category === 'other') return 1
						if (b.category === 'other') return -1
				
						return a.category.localeCompare(b.category)
					})
			}
		}
	}

	return store
}

export const skus = createSkuStore()