<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'



	export let locations: PickUpLocation[]

	const action = (locationName:string) => {

		if (locationName == $search.locationName) return
		
		search.set({locationName})

		layout.closeMenu()
	}

</script>



{#if $layout.overlay == 'locations'}

	<div role="menu" tabindex="0" class="menu-wrapper" on:mouseleave={layout.closeMenu}>
		<ul>

			{#each locations as location (location.name)}

				<li role="menuitem" on:click={() => action(location.name)} on:keypress={() => action(location.name)}>{location.title}</li>

			{/each}

		</ul>
	</div>

{/if}



<style lang="sass">

	.menu-wrapper
		position: absolute
		z-index: 10
		top: 100%
		right: -25%
		height: fit-content
		width: max-content
		border: none !important
		border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius)
		background-color: var(--cm-background)
		color: var(--cm-text)
		cursor: default

		ul
			margin: 0
			padding: .25rem 0

			li				
				margin: 0
				padding: 1rem 2rem
				list-style-type: none
				@include flex-row-left(.75rem)

			li:hover
				background-color: var(--cm-utility-highlight)
				cursor: pointer

</style>