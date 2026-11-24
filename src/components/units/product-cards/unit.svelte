<script lang="ts">

	import Card from 'src/components/units/product-cards/units/card/unit.svelte'


	
	// attributes
	export let id: string|undefined = undefined

	// data
	export let skus: any[]		= []
	export let fade: boolean	= false
	export let loader: boolean	= false
	export let count: number	= 12

</script>



<div {id} class="products-wrapper">
	<div>

		{#if loader}

			{#each Array(count) as _ (_)}
		
				<Card loader />

			{/each}

		{:else}

			{#each skus as sku (sku)}

				{#if sku.active}

					<Card {sku} {fade} />

				{/if}

			{/each}

		{/if}

	</div>
</div>



<style lang="sass">

	.products-wrapper

		div
			display: grid
			grid-template-columns: repeat(2, minmax(0, 1fr))
			grid-column-gap: 1rem
			grid-row-gap: 2rem


	@media (min-width: #{breakpoint('md')})

		.products-wrapper

			div
				grid-template-columns: repeat(3, minmax(0, 1fr))
				grid-column-gap: 2rem

	@media (min-width: #{breakpoint('lg')})

		.products-wrapper

			div
				grid-template-columns: repeat(4, minmax(0, 1fr))

</style>