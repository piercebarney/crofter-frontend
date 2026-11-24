<script lang="ts">

	import { pickUpLocations as pL } from 'src/stores/pickUpLocations'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { sortFulfillments } from 'src/lib/helpers'
	import OrderItems from 'src/features/groups/consumer/pages/orders/partials/open-orders/items.svelte'
	


	export let order: any
	
	const statusDetails	= order.statusDetails
	const fulfillments	= sortFulfillments(order, pL, f)

</script>



<div class="order-wrapper">
	<div class="header">
		<div>
			<span class="date">Order Date: {order.date}</span>
			<span class="id">Order ID: {order.idShortHand}</span>
		</div>
		<div>
			<span class="total">Total: {order.total.string}</span>
			<div class="adjustments">
				<span class="sales-tax">Taxes: {order.tax.string}</span>

				{#if order.deliveryFee}

					<span class="delivery-fee">Delivery: {order.deliveryFee.string}</span>

				{/if}

			</div>
		</div>
	</div>
	<div class="order-item-groups">

		{#each fulfillments as fulfillment (fulfillment)}

			{#if fulfillment.orderItemIds.length > 0}

				{@const orderItems = order.orderItems.filter((item:any) => fulfillment.orderItemIds.includes(item.id))}

				<OrderItems {orderItems} {fulfillment} {statusDetails} pickUpLocations={pL}  />

			{/if}

		{/each}

		<span style="display:contents"></span>
	</div>
</div>



<style lang="sass">
	
	.order-wrapper
		border: 2px solid var(--cm-primary)
		border-radius: var(--pico-border-radius)

		.header
			background: var(--cm-primary)
			color: var(--cm-text-inverse)
			padding: 1rem
			@include flex-row-between(.5rem)

			> div:first-child
				@include flex-col(.5rem)

			> div:last-child
				@include flex-col-right(.5rem)

			.date,
			.total
				font-weight: 600

			.id,
			.adjustments
				font-size: .8rem

			.total,
			.adjustments
				text-align: right

			.adjustments
				flex-wrap: wrap
				@include flex-row(.5rem)

		.order-item-groups
			padding: .5rem
			@include flex-col(.5rem)


	@media (min-width: #{breakpoint('xs')})

		.order-wrapper
			
			.header
				gap: 1rem

			.order-item-groups
				padding: 1rem
				gap: 1rem
</style>
	