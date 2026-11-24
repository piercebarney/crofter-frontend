<script lang="ts">

	import type { ProductData, ProductFetch } from 'src/features/groups/admin/pages/portal/types'

	import Cards from 'src/features/groups/admin/pages/portal/wrappers/cards.svelte'
	import ProductCard from 'src/features/groups/admin/pages/portal/units/product/partials/product-card.svelte'



	export let productsData:	ProductData[]
	export let productFetch:	ProductFetch

</script>

<Cards>

	{#each productsData as productData (productData)}

		<ProductCard {productData} {productFetch} />

	{/each}

</Cards>