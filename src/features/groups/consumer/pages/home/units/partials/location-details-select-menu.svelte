<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import LocationDetails from 'src/features/groups/consumer/pages/home/units/partials/location-details.svelte'



	export let locations: PickUpLocation[]

	const action = (locationName:string) => {

		// if (locationName == $search.locationName) return
		
		search.set({locationName})

		layout.closeMenu()
	}

</script>



{#if $layout.overlay == 'locations'}

	<div class="select-menu-wrapper container">
		<div>
			<span>Select a location to see what’s in stock for pickup there.</span>
			<div>

				{#each locations as location (location)}
					
					<div role="menuitem" tabindex="0" on:click={() => action(location.name)} on:keypress={() => action(location.name)}>

						<LocationDetails {location} shortHours />

					</div>

				{/each}

				<span style="display:contents"></span>
			</div>
		</div>
	</div>

{/if}



<style lang="sass">

	.select-menu-wrapper
		z-index: 120
		position: fixed
		top: 8rem
		right: 0
		left: 0

		> div
			overflow: hidden
			max-height: 26rem
			border: 1px solid var(--cm-border)
			border-radius: var(--pico-border-radius)
			background-color: var(--cm-background)
			@include flex-col

			> span
				flex-shrink: 0
				display: block
				border-bottom: 1px solid var(--cm-border)
				padding: 1rem
				font-size: 1.25rem
				line-height: 1.5rem
				font-weight: 600

			> div
				padding: 1rem
				overflow: auto
				flex: 1
				min-height: 0
				@include flex-col(.5rem)

				> div
					cursor: pointer
					padding: 1rem
					border: 1px solid var(--cm-border)
					border-radius: var(--pico-border-radius)
					
					&:hover
						background-color: var(--cm-background-secondary)


	@media (min-width: #{breakpoint('md')})

		.select-menu-wrapper
			
			> div

				> span
					padding: 2rem
					font-size: 1.8rem


	@media (min-width: #{breakpoint('lg')})

		.select-menu-wrapper
			max-width: #{breakpoint('md')}

			> div

				> span
					font-size: 1.6rem

</style>