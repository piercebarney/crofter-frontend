<script lang="ts">
	
	import { layout as l } from 'src/stores/layout'
	import { cart as c } from 'src/features/groups/consumer/modules/cart/store'
	import Img from 'src/components/elements/img.svelte'
	import Quantity from 'src/features/partials/quantity.svelte'
	import Button from 'src/components/elements/button.svelte'
	


	export let cartItem: any

	$: quantity		= cartItem.quantity
	$: sku			= cartItem.sku
	$: skuId		= sku.id
	$: skuActive	= sku.active
	$: variant		= sku.variant
	$: price		= variant.price.string
	$: product		= variant.product
	$: total		= cartItem.total.string
	$: isMobile		= $l.isMobile
	
</script>



<div class="product-wrapper">
					
	<Img src={product.image} square={isMobile ? '4rem' : '6rem'} rounded />

	<div class="details-wrapper">
		<span class="title">{product.title}</span>

		{#if !skuActive}

			<div class="unavailable">
				<span>Currently Unavailable</span>
				<span>This item will be removed from your cart before checkout.</span>

				<Button action={() => c.removeItem(skuId)} role="link" inverse>Remove</Button>

			</div>

		{:else}

			<div class="quantity-price-wrapper">
			
				<Quantity {skuId} cart />

				<div>
					
					{#if quantity > 1}

						<span class="total">{total}</span> (<span>{price}<span class="unit">/{variant.unit.toLowerCase()}</span></span>)

					{:else}
					
						<span class="total">{price}<span class="unit">/{variant.unit.toLowerCase()}</span></span>

					{/if}

				</div>
			</div>

		{/if}

	</div>
</div>



<style lang="sass">

	.product-wrapper
		@include flex-row-top(.5rem)

		.details-wrapper					
			min-height: 4rem
			@include flex-col-between(.5rem)

			> *
				flex-grow: 0

			.title
				font-size: 1.25rem

			.unavailable
				flex-grow: 1
				@include flex-col-middle-left(.5rem)

				> span
					font-size: 0.8rem
					color: var(--cm-error)

					&:first-child
						font-weight: 600

			.quantity-price-wrapper						
				flex-wrap: wrap
				// @include flex-row-middle-between(.5rem)
				@include flex-col-left(.5rem)


				> *
					flex-grow: 0

				> div
					width: unset

					.total
						font-size: 1.25rem
						font-weight: 600

					.unit
						font-size: 1rem
						font-weight: 400
						color: var(--cm-text-secondary)

	
	@media (min-width: #{breakpoint('sm')})

		.product-wrapper
			gap: 1rem
			
			.details-wrapper
				min-height: 6rem

</style>