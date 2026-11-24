<script lang="ts">

	import type { CartItem as CI } from 'src/features/groups/consumer/modules/cart/types'

	import CartItem from 'src/features/groups/consumer/modules/cart/partials/cartItem.svelte'



	export let cartItems: CI[]

</script>



<div class="inner-wrapper">
	<div class="items-wrapper">

		{#each cartItems as cartItem (cartItem)}

			<div class="item">

				<CartItem {cartItem} />

			</div>

		{/each}

	</div>
</div>



<style lang="sass">

	.inner-wrapper
		border: 1px solid var(--cm-border)
		border-radius: var(--pico-border-radius)

		.items-wrapper
			padding: 1rem
			@include flex-col(1rem)

			.item
				border-bottom: 1px solid var(--cm-border)
				padding-bottom: 1rem

				&:last-child
					border-bottom: none
					padding-bottom: 0

</style>
