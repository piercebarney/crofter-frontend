<script lang="ts">
	
	import { layout } from 'src/stores/layout'
	import { statuses as oIS } from 'src/lists/statuses'
	import { skus as s } from 'src/stores/skus'
	import Img from 'src/components/elements/img.svelte'
	


	export let orderItem: any

	$: sku			= $s && s.getById(orderItem?.skuId)
	$: variant		= sku?.variant ?? null
	$: product		= variant?.product ?? null
	$: company		= product?.company ?? null
	$: price		= orderItem.price.string
	$: quantity		= orderItem.quantity
	$: subTotal		= orderItem.subTotal.string
	$: isMin		= $layout.size == 'min'
	
</script>



<div class="product-wrapper">
	
	{#if sku}
	
		<Img src={product.image} square={isMin ? '4rem' : '6rem'} rounded />

		<div class="details-wrapper">
			<div class="title-company-wrapper">
				<span class="title">{product.title}</span>
				<span class="company">{company.name}</span>
			</div>
			<div class="quantity-price-wrapper">
				<span>

					{#if oIS.is('canceled', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{:else if oIS.is('declined', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{:else if oIS.is('refunded', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{/if}

				</span>
				<div>
						
					{#if quantity > 1}

						<span>{quantity} x</span>
						<span>{price}</span><span class="unit">/{variant.unit.toLowerCase()}</span>
						<span>=</span>
						<span class="numbers">{subTotal}</span>

					{:else}
					
						<span>1 x</span>
						<span class="numbers">{price}</span><span class="unit">/{variant.unit.toLowerCase()}</span>

					{/if}

				</div>
			</div>
		</div>

	{:else}

		<div class="details-wrapper">
			<div class="title-company-wrapper">
				<span class="title">Product No Longer Available</span>
			</div>
			<div class="quantity-price-wrapper">
				<span>

					{#if oIS.is('canceled', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{:else if oIS.is('declined', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{:else if oIS.is('refunded', orderItem.status)}

						{oIS.titleById(orderItem.status)}

					{/if}

				</span>
				<div>
						
					{#if quantity > 1}

						<span>{quantity} x</span>
						<span>{price}</span><span class="unit"></span>
						<span>=</span>
						<span class="numbers">{subTotal}</span>

					{:else}
					
						<span>1 x</span>
						<span class="numbers">{price}</span><span class="unit"></span>

					{/if}

				</div>
			</div>
		</div>

	{/if}

</div>



<style lang="sass">

	.product-wrapper
		@include flex-row-top(.5rem)

		.details-wrapper					
			min-height: 4rem
			@include flex-col-between(.5rem)

			> *
				flex-grow: 0

			.title-company-wrapper
				
				> span
					display: block

				.title
					font-size: 1.2rem

				.company
					line-height: 1.2rem
					font-size: .8rem
					color: var(--cm-text-secondary)

			.quantity-price-wrapper
				@include flex-row-between(.5rem)

				> span
					font-size: 1.2rem
					font-weight: 600

				> div

					> span
						display: inline

					.numbers
						font-weight: 600

					.unit
						color: var(--cm-text-secondary)


	@media (min-width: #{breakpoint('xs')})

		.product-wrapper
			gap: 1rem
			
			.details-wrapper
				min-height: 6rem

</style>