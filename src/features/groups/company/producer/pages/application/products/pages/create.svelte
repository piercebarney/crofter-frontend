<script lang="ts">

	import Create from 'src/features/groups/company/producer/pages/products/pages/create.svelte'

</script>



<div class="wrapper-product-create">

	<Create application />
		
	<span style="display:contents"></span>
</div>



<style lang="sass">

	.wrapper-product-create
		position: relative
		margin: -3rem -2rem
		min-height: 100%
		background-color: var(--cm-form-background)
		@include flex-col


	@media (min-width: #{breakpoint('sm')})

		.wrapper-product-create
			margin: -4rem -3rem

	
	@media (min-width: #{breakpoint('md')})

		.wrapper-product-create
			margin: 0 -2rem

</style>