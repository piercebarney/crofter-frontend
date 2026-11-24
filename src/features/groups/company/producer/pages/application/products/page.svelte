<script lang="ts">

	import Products from 'src/features/groups/company/producer/pages/products/page.svelte'

</script>



<div class="wrapper-products">

	<Products application />

</div>



<style lang="sass">

	.wrapper-products
		margin: -3rem -1.5rem

	
	@media (min-width: #{breakpoint('sm')})

		.wrapper-products
			margin: -4rem -3rem

	
	@media (min-width: #{breakpoint('md')})

		.wrapper-products
			margin: -1rem -2rem 0

</style>