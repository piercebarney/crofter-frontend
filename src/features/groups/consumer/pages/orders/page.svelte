<script lang="ts">

	import { PUBLIC_TITLE } from '$env/static/public'
	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { modal } from 'src/features/modules/modal/store'
	import { meta } from 'src/stores/meta'
	import { routes } from 'src/lists/routes'
	import OpenOrders from 'src/features/groups/consumer/pages/orders/partials/open-orders/orders.svelte'
	import ClosedOrders from 'src/features/groups/consumer/pages/orders/partials/closed-orders/orders.svelte'
	import LoaderLines from 'src/components/loaders/lines.svelte'



	export let orders: Promise<{open:Record<string,any>[], closed:Record<string,any>[]}>
	export let orderId: string|null


	const metaValues = {title : `${routes.title($page.url.pathname)} - ${PUBLIC_TITLE}`}

	if (browser && orderId) modal.open('order-details', {orderId})

</script>



<svelte:head>

	<title>{metaValues.title}</title>

	{@html meta.make(metaValues)}

</svelte:head>



<div class="orders-wrapper container">
	<div class="inner-wrapper">

		{#await orders}

			<LoaderLines />

		{:then ordersData}

			<OpenOrders orders={ordersData.open} />

			<ClosedOrders orders={ordersData.closed} />

		{/await}

		<span style="display:contents"></span>
	</div>
</div>



<style lang="sass">

	.orders-wrapper
		padding-top: 3rem
		padding-bottom: 3rem
		max-width: #{breakpoint('md')}

		.inner-wrapper
			@include flex-col(4rem)

</style>