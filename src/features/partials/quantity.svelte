<script lang="ts">

	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import { classes } from 'src/lib/helpers'
	import { gA4 } from 'src/lib/gA4'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	// options
	export let cart: boolean	= false
	export let thin: boolean	= false

	// data
	export let skuId: string|null = null

	// Reactive quantity from cart - automatically updates
	$: cartItems	= $c.items
	$: quantity		= skuId && cartItems ? (c.getItemQuantity(skuId) || 0) : 0
	$: type			= cart ? 'cart' : 'card'
	$: _group		= classes('group', type, {thin})
	$: _subtract	= classes('cart-item-quantity-button subtract', type, {thin})
	$: _add			= classes('cart-item-quantity-button add', type, {thin})
	$: _remove		= classes('cart-item-quantity-button remove', 'cart', {thin})

	const gA4_AddToCart = (skuId:string, qty:number = 1) => gA4.cart({event:'add_to_cart', skuId, qty})

	const gA4_RemoveFromCart = (skuId:string, qty:number = 1) => gA4.cart({event:'remove_from_cart', skuId, qty})

	const add = () => {

		if (!skuId) return
		
		gA4_AddToCart(skuId)

		c.addItem(skuId)
	}

	const addQuantity = () => {
		
		if (!skuId) return
		
		gA4_AddToCart(skuId)

		c.updateItemQuantity(skuId, quantity + 1)
	}

	const subtractQuantity = () => {

		if (!skuId) return

		gA4_RemoveFromCart(skuId)

		c.updateItemQuantity(skuId, quantity - 1)
	}

	const remove = () => {

		if (!skuId) return

		gA4_RemoveFromCart(skuId, quantity)

		c.removeItem(skuId)
	}

	const preventDecimal = (e: KeyboardEvent) => {

		// Allow: backspace, delete, tab, escape, enter
		if ([8, 9, 27, 13, 46].includes(e.keyCode)) return

		// Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
		if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) return

		// Allow: home, end, left, right, up, down
		if (e.keyCode >= 35 && e.keyCode <= 40) return

		// Block: decimal point, period, comma, e, E, +, -
		if ([110, 190, 188, 69, 107, 109, 189].includes(e.keyCode)) {

			e.preventDefault()

			return
		}

		// Block: anything that's not a number (0-9)
		if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) e.preventDefault()
	}

	const validate = (e: Event) => {

		if (!skuId) return

		const value = (e.currentTarget as HTMLInputElement | null)?.value
		
		const newQuantity = Math.round(parseInt(value || '0')) || 0

		if (newQuantity === quantity) return

		if (newQuantity <= 0) {

			gA4_RemoveFromCart(skuId, quantity)

			c.removeItem(skuId)

		} else {

			const qty = newQuantity - quantity

			if 	(qty > 0)	gA4_AddToCart(skuId, qty)
			else			gA4_RemoveFromCart(skuId, Math.abs(qty))

			c.updateItemQuantity(skuId, newQuantity)
		}
	}

</script>



<div class="quantity-wrapper" on:click|stopPropagation on:keydown|stopPropagation role="none">

	{#if quantity > 0}

		{#if cart}

			<div>

				<Button action={remove} c={_remove}><Icon name="trash" /></Button>

			</div>

		{/if}

		<div class={_group}>

			<Button action={subtractQuantity} c={_subtract}><Icon name="minus" /></Button>

			<input type="number" step="1" class={type} value={quantity} on:change={validate} on:keydown={preventDecimal} on:keypress|stopPropagation />

			<Button action={addQuantity} c={_add}><Icon name="plus" /></Button>
		
		</div>

	{:else if !cart}

		<Button action={add} {thin}>Add</Button>

	{/if}

</div>



<style lang="sass">

	:global(.cart-item-quantity-button)
		height: 100% !important
		min-height: 100% !important
		padding: 1rem !important

	:global(.cart-item-quantity-button.thin)
		padding: .5rem !important
		

	:global(.cart-item-quantity-button.subtract)
		border-radius: var(--pico-border-radius) 0 0 var(--pico-border-radius) !important

	:global(.cart-item-quantity-button.add)
		border-radius: 0 var(--pico-border-radius) var(--pico-border-radius) 0 !important

	:global(.cart-item-quantity-button.cart)
		padding: .5rem !important
		border-color: var(--cm-border) !important
		background-color: var(--cm-primary-inverse) !important
		color: var(--cm-text) !important
		stroke: var(--cm-text) !important

	:global(.cart-item-quantity-button.cart.subtract)
		border-right: none !important

	:global(.cart-item-quantity-button.cart.add)
		border-left: none !important

	:global(.cart-item-quantity-button.cart:hover)
		background-color: var(--cm-highlight) !important

	.quantity-wrapper
		margin: calc(-.5rem - 1px)
		border-radius: var(--pico-border-radius)
		cursor: default
		padding: calc(.5rem + 1px)
		@include flex-row-middle-left(.5rem)

		.group
			border-radius: var(--pico-border-radius)
			overflow: hidden
			@include flex-row-middle-left

			input::-webkit-outer-spin-button,
			input::-webkit-inner-spin-button
				-webkit-appearance: none
				margin: 0

			input
				height: 100%
				width: 40px
				padding: 0
				border: none
				border-radius: 0
				background-color: transparent
				text-align: center
				font-weight: 600
				
				&.card
					color: var(--cm-primary-inverse)
					font-size: 1.25rem

				&.cart
					border: 1px solid
					border-left: none
					border-right: none
					border-color: var(--cm-border)
					color: var(--cm-text)

					&:focus
						box-shadow: none

			&.card
				height: 3.125rem
				background-color: var(--cm-primary)

				&.thin
					height: 2.375rem

			&.cart
				height: 2.375rem
				background-color: var(--cm-primary-inverse)

</style>