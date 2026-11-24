<script lang="ts">

	import type { PickUpLocation } from 'src/features/groups/consumer/pages/home/types'

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let location: PickUpLocation|undefined

	const action = () => layout.set({overlay:$layout.overlay != 'locations' ? 'locations' : null})

</script>



<Button {action} c="locations-button-wrapper-mobile" wrapper >

	<span class="name">{location?.title}</span>
	<div class="arrow-icon">
			
		<Icon name="chevronDown" />

	</div>

</Button>



<style lang="sass">

	:global(.locations-button-wrapper-mobile)
		@include flex-row-middle(.5rem)

</style>