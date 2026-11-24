<script lang="ts">

	// data
	export let price: {string:string, number:number}
	export let unit: string

	$: decimol	= price.number % 1
	$: cents	= decimol.toFixed(2).replace('0.', '')
	$: dollars	= (price.number - decimol).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')

</script>



<div class="price-unit-wrapper">
	<div class="price-wrapper">
		<span>$</span>
		<span class="dollars">{dollars}</span>
		<span>{cents}</span>
	</div>
	<div class="unit-wrapper">
		<span>/{unit}</span>
	</div>
</div>



<style lang="sass">

	.price-unit-wrapper
		font-size: 1rem
		flex-wrap: wrap
		@include flex-row-top-left

		.price-wrapper
			font-weight: 700
			// line-height: 1
			@include flex-row-top-left

			.dollars
				margin-top: -2px
				font-size: 1.4em

		.unit-wrapper	
			color: var(--cm-text-secondary)
			// line-height: 1
			@include flex-row-bottom-left


	@media (min-width: #{breakpoint('md')})

		.price-unit-wrapper
			@include flex-col-middle-left

	@media (min-width: #{breakpoint('lg')})

		.price-unit-wrapper
			@include flex-row-top-left


	@media (min-width: #{breakpoint('xl')})

		.price-unit-wrapper
			@include flex-col-middle-left

</style>