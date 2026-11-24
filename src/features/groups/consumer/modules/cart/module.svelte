<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { cart } from 'src/features/groups/consumer/modules/cart/store'
	import { scrollBorderBottom } from 'src/lib/helpers'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'
	import Products from 'src/features/groups/consumer/modules/cart/partials/products.svelte'
	import Totals from 'src/features/groups/consumer/modules/cart/partials/totals.svelte'


	
	let wrapperElement: HTMLDivElement,
		labelElement:	HTMLDivElement,
		bodyElement:	HTMLDivElement,
		scrollPosition: number			= 0

	$: heightWithSearch	= $layout.header.heightWithSearch
	$: isMobile			= $layout.isMobile

	$: wrapperElement && (wrapperElement.style.top = `${heightWithSearch}px`)

	$: scrollBorderBottom(scrollPosition, labelElement)

	const updateScrollPosition = (e:UIEvent) => scrollPosition = (e.target as HTMLElement)?.scrollTop || 0

</script>


{#if $layout.overlay == 'cart'}

	<div class="cart-wrapper" bind:this={wrapperElement}>
		<div bind:this={labelElement}>
			<div class="container">
				<span>CART</span>
			
				<Button action={layout.closeMenu} wrapper>
				
					<Icon name="x" />

				</Button>
			
			</div>
		</div>
		<div class="products-totals-wrapper container" bind:this={bodyElement} on:scroll={updateScrollPosition}>
			<div class="products-wrapper">
				
				<Products />
			
			</div>

			{#if !isMobile}

				<div class="totals-wrapper">
				
					<Totals />

				</div>

			{/if}

		</div>

		{#if isMobile}
		
			<div class="checkout-button-wrapper">
				<div class="container">
					<div>
						<span>Subtotal</span>

						{#if $cart.subTotal}

							<span>{$cart.subTotal.string}</span>
					
						{:else}
		
							<span>$0.00</span>
		
						{/if}

					</div>

					<A route="checkout" button action={layout.closeMenu}>Continue to Checkout</A>

				</div>
			</div>

		{/if}

	</div>

{/if}



<style lang="sass">

	.cart-wrapper
		position: fixed
		z-index: 300
		top: 0
		right: 0
		bottom: 0
		left: 0		
		overflow: hidden
		background-color: var(--cm-utility-background)
		box-shadow: var(--cm-box-shadow)
		color: var(--cm-text)
		@include flex-col-top

		> div:first-child
			z-index: 1
			padding: 1rem 0

			> div				
				font-size: 1.5rem
				font-weight: 900
				stroke: var(--cm-text)
				@include flex-row-between

		.products-totals-wrapper			
			flex-grow: 1
			max-height: 100%
			overflow: auto
			@include flex-row(3.75rem)

			.products-wrapper
				flex: 6

			.totals-wrapper
				flex: 4

		.checkout-button-wrapper
			position: sticky
			bottom: 0
			margin: 0 -1rem
			padding: 1rem 1rem
			border-top: 1px solid var(--cm-border)

			> div
				@include flex-col(1rem)

				> div
					font-size: 1.25rem
					font-weight: 600
					@include flex-row-between

					> *
						flex-grow: 0

	@media (min-width: #{breakpoint('sm')})

		.cart-wrapper

			.checkout-button-wrapper
				margin: 0 -2rem

	@media (min-width: #{breakpoint('md')})

		.cart-wrapper

			> div:first-child
				padding: 2rem 0 1rem

	@media (min-width: #{breakpoint('lg')})

		.cart-wrapper
			left: unset

			> div:first-child
				padding: 2rem 0

			.container
				padding: 0 3rem

			.products-totals-wrapper

				.products-wrapper
					width: 30rem

				.totals-wrapper
					width: 20rem

</style>