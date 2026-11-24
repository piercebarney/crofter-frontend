<script lang="ts">

	import type { Keys, Sections, Objects, ProductTabs, ProductData, TabKeys, MessageOptions, ProductObject, ProductFetchVariables, ProductTabKeys } from 'src/features/groups/admin/pages/portal/types'

	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { api } from 'src/lib/api'
	import Section from 'src/features/groups/admin/pages/portal/wrappers/section.svelte'
	import Tab from 'src/features/groups/admin/pages/portal/partials/section-tab.svelte'
	import All from 'src/features/groups/admin/pages/portal/units/product/segments/all-content.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/units/product/segments/lookup-content.svelte'


	
	export let key:			Keys
	export let title:		string
	export let sections:	Sections
	export let objects:		Objects

	const tabs: ProductTabs = { company:'lookup', product:'all', user:'lookup' }

	let productAllData:		ProductData[]|null								= null,
		productLookupData:	ProductData|null								= null,
		tabSelector: 		(sectionName:Keys, tabName:TabKeys) => void,
		messageUpdate: 		(id:string, options:MessageOptions) => void,
		distributorsLoading													= false,
		distributorsFailed													= false,
		distributorLocationsLoading											= false,
		distributorLocationsFailed											= false

	const product: ProductObject = {
		filteredCount				: 0,
		fetchAllTerm				: '',
		searchTerm					: '',
		distributors				: null,
		distributorLocations		: null,

		tabs : (tabName:ProductTabKeys) => tabSelector('product', tabName),

		search : (type:string) => {

			if (type == 'clear') {

				product.searchTerm	= ''
				productLookupData			= null

			} else product.fetch({[type]:product.searchTerm})	
		},

		update : async (key:string, data?:Record<string,any>) => {

			messageUpdate('product-lookup', { message: 'Updating...', type: 'info', display: true })

			switch (key) {

				case 'active': {

					const active = data?.active

					const { error:activeError } = await api.productUpdate({ variables:{productId:productLookupData?.id, active} })

					if (activeError) {

						console.error('product: update active error', activeError)
						
						messageUpdate('product-lookup', { message: 'Server Error: Could not update active', type: 'error' })
					
					} else {

						console.log('product: update active success')

						if (productLookupData) productLookupData.active = active
						
						messageUpdate('product-lookup', { display: false })
					}

					break
				}

				case 'fulfillment': {

					const variables:Record<string,any> = {productId:productLookupData?.id}

					if (data?.fulfillment == 'delivery') variables.forDelivery = true

					if (data?.fulfillment == 'distribution') variables.forDistribution = true

					if (data?.fulfillment == 'pickup') variables.forPickUp = true

					const { error:fulfillmentError } = await api.productUpdate({ variables })

					if (fulfillmentError) {

						console.error('product: update fulfillment error', fulfillmentError)
						
						messageUpdate('product-lookup', { message: 'Server Error: Could not update fulfillment', type: 'error' })
					
					} else {

						console.log('product: update fulfillment success')

						messageUpdate('product-lookup', { display: false })
					}

					break
				}

				case 'distributor': {

					const distributorId	= data?.distributorId
					const productId		= productLookupData?.id
					const checked		= data?.checked

					let product	= null,
						error	= checked === undefined ? true : null

					if		(checked === true)	({ product, error } = await api.productAddDistributor({ variables:{distributorId, productId} }))
					else if	(checked === false)	({ product, error } = await api.productRemoveDistributor({ variables:{distributorId, productId} }))

					if	(error) {

						console.error('product: update distributor error', error)
						
						messageUpdate('product-lookup', { message: 'Server Error: Could not update distributor', type: 'error' })
					
					} else {

						console.log('product: update distributor success')

						if (productLookupData) productLookupData.distributors = product.distributors
						
						messageUpdate('product-lookup', { display: false })
					}

					break
				}

				case 'distributorLocation': {

					// console.log('product: update distributor location', data)

					const variables:Record<string,any> = {productId:productLookupData?.id, addressId:data?.addressId}

					const checked = data?.checked

					let product	= null,
						error	= checked === undefined ? true : null

					if		(checked === true)	({ product, error } = await api.productAddDistributorLocation({ variables, debug:true }))
					else if	(checked === false)	({ product, error } = await api.productRemoveDistributorLocation({ variables }))

					if	(error) {

						console.error('product: update distributor location error', error)
						
						messageUpdate('product-lookup', { message: 'Server Error: Could not update distribution location', type: 'error' })
					
					} else {

						console.log('product: update distributor location success')

						if (productLookupData) productLookupData.distributorLocations = product.distributorLocations
						
						messageUpdate('product-lookup', { display: false })
					}

					break
				}

				case 'delete': {

					const proceed = confirm('Are you sure you want to delete this product?')

					if (!proceed) break


					const productId	= productLookupData?.id

					const { error } = await api.productDeleteAdmin({ variables:{productId} })

					if (error) {

						console.error('product: delete error', error)
						
						messageUpdate('product-lookup', { message: 'Server Error: Could not delete product', type: 'error' })
					
					} else {

						console.log('product: delete success')

						product.search('clear')

						messageUpdate('product-lookup', { display: false })
					}

					break
				}

				default:

					messageUpdate('product-lookup', { display: false })

					break
			}
		},

		fetchAll : async (type:string, companyId?:string) => {

			productAllData = null

			if (type == 'clear') product.fetchAllTerm	= ''
			else {

				messageUpdate('product-all', { message: 'Loading...', type: 'info', display: true })

				if (companyId) product.fetchAllTerm = companyId

				const { products, error } = await api.productsAdmin({ variables:{ [type]:product.fetchAllTerm } })

				if (error) {

					console.error('product: fetch all error', error)
					
					messageUpdate('product-all', { message: 'Server Error: Could not fetch products', type: 'error' })
				
				} else if	(products.length > 0) {

					console.log('product: fetch all', products)

					product.filteredCount	= products.length
					productAllData			= products

					messageUpdate('product-all', { display: false })
				
				} else {

					console.log('product: fetch all no products found')
					
					messageUpdate('product-all', { message: 'No products found', type: 'none' })
				}
			}
		},

		fetch : async (variables:ProductFetchVariables) => {

			productLookupData = null

			if (tabs.product != 'lookup') product.tabs('lookup')

			messageUpdate('product-lookup', { message: 'Loading...', type: 'info', display: true })

			const { product:p, error } = await api.productAdmin({ variables })

			if (error) {

				console.error('product: fetch error', error)
				
				messageUpdate('product-lookup', { message: 'Server Error: Could not fetch product', type: 'error' })
			
			} else if (p) {

				console.log('product: fetch', p)

				productLookupData = p

				messageUpdate('product-lookup', { display: false })

			} else {

				console.log('product: fetch no product found')
				
				messageUpdate('product-lookup', { message: 'Product not found', type: 'none' })
			}
		}
	}

	$: product && objects.product == null && (objects.product = product)

	onMount(async () => {

		if (!browser) return

		if (product.distributors == null && !distributorsLoading && !distributorsFailed) {

			distributorsLoading = true

			product.distributors = []

			const { distributors, error } = await api.distributors()

			if (error) {

				console.error('product: fetch distributors error', error)

				messageUpdate('product-lookup', { message: 'Server Error: Could not fetch distributors', type: 'error' })

				product.distributors = null
				distributorsFailed = true

			} else {

				console.log('product: fetch distributors', distributors)

				product.distributors = distributors
			}

			distributorsLoading = false
		}

		if (product.distributorLocations == null && !distributorLocationsLoading && !distributorLocationsFailed) {

			distributorLocationsLoading = true

			product.distributorLocations = []

			const { distributorLocations, error } = await api.distributorLocations()

			if (error) {

				console.error('product: fetch distributor locations error', error)
				
				messageUpdate('product-lookup', { message: 'Server Error: Could not fetch distributor locations', type: 'error' })

				product.distributorLocations = null
				distributorLocationsFailed = true

			} else {

				console.log('product: fetch distributor locations', distributorLocations)

				product.distributorLocations = distributorLocations
			}

			distributorLocationsLoading = false
		}
	})

</script>



<Section {key} {title} {sections} {tabs} bind:tabSelector={tabSelector} bind:messageUpdate={messageUpdate}>

	<svelte:fragment slot="tabs">

		<Tab name="all" tab={product.tabs} active>Show All</Tab>

		<Tab name="lookup" tab={product.tabs}>Lookup</Tab>

	</svelte:fragment>

	<All {product} productsData={productAllData} active />

	<Lookup {product} productData={productLookupData} />

</Section>