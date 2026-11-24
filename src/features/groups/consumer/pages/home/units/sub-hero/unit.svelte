<script lang="ts">
	
	import { systemSettings as sS } from 'src/stores/systemSettings'

</script>



{#if sS.val('component.subHero')}

	<!-- <div class="container">
		<div class="heading">
			<span>Now Offering Delivery</span>
			<span>Servicing Salt Lake and Utah Counties</span>
		</div>
		<div class="subheading">Order now and enjoy <span>FREE</span> delivery to your doorstep for a limited time only!</div>
	</div> -->

	<div class="container">
		<div class="heading">
			<span>FREE DELIVERY</span>
			<span>to Salt Lake and Utah Counties!</span>
		</div>
	</div>

{/if}



<style lang="sass">

	// .container
	// 	font-size: 1rem
	// 	line-height: 1.2
	// 	@include flex-col-middle(.5rem)

	// 	.heading
	// 		color: var(--cm-primary)
	// 		font-size: 2em
	// 		font-weight: 600
	// 		@include flex-col-middle

	// 		> span:last-child
	// 			color: var(--cm-primary-light)
	// 			font-size: .6em

	// 	.subheading
	// 		font-size: 1em
	// 		line-height: 1.4

	// 		span
	// 			color: var(--cm-primary)
	// 			font-style: italic
	// 			font-weight: 600

	
	// @media (min-width: #{breakpoint('md')})

	// 	.container
	// 		font-size: 1.4rem

	.container
		font-size: 1rem
		line-height: 1.2
		@include flex-col-middle(.5rem)

		.heading
			color: var(--cm-primary)
			font-size: 1.6em
			font-weight: 600

			> span:last-child
				color: var(--cm-primary-light)

	
	@media (min-width: #{breakpoint('md')})

		.container
			font-size: 1.4rem

</style>