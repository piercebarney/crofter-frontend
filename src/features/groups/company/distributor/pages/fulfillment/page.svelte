<script lang="ts">

	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import { modal } from 'src/features/modules/modal/store'
	import { company as c } from 'src/stores/company/store'
	import { account } from 'src/features/pages/account/store'
	import { search as s } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import { pickUpLocations } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { statuses as st } from 'src/lists/statuses'
	import PageHeader from 'src/features/groups/company/partials/page-header.svelte'
	import Filter from 'src/features/groups/company/partials/filter.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Orders from 'src/features/groups/company/distributor/pages/fulfillment/partials/orders.svelte'



	export let orderId: string|null

	// if (browser && orderId) modal.open('distributor-order-details', {orderId})

	let initialized: boolean			= false,
		company: any					= null,
		timer: any						= null,
		currentTerm: string|null		= null,
		sortLocationId: string|null		= 'all',
		filterFulfillmentMethod: string	= 'all',
		filterOrderStatus: string		= 'all',
		ordersOpen: any[]|null			= null,
		ordersClosed: any[]|null		= null

	$: ordersOpenFetched			= $company?.orders.open ?? null
	$: ordersClosedFetched			= $company?.orders.closed ?? null
	$: ordersByOrderSearchOpen		= $company?.ordersByOrderSearch?.open ?? null
	$: ordersByOrderSearchClosed	= $company?.ordersByOrderSearch?.closed ?? null
	$: searchTerm					= $s.term
	$: searchInput					= $s.input
	$: searchSearching				= $s.searching
	$: searchActive					= $s.active

	const fetch = () => company.ordersFetch()

	const resetFilters = () => {

		filterFulfillmentMethod	= 'all'
		filterOrderStatus		= 'all'
	}

	const filterByLocation = (e: Event) => {

		const target = e.target as HTMLSelectElement

		sortLocationId = target.value

		resetFilters()

		layout.scroll(0, 'smooth')
	}

	$: browser && !company && $c && (() => {

		company = c.get($account.active.id)

		if (company) {

			if (orderId) modal.open('distributor-order-details', {orderId, company, fetch})

			fetch()

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
		
			ordersOpen		= ordersOpenFetched
			ordersClosed	= ordersClosedFetched

		}
	})()

	$: initialized && (ordersByOrderSearchOpen || ordersByOrderSearchClosed) && (() => {

		ordersOpen		= ordersByOrderSearchOpen
		ordersClosed	= ordersByOrderSearchClosed

	})()

	onMount(() => timer = setInterval(() => {fetch()}, 5 * 60 * 1000)) // every 5 minutes

	onDestroy(() => clearInterval(timer))

</script>



<PageHeader>

	<div slot="left">
		<select id="filter-by-location" on:change={filterByLocation}>
			<option value="all" selected>All</option>

			{#each $pickUpLocations as location (location)}

				<option value={location.id}>{location.title}</option>

			{/each}

		</select>
	</div>
	<div slot="right">
		<div class="filter">

			<Filter bind:filterFulfillmentMethod={filterFulfillmentMethod} bind:filterOrderStatus={filterOrderStatus} />

			{#if filterFulfillmentMethod != 'all'}
			
				<Button action={() => filterFulfillmentMethod = 'all'} outline text inverse pill mini>{f.titleById(filterFulfillmentMethod)} <Icon name="x" size=".5rem" /></Button>
				
			{/if}

			{#if filterOrderStatus != 'all'}
			
				<Button action={() => filterOrderStatus = 'all'} outline text inverse pill mini>{st.titleById(filterOrderStatus)} <Icon name="x" size=".5rem" /></Button>
				
			{/if}

			<span style="display:contents"></span>
		</div>
	</div>

</PageHeader>

<div class="orders-wrapper container">

	<Orders {ordersOpen} {ordersClosed} {filterFulfillmentMethod} {filterOrderStatus} {sortLocationId} {company} {fetch} />

</div>



<style lang="sass">

	#filter-by-location
		border-color: var(--cm-border)

		&:hover
			cursor: pointer

	div[slot="right"]
		flex-wrap: wrap
		width: 100%
		@include flex-row-middle-right(1rem)

		.filter
			position: relative
			@include flex-row-middle(.25rem)

	.orders-wrapper
		padding-top: 2.5rem
		padding-bottom: 2.5rem


	@media (min-width: #{breakpoint('md')})

		div[slot="right"]
			gap: 3rem

</style>