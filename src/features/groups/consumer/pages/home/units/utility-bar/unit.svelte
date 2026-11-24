<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { slide } from 'svelte/transition'
	import { search } from 'src/features/groups/search/store'
	// import Button from 'src/features/groups/consumer/pages/home/units/utility-bar/partials/button-small.svelte'
	// import LocationDetails from 'src/features/groups/consumer/pages/home/units/partials/location-details.svelte'
	import LocationDetailsSelectButton from 'src/features/groups/consumer/pages/home/units/partials/location-details-select-button.svelte'



	// export let locations:			PickUpLocation[]
	export let location: 			PickUpLocation|undefined
	export let utilityBarElement:	HTMLDivElement

	$: locationName	= $search.locationName

	$: locationName, (() => {

		if (locationName == $search.locationName) return
		
		search.set({locationName})
	})()

</script>



<div class="utility-bar-wrapper" bind:this={utilityBarElement} transition:slide>
	<div class="container">
		<!-- <div class="buttons">

			{#each locations as l}

				<Button bind:locationName name={l.name} title={l.title} />

			{/each}

		</div>

		<LocationDetails {location} shortHours method /> -->

		<div>

			<LocationDetailsSelectButton {location} />

		</div>
	</div>
</div>



<style lang="sass">

	.utility-bar-wrapper
		z-index: 100
		position: sticky
		top: 0
		margin-bottom: .5rem
		padding: 1rem 0
		background-color: var(--cm-background)
		
		> div
			position: relative
			height: 100%
			@include flex-col-left(2rem)

			// .buttons
			// 	height: 100%
			// 	font-size: 1.25rem
			// 	@include flex-row-middle-right(.5rem)

			> div
				width: 100%


	@media (min-width: #{breakpoint('lg')})

		.utility-bar-wrapper

			> div
		
				> div
					width: max-content

</style>