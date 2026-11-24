<script lang="ts">

	import { apiV2 } from 'src/lib/apiV2'
	import Container from 'src/features/modules/modal/container.svelte'
	import Order from 'src/features/groups/consumer/pages/orders/partials/open-orders/order.svelte'



	export let modal: any

	const orderId = $modal.data.orderId

	let order: any,
		error: any,
		noOrder: boolean = false

	if (orderId) (async () => ({ order, error } = await apiV2.customerOrder_skusVariantProductCompany({ id:orderId })))()

	$: if (error && error.message.includes('Could not find')) noOrder = true

</script>



<Container label="Order Details" {modal}>

	{#if order}

		<Order {order} />

	{:else if noOrder}
	
		<div class="empty">
			<span class="empty">Order was not found.</span>
			<span>Order ID: {order.idShortHand}</span>
		</div>

	{:else if error}

		<div class="error">
			<span class="error">An error occurred while loading the order.</span>
			<span>Order ID: {orderId}</span>
		</div>

	{:else}

		<div class="loading">
			<span>Loading order...</span>
		</div>

	{/if}

</Container>



<style lang="sass">

	.empty,
	.error
		margin-top: 2rem

		> span
			display: block
			text-align: center

		> span:first-child
			margin-bottom: .5rem
			font-size: 1.5rem

	.loading
		margin-top: 2rem
		text-align: center

</style>