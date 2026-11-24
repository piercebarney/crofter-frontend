<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Header from 'src/features/groups/company/producer/layouts/application/partials/header.svelte'



	export let routeName: string

	let wrapperElement:	HTMLElement
	
	$: if (wrapperElement) layout.setScrollElement(wrapperElement)

</script>



<div class="wrapper-body">

	<Header {routeName} />

	<main bind:this={wrapperElement} on:scroll={layout.setScroll}>
		<div>
	
			<slot />

		</div>
	</main>
</div>



<style lang="sass">

	.wrapper-body
		background-color: #FFFFFF
		@include flex-col
		@include fill

		main
			overflow: auto
			padding: 3rem 2rem
			scroll-behavior: smooth

			> div
				@include fill


	@media (min-width: #{breakpoint('sm')})

		.wrapper-body

			main
				padding: 4rem 3rem

	
	@media (min-width: #{breakpoint('md')})

		.wrapper-body

			main
				padding: 0 2rem

</style>