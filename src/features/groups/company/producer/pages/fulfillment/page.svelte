<script lang="ts">

	import type { OrderByOrder_Company, OrderByProduct_Company } from 'src/types/order'

	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { modal } from 'src/features/modules/modal/store'
	import { company as c } from 'src/stores/company/store'
	import { account } from 'src/features/pages/account/store'
	import { search as s } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import { capitalize } from 'src/lib/helpers'
	import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import Filter from 'src/features/groups/company/partials/filter.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import OrdersByOrder from 'src/features/groups/company/partials/by-order.svelte'
	import OrdersByProduct from 'src/features/groups/company/partials/by-product.svelte'



	export let orderId: string|null

	if (browser && orderId) modal.open('company-order-details', {orderId})

	let initialized: boolean						= false,
		company: any								= null,
		timer: any									= null,
		currentTerm: string|null					= null,
		sortType: string							= 'order',
		filterFulfillmentMethod: string				= 'all',
		filterOrderStatus: string					= 'all',
		ordersOpen: OrderByOrder_Company[]|null		= null,
		ordersClosed: {
			recent: OrderByOrder_Company[]|null,
			all: OrderByOrder_Company[]|null,
			total: number
		}|null										= null,
		products: OrderByProduct_Company[]|null		= null

	$: orderByOrderOpen				= $company?.ordersByOrder?.open || null
	$: orderByOrderClosed			= $company?.ordersByOrder?.closed || null
	$: ordersByOrderSearchOpen		= $company?.ordersByOrderSearch?.open || null
	$: ordersByOrderSearchClosed	= $company?.ordersByOrderSearch?.closed || null
	$: orderByProduct				= $company?.ordersByProduct || null
	$: ordersByProductSearch		= $company?.ordersByProductSearch || null
	$: searchTerm					= $s.term
	$: searchInput					= $s.input
	$: searchSearching				= $s.searching
	$: searchActive					= $s.active

	const fetch = () => sortType == 'order' ? company.ordersByOrderFetch() : company.ordersByProductFetch()

	const resetFilters = () => {

		filterFulfillmentMethod	= 'all'
		filterOrderStatus		= 'all'
	}

	const sortOrders = (type:string) => {

		sortType = type

		fetch()

		resetFilters()

		s.setSortType(type)

		layout.scroll(0, 'smooth')
	}

	$: browser && !company && $c && (() => {

		company = c.get($account.active.id)

		if (company) {

			fetch()

			s.setSortType(sortType)
			s.setFunction({
				byOrder		: company.ordersByOrderSearchFetch,
				byProduct	: company.ordersByProductSearchFetch
			})

			initialized = true
		}
	})()

	$: initialized && (() => {

		if (currentTerm && searchTerm != currentTerm && searchInput == false && searchSearching == false && searchActive == true) {

			company.set({ordersByOrderSearch:null, ordersByProductSearch:null})

			resetFilters()

			currentTerm = searchTerm

		} else if (!searchTerm) {

			company.set({ordersByOrderSearch:null, ordersByProductSearch:null})
		
			if	(sortType == 'order') {

				ordersOpen		= orderByOrderOpen
				ordersClosed	= orderByOrderClosed
			
			} else products = orderByProduct
		}
	})()

	$: initialized && (ordersByOrderSearchOpen || ordersByOrderSearchClosed || ordersByProductSearch) && (() => {

		if	(sortType == 'order') {

			ordersOpen		= ordersByOrderSearchOpen
			ordersClosed	= ordersByOrderSearchClosed
		
		} else products = ordersByProductSearch
	})()

	onMount(() => timer = setInterval(() => {fetch()}, 5 * 60 * 1000)) // every 5 minutes

	onDestroy(() => clearInterval(timer))

</script>



<PageHeader>

	<div slot="right">

		{#if sortType == 'order'}

			<div class="filter">

				<Filter bind:filterFulfillmentMethod={filterFulfillmentMethod} bind:filterOrderStatus={filterOrderStatus} />

				{#if filterFulfillmentMethod != 'all'}
				
					<Button action={() => filterFulfillmentMethod = 'all'} outline text inverse pill mini>{capitalize(filterFulfillmentMethod)} <Icon name="x" size=".5rem" /></Button>
					
				{/if}

				{#if filterOrderStatus != 'all'}
				
					<Button action={() => filterOrderStatus = 'all'} outline text inverse pill mini>{capitalize(filterOrderStatus)} <Icon name="x" size=".5rem" /></Button>
					
				{/if}

				<span style="display:contents"></span>
			</div>

		{/if}

		<div class="sort">
			<span>View By:</span>
			<div>
			
				<Button action={() => sortOrders('order')} selected={sortType == 'order'} outline text inverse pill mini>Order</Button>

			</div>
			<div>

				<Button action={() => sortOrders('product')} selected={sortType == 'product'} outline text inverse pill mini>Product</Button>

			</div>
		</div>
	</div>

</PageHeader>

<div class="orders-wrapper container">

	{#if sortType == 'order'}

		<OrdersByOrder {ordersOpen} {ordersClosed} {filterFulfillmentMethod} {filterOrderStatus} {company} {fetch} />

	{:else}

		<OrdersByProduct {products} {company} />

	{/if}

</div>



<style lang="sass">

	div[slot="right"]
		flex-wrap: wrap
		width: 100%
		@include flex-row-middle-right(1rem)

		.filter
			position: relative
			@include flex-row-middle(.25rem)

		.sort
			@include flex-row-middle(.25rem)

			span
				margin-right: .25rem
				width: fit-content

	.orders-wrapper
		padding-top: 2.5rem
		padding-bottom: 2.5rem


	@media (min-width: #{breakpoint('md')})

		div[slot="right"]
			gap: 3rem

</style>