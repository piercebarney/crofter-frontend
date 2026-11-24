<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { search } from 'src/features/groups/search/store'
	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { statuses as s } from 'src/lists/statuses'
	import { sortFulfillments } from 'src/lib/helpers'
	import { apiV2 } from 'src/lib/apiV2'
	import MobileOpen from 'src/features/groups/company/distributor/pages/fulfillment/partials/open/mobile.svelte'
	import TabletOpen from 'src/features/groups/company/distributor/pages/fulfillment/partials/open/tablet.svelte'
	import DesktopOpen from 'src/features/groups/company/distributor/pages/fulfillment/partials/open/desktop.svelte'
	import MobileClosed from 'src/features/groups/company/distributor/pages/fulfillment/partials/closed/mobile.svelte'
	import TabletClosed from 'src/features/groups/company/distributor/pages/fulfillment/partials/closed/tablet.svelte'
	import DesktopClosed from 'src/features/groups/company/distributor/pages/fulfillment/partials/closed/desktop.svelte'



	export let ordersOpen: any[]|null
	export let ordersClosed: any[]|null
	export let filterFulfillmentMethod: string
	export let filterOrderStatus: string
	export let sortLocationId: string|null		= null
	export let company: any
	export let fetch: any

	let open: any[]			= []
	let hasOpen: boolean	= false

	const readyAllAlert = {
		type	: 'warning',
		title	: 'Ready All Items',
		message	: 'Are you sure want to mark all items as ready? This will charge and notify the customer.',
	}

	const sort = (orders:any[]|null) => {

		if (!orders) return null

		const sortedOrders: any[] = []

		for (const order of orders) {

			const fulfillments = sortFulfillments(order, pL, f)

			sortedOrders.push({...order, fulfillments})
		}

		return sortedOrders
	}

	const filter = () => {

		if (open.length > 0) {

			hasOpen = false
		
			open.forEach((order, orderIndex) => {

			let showOrder = false

			// Initialize statusDetails for this order
			open[orderIndex].statusDetails = {
				fulfilled		: true,
				itemCount		: 0,
				canceledCount	: 0,
				declinedCount	: 0,
				fulfilledCount	: 0,
				orderedCount	: 0,
				readyCount		: 0,
				refundedCount	: 0
			}

			order.orderItems.forEach((orderItem: any, orderItemIndex: number) => {

				let sameFulfillmentMethod	= false,
					sameOrderStatus			= false,
					sameLocation			= false

				if (filterFulfillmentMethod == 'all' || orderItem.fulfillment == filterFulfillmentMethod) sameFulfillmentMethod = true

				if (filterOrderStatus == 'all' || orderItem.status == filterOrderStatus) sameOrderStatus = true

				if (sortLocationId == 'all' || orderItem.pickUpLocationId == sortLocationId) sameLocation = true

				if (sameFulfillmentMethod && sameOrderStatus && sameLocation) {

					open[orderIndex].orderItems[orderItemIndex].show = true
					showOrder		= true
					hasOpen			= true

				} else open[orderIndex].orderItems[orderItemIndex].show = false

				if		(s.is('canceled', orderItem.status))	open[orderIndex].statusDetails.canceledCount++
				else if	(s.is('declined', orderItem.status))	open[orderIndex].statusDetails.declinedCount++
				else if	(s.is('fulfilled', orderItem.status))	open[orderIndex].statusDetails.fulfilledCount++
				else if	(s.is('ordered', orderItem.status))		open[orderIndex].statusDetails.orderedCount++
				else if	(s.is('ready', orderItem.status))		open[orderIndex].statusDetails.readyCount++
				else if	(s.is('refunded', orderItem.status))	open[orderIndex].statusDetails.refundedCount++

				if (!s.is('fulfilled', orderItem.status)) open[orderIndex].statusDetails.fulfilled = false

				if (orderItem.promotionId) apiV2.promotion({ id:orderItem.promotionId }).then(({promotion}: any) => open[orderIndex].orderItems[orderItemIndex].promoCode = promotion?.code || null)
			})

			open[orderIndex].show = showOrder
		})
		
		} else hasOpen = false
	}

	// let showAll: boolean = false

	$: isMobile			= $layout.isMobile
	$: isTablet			= $layout.isTablet
	$: closed			= ordersClosed || []
	$: hasClosed		= closed.length > 0
	$: searchActive		= $search.active
	$: searchSearching	= $search.searching

	$: if (ordersOpen || filterFulfillmentMethod || filterOrderStatus || sortLocationId !== undefined) {

		open = sort(ordersOpen) || []
		
		filter()
	}

	// $: searchActive && (showAll = false)

</script>



<div class="orders-wrapper">

	{#if (hasOpen || hasClosed) && searchSearching == false}

		<div class="label-open">
			<span>Open Orders</span>
		</div>

		{#if hasOpen}

			<table class={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}>
				<tbody>

					{#if isMobile}

						<MobileOpen {open} {company} {fetch} {readyAllAlert}/>

					{:else if isTablet}

						<TabletOpen {open} {company} {fetch} {readyAllAlert}/>

					{:else}

						<DesktopOpen {open} {company} {fetch} {readyAllAlert}/>

					{/if}

				</tbody>
			</table>

		{:else}

			<span class="empty">No Open Orders</span>

		{/if}

		<div class="label-closed">
			<span>Fulfilled Orders</span>
			<div>
				<span>(25 most recent)</span>
			</div>
		</div>

		{#if hasClosed}

			{#if closed.length > 0}

				<table class={isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}>
					<tbody>

						{#if isMobile}

							<MobileClosed {closed} {company} {fetch}/>

						{:else if isTablet}

							<TabletClosed {closed} {company} {fetch}/>

						{:else}

							<DesktopClosed {closed} {company} {fetch}/>

						{/if}

					</tbody>
				</table>

			{/if}

		{:else}

			<span class="empty">No Fulfilled Orders</span>

		{/if}

	{:else if (!hasOpen && !hasClosed) && searchActive == true}

		{#if searchActive}

			<div class="empty">Your search returned no restuls.</div>

		{:else}

			<div class="empty">You have not yet received any orders.</div>

		{/if}

	{:else}

		<div class="empty">Loading...</div>

	{/if}

</div>



<style lang="sass">

	.orders-wrapper
		@include flex-col(1rem)

		.label-open,
		.label-closed
			padding-bottom: 2rem
			font-size: 2rem
			font-weight: 600
			@include flex-col(.5rem)

		.label-closed
			padding-top: 4rem

			> div

				span
					font-size: 1.25rem
					color: var(--cm-text-secondary-dark)

		.empty
			padding-top: 2rem
			font-size: 1.5rem
			text-align: center

		table

			&.mobile
				table-layout: fixed

</style>