<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import LocationDetails from 'src/features/groups/consumer/pages/home/units/partials/location-details.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let location: PickUpLocation|undefined

	const action = () => layout.set({overlay:$layout.overlay != 'locations' ? 'locations' : null})
	
</script>



<Button {action} c="locations-button-wrapper" wrapper >
	
	<LocationDetails {location} shortHours method />

	<div class="arrow-icon">

		<Icon name="chevronDown" size="1.5rem" />

	</div>

	<span style="display:contents"></span>
</Button>



<style lang="sass">

	:global(.locations-button-wrapper)
		width: 100%
		border: 1px solid var(--cm-border)
		border-radius: var(--pico-border-radius)
		padding: .5rem 1rem .5rem .5rem
		@include flex-row-middle-between(1rem)

		&:hover
			background-color: var(--cm-background-secondary)

		// Allow LocationDetails to shrink
		:global(.location-details-wrapper)
			min-width: 0
			flex-shrink: 1

		.arrow-icon
			height: 100%
			flex-shrink: 0


		@media (min-width: #{breakpoint('lg')})
			gap: 2rem

</style>
