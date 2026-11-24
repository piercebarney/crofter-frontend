<script lang="ts">

	import { search } from 'src/features/groups/search/store'
	import Slider from 'src/components/elements/slider.svelte'
	import { onMount } from 'svelte'


	export let hideIcons: boolean	= false
	export let inverse: boolean		= false

	const options = [
		{title:'Delivery',	id:'delivery',		icon:'truck'},
		{title:'Pickup',	id:'pickup',		icon:'booth'}
	]
	
	let id = $search.fulfillment

	onMount(() => {

		search.subscribe((search) => {

			if (search.fulfillment !== id) id = search.fulfillment
		})
	})

</script>



<div class="fulfillment-type-slider-wrapper">

	<Slider {options} bind:id {hideIcons} {inverse} />

</div>



<style lang="sass">

	.fulfillment-type-slider-wrapper
		height: 100%
		@include flex-col-middle

</style>