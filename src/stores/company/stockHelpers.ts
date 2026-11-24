import type { Company } from 'src/types/company'

import { get } from 'svelte/store'
import { apiV2 } from 'src/lib/apiV2'



export const stockHelpers = (subscribe:any, update:any) => {

	const buildVariantOption = (variant:any) => {

		const companyName	= variant.product?.company?.name ?? ''
		const productTitle	= variant.product?.title ?? ''
		const price			= variant.price.string
		const unit			= variant.unit || ''

		return {
			value	: variant.id,
			option	: `${companyName} - ${productTitle} - ${price}${unit ? '/' + unit : ''}`
		}
	}

	return {

		stockFetch : async () => {

			// console.log('stockFetch')

			const $company: Company	= get({subscribe})

			if (!$company.stockItems) apiV2.stockItems().then((data:any) => update((v:Company) => {v.stockItems = data.stockItems; return v}))

			if (!$company.skus) apiV2.skus().then((data:any) => update((v:Company) => {v.skus = data.skus; return v}))
				
			if (!$company.storageLocations) apiV2.storageLocations().then((data:any) => update((v:Company) => {v.storageLocations = data.storageLocations; return v}))

			if (!$company.variants) apiV2.variants().then((data:any) => update((v:Company) => {v.variants = data.variants; return v}))
		},

		variantOptionById : (id:string) => {

			const $company: Company	= get({subscribe})
			const variant			= $company.variants?.find((v:any) => v.id == id)

			return buildVariantOption(variant)
		},

		variantOptions : async () => {

			const $company: Company	= get({subscribe})
			const variants			= $company.variants

			const options = variants?.map(buildVariantOption).sort((a:any, b:any) => {

				if (a.option < b.option) return -1
				if (a.option > b.option) return 1

				return 0
			})

			return options
		},

		// Stock Items
		addStockItem : async (stockItem:any) => update((v:Company) => {v.stockItems?.push(stockItem); return v}),

		getStockItemById : (id:string) => {

			const $company: Company	= get({subscribe})
			const stockItem			= $company.stockItems?.find((s:any) => s.id == id)

			return stockItem
		},

		getStockItemsWithStorageLocationAndSkuNames : () => {

			const $company: Company	= get({subscribe})
			const stockItems		= $company.stockItems?.map((i:any) => {

				const storageLocation	= $company.storageLocations?.find((l:any) => l.id == i.storageLocationId)
				const sku				= $company.skus?.find((s:any) => s.id == i.skuId)

				return {
					...i,
					storageLocation,
					sku
				}
			})

			// sort by storage location name, then sku code
			return stockItems?.sort((a:any, b:any) => {

				if (a.storageLocation.name < b.storageLocation.name) return -1
				if (a.storageLocation.name > b.storageLocation.name) return 1
				if (a.sku.code < b.sku.code) return -1
				if (a.sku.code > b.sku.code) return 1
				
				return 0
			})
		},

		getStockItemsByStorageLocationId : (id:string) => {

			const $company: Company	= get({subscribe})
			const skus				= $company.skus
			const stockItems		= $company.stockItems?.filter((i:any) => i.storageLocationId == id)

			// sort alphabetically by sku code
			return stockItems?.sort((a:any, b:any) => {

				const skuA	= skus?.find((s:any) => s.id == a.skuId)
				const skuB	= skus?.find((s:any) => s.id == b.skuId)

				// Handle missing SKUs - push them to end
				if (!skuA?.code) return 1
				if (!skuB?.code) return -1

				// Use localeCompare for proper string comparison
				return skuA.code.localeCompare(skuB.code)
			})
		},

		setStockItem : async (id:string, stockItem:any) => update((v:Company) => {

			if (!v.stockItems) return v
			
			const index = v.stockItems.findIndex(i => i.id == id)

			if (index > -1) v.stockItems[index] = stockItem

			return v
		}),

		setStockItemCount : async (id:string, count:number) => {

			const { success } = await apiV2.stockItem({id, set:{count}})

			if (success) {
				
				update((v:Company) => {

					if (v.stockItems) {

						const index = v.stockItems.findIndex(i => i.id == id)

						if (index > -1) v.stockItems[index].count = count
					}

					return v
				})

				return true
			}

			return false
		},

		adjustStockItemCount : async (id:string, count:number) => {

			const { success } = await apiV2.stockItemAdjust({id, set:{adjustment:count}})

			if (success) {

				update((v:Company) => {

					if (v.stockItems) {

						const index = v.stockItems.findIndex(i => i.id == id)

						if (index > -1) v.stockItems[index].count += count
					}

					return v
				})

				return true
			}

			return false
		},

		removeStockItem : async (id:string) => {
			
			const { success } = await apiV2.stockItem({id, method:'delete'})

			if (success) {
				
				update((v:Company) => {

					if (!v.stockItems) return v

					const index = v.stockItems.findIndex(i => i.id == id)

					if (index > -1) v.stockItems.splice(index, 1)

					return v
				})
			}
		},


		// Storage Locations
		addStorageLocation : async (storageLocation:any) => update((v:Company) => {v.storageLocations?.push(storageLocation); return v}),

		getStorageLocationById : (id:string) => {

			const $company: Company	= get({subscribe})
			const storageLocation	= $company.storageLocations?.find((l:any) => l.id == id)

			return storageLocation
		},

		storageLocationOptions : () => {

			// console.log('storageLocationOptions')

			const $company: Company	= get({subscribe})
			const storageLocations	= $company.storageLocations

			return storageLocations?.map((l:any) => ({value:l.id, option:l.name})).sort((a:any, b:any) => a.option.localeCompare(b.option)) ?? []
		},

		setStorageLocation : async (id:string, storageLocation:any) => update((v:Company) => {

			// console.log('setStorageLocation', id, storageLocation)

			if (!v.storageLocations) return v
			
			const index = v.storageLocations.findIndex((l:any) => l.id == id)
			
			if (index > -1) v.storageLocations[index] = storageLocation
			
			return v
		}),

		removeStorageLocation : async (id:string) => {

			// console.log('removeStorageLocation', id)
			
			const { success } = await apiV2.storageLocation({id, method:'delete'})

			if (success) {
				
				update((v:Company) => {

					if (v.storageLocations && v.stockItems) {
						
						const index = v.storageLocations.findIndex((s:any) => s.id == id)
							
						if (index > -1) v.storageLocations.splice(index, 1)

						const stockItemIndexes = v.stockItems?.map((s:any, i:number) => s.storageLocationId == id ? i : -1).filter((i:number) => i > -1) ?? []

						for (const index of stockItemIndexes) v.stockItems?.splice(index, 1)
					}
					
					return v
				})
			}
		},


		// SKUs
		addSku : async (sku:any) => update((v:Company) => {v.skus?.push(sku); return v}),

		getSkuById : (id:string) => {

			const $company: Company	= get({subscribe})
			const sku				= $company.skus?.find((s:any) => s.id == id)

			return sku
		},

		skuOptions : () => {

			const $company: Company	= get({subscribe})
			const skus				= $company.skus

			return skus?.map((s:any) => ({value:s.id, option:s.code})).sort((a:any, b:any) => a.option.localeCompare(b.option)) ?? []
		},

		setSku : async (id:string, sku:any) => update((v:Company) => {

			if (!v.skus) return v
			
			const index = v.skus.findIndex((s:any) => s.id == id)
			
			if (index > -1) v.skus[index] = sku
			
			return v
		}),

		removeSku : async (id:string) => {

			const { success } = await apiV2.sku({id, method:'delete'})

			if (success) {
				
				update((v:Company) => {

					if (v.skus && v.stockItems) {
						
						const index = v.skus.findIndex((s:any) => s.id == id)
							
						if (index > -1) v.skus.splice(index, 1)

						const stockItemIndexes = v.stockItems?.map((s:any, i:number) => s.skuId == id ? i : -1).filter((i:number) => i > -1) ?? []

						for (const index of stockItemIndexes) v.stockItems?.splice(index, 1)
					}
					
					return v
				})
			}
		},


	}
}