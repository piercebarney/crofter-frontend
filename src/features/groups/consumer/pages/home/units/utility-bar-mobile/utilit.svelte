<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { slide } from 'svelte/transition'
	// import { layout } from 'src/stores/layout'
	import FulfillmentSlider from 'src/features/groups/consumer/modules/fulfillmentSlider.svelte'
	// import LocationDetails from 'src/features/groups/consumer/pages/home/units/partials/location-details.svelte'
	import LocationDetailsSelectButton from 'src/features/groups/consumer/pages/home/units/partials/location-details-select-button.svelte'
	// import LocationDetailsSelectMenu from 'src/features/groups/consumer/pages/home/units/partials/location-details-select-menu.svelte'



	export let optionName: string|null
	export let locations: PickUpLocation[]
	export let location: PickUpLocation|undefined
	// export let mobileUtilityBarElement: HTMLDivElement

	// $: openHours = location?.openHours.string

	// const showDetails = () => layout.set({overlay:$layout.overlay != 'location-details' ? 'location-details' : null})

</script>



<div class="utility-bar-mobile-wrapper">
	<div class="container">
		<div>

			<FulfillmentSlider hideIcons />

		</div>

		<!-- {#if optionName != 'delivery'}

			<div transition:slide>

				<span role="presentation" on:click={showDetails} on:keypress={showDetails}>{@html openHours}</span>

			</div>

		{/if} -->

	</div>

	{#if optionName != 'delivery' && location && locations}

		<div class="container" transition:slide>

			<LocationDetailsSelectButton {location} />

			<!-- <LocationDetailsSelectMenu {locations} /> -->

		</div>
	
	{/if}

</div>

<!-- {#if $layout.overlay == 'location-details'}

	<div class="details" role="presentation" on:click={layout.closeMenu} on:keypress={layout.closeMenu}>

		<span>The products currently displayed are available for pickup at this location and at these times.</span>

		<LocationDetails {location} />

	</div>

{/if} -->



<style lang="sass">

	.utility-bar-mobile-wrapper
		border-bottom: 1px solid var(--cm-border)
		padding: 1rem 0
		@include flex-col(1rem)

		> div
			position: relative

		div:first-child
			@include flex-row-middle-between(1rem)

			// div:last-child
			// 	position: relative
			// 	@include flex-col-middle

			// 	> span
			// 		cursor: pointer
			// 		overflow: hidden
			// 		border: 1px solid var(--cm-border)
			// 		border-radius: var(--pico-border-radius)
			// 		padding: .5rem
			// 		line-height: 1.2

			// 		&:hover
			// 			background-color: var(--cm-background-secondary)

	// .details
	// 	z-index: 110
	// 	max-width: 90%
	// 	width: #{breakpoint('xs')}
	// 	border-radius: var(--pico-border-radius)
	// 	background-color: var(--cm-background)
	// 	padding: 1rem
	// 	@include flex-col(1rem)
	// 	@include fixed-top-center(6rem)

	// 	> span
	// 		display: block
	// 		max-width: 100%
	// 		word-wrap: break-word
	// 		line-height: 1.2

</style>