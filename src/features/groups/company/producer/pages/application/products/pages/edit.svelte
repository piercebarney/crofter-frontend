<script lang="ts">

	import type { Product } from 'src/types/product'

	import Edit from 'src/features/groups/company/producer/pages/products/pages/edit.svelte'



	export let product: Product

</script>



<div class="wrapper-product-edit">

	<Edit {product} application />

	<div style="display:none"></div>
</div>



<style lang="sass">

	.wrapper-product-edit
		position: relative
		margin: -3rem -2rem
		min-height: 100%
		background-color: var(--cm-form-background)
		@include flex-col


	@media (min-width: #{breakpoint('sm')})

		.wrapper-product-edit
			margin: -4rem -3rem

	
	@media (min-width: #{breakpoint('md')})

		.wrapper-product-edit
			margin: 0 -2rem

</style>