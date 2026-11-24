<script lang="ts">

	// import type { Product } from 'src/types/product'
	// import type { CartItem } from 'src/features/groups/consumer/modules/cart/types'

	import { onMount } from 'svelte'
	// import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	// data
	// export let product: Product
	export let fulfillment: string|null	= null

	const forDelivery	= false
	const forPickUp		= false
	const cartItemId	= null

	let deliveryElement: HTMLButtonElement,
		pickupElement: HTMLButtonElement,
		// cartItemId: string|null				= null,
		updating: boolean					= false
		// forPickUp: boolean					= false
		// forDelivery: boolean				= false

	// const getCartItemId = () => {

	// 	const cartItem = c.getItemByProductId(product.id)

	// 	cartItemId	= cartItem ? cartItem.id : null
	// }

	const updateCartItem = () => {

		if (!updating) {

			// if (!cartItemId) getCartItemId()

			if (cartItemId) {

				updating = true
				
				// c.update(cartItemId, {fulfillment})
				// 	.then(() => updating = false)
			}
		}
	}

	const select = (name:string, update:boolean = true) => {

		if (deliveryElement && pickupElement) {

			const deliveryClasses	= deliveryElement.classList
			const pickupClasses		= pickupElement.classList

			if (name == 'delivery' && !deliveryClasses.contains('selected')) {

				pickupClasses.remove('selected')
				deliveryClasses.add('selected')

				fulfillment = f.id('delivery')

				if (update) updateCartItem()
			
			} else if (name == 'pickup' && !pickupClasses.contains('selected')) {

				deliveryClasses.remove('selected')
				pickupClasses.add('selected')

				fulfillment = f.id('pickup')

				if (update) updateCartItem()
			}
		}
	}

	// $: if ($c && deliveryElement && pickupElement) {

	// 	let cartItem: CartItem|null

	// 	if (cartItemId) {
			
	// 		cartItem = c.getItemById(cartItemId)
			
	// 		if (!cartItem) cartItemId = null
		
	// 	} else {

	// 		cartItem	= c.getItemByProductId(product.id)
	// 		cartItemId	= cartItem ? cartItem.id : null
	// 	}

	// 	if (cartItem) select(f.name(cartItem.fulfillment), false)
	// }

	onMount(() => {

		if	(forDelivery)	fulfillment = f.id('delivery')
		else				fulfillment = f.id('pickup')
	})

</script>



<div class="fulfillment-wrapper">

	<Button action={() => select('delivery')} c={`product-page-fulfillment-button-wrapper ${forDelivery ? 'selected' : undefined}`} bind:element={deliveryElement} disabled={!forDelivery} wrapper>
				
		<Icon name="car" size="2.5rem" />

		<div>

			<span class="label">Delivery</span>

			{#if !forDelivery}

				<span class="not-available">Not Available</span>

			{/if}

		</div>

	</Button>

	<Button action={() => select('pickup')} c={`product-page-fulfillment-button-wrapper ${forPickUp ? 'selected' : undefined}`} bind:element={pickupElement} disabled={!forPickUp} wrapper>

		<Icon name="box" size="2.5rem" />

		<div>

			<span class="label">Pickup</span>

			{#if !forPickUp}

				<span class="not-available">Not Available</span>

			{/if}
		
		</div>

	</Button>

</div>



<style lang="sass">

	:global(.product-page-fulfillment-button-wrapper)
		--f-background-color: rgba(245, 247, 242)
		--f-border-color: transparent		
		width: fit-content
		padding: 1rem
		border-radius: var(--pico-border-radius)
		border: 1px solid var(--f-border-color)
		background-color: var(--f-background-color)
		transition: border-color var(--pico-transition), background-color var(--pico-transition)
		stroke: var(--cm-text)
		@include flex-row-middle(1rem)

		&:disabled
			background-color: transparent

		> div			
			width: fit-content
			@include flex-col-left(.25rem)

			span
				display: inline-block
				width: 62px

			.not-available
				width: fit-content
				font-size: .75rem

		&:not(.selected):hover
			--f-background-color: rgba(240, 242, 239)
			--f-border-color: var(--cm-button-hover)

	:global(.product-page-fulfillment-button-wrapper.selected)
		--f-border-color: var(--cm-button-active)
		cursor: default

	:global(.product-page-fulfillment-button-wrapper.selected > div .label)
		font-weight: 600

	.fulfillment-wrapper
		@include flex-col(.75rem)

	@media (min-width: calc((#{breakpoint('sm')} / 2) + 1rem))

		.fulfillment-wrapper
			@include flex-row(.75rem)

	@media (min-width: #{breakpoint('md')})

		:global(.product-page-fulfillment-button-wrapper)
			gap: (1.5rem)
			padding: 2rem

			> div

				span
					width: 76px

			.label
				font-size: 1.25rem

</style>