<script lang="ts">

	import type { CartItem } from 'src/features/groups/consumer/modules/cart/types'

	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import CartItems from './cartItems.svelte'



	// options
	export let checkout: boolean = false

	let cartItems: CartItem[]		= [],
		previousItemsJson: string	= ''

	$: items	= $c.items
	$: count	= $c.count

	$: {

		const currentItemsJson = JSON.stringify(items)
		
		if (currentItemsJson !== previousItemsJson) {

			previousItemsJson	= currentItemsJson
			cartItems			= c.getItemsWithSku() || []
		}
	}

</script>



<div class="wrapper {checkout ? 'checkout' : ''}">

	{#if count > 0}

		<CartItems {cartItems} />

	{:else}

		<span class="empty">Cart Is Empty</span>

	{/if}

</div>



<style lang="sass">

	:global(.cart-product-company-image)
		margin: 1px 0
		border: none !important
		background-color: var(--cm-primary)
		overflow: hidden

	.wrapper
		@include flex-col(2.5rem)

		&:not(.checkout)
			padding-bottom: 5rem

		.empty
			margin-top: 1rem
			font-size: 1.5rem

</style>