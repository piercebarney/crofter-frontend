<script lang="ts">

	import { skus as s } from 'src/stores/skus'
	import { categories } from 'src/lists/categories'
	import { capitalize } from 'src/lib/helpers'
	import ProductCards from 'src/components/units/product-cards/unit.svelte'

	

	let listByCategory: {category:string, skus:any[]}[] = []
	
	$: $s && (listByCategory = s.listByCategory('displayOrder'))

</script>



<div class="products-wrapper">
		
	{#if !$s || ($s && $s.length > 0)}

		<div class="container">

			{#if !$s}
			
				<ProductCards loader />

			{:else}

				{#each listByCategory as {category, skus} (category)}

					{#if skus.length > 0}

						<div>

							{#if category != 'other' || listByCategory.length > 1}

								{@const title = categories.titleById(category) ?? capitalize(category)}

								<span class="title">{title}</span>

							{/if}

							<ProductCards {skus} fade />

						</div>

					{/if}

				{/each}

			{/if}

		</div>

	{/if}

</div>



<style lang="sass">

	.products-wrapper

		> div
			@include flex-col(5rem)

		.title
			display: inline-block
			margin-bottom: 1rem
			font-size: 1.6rem
			font-weight: 600

</style>