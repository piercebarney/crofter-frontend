<script lang="ts">

	import Label from 'src/components/elements/label.svelte'
	import Order from 'src/features/groups/consumer/pages/orders/partials/open-orders/order.svelte'

	
	
	export let orders: any[]

</script>



{#if orders.length > 0}

	<div class="orders-wrapper">
							
		<Label>Current Orders</Label>

		<div class="orders">

			{#each orders as order (order)}

				<Order {order} />

			{/each}

			<span style="display:contents"></span>
		</div>
	</div>

{/if}



<style lang="sass">

	.orders-wrapper

		.orders
			@include flex-col(2rem)

</style>