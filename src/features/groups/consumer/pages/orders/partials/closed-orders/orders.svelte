<script lang="ts">

	import Label from 'src/components/elements/label.svelte'
	import Order from 'src/features/groups/consumer/pages/orders/partials/closed-orders/order.svelte'



	export let orders: any[]

	orders.sort((a:any, b:any) => Date.parse(b.date) - Date.parse(a.date))

</script>



<div class="orders-wrapper">

	<Label>Order History</Label>

	{#if orders?.length > 0}
	
		<div class="list">

			{#each orders as order (order)}

				<Order {order} />

			{/each}

		</div>

	{:else}

		<span class="empty">No Orders Found</span>

	{/if}
	
</div>



<style lang="sass">

	.orders-wrapper

		.empty
			display: block

</style>
