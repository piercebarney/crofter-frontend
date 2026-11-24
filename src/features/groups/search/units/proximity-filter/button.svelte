<script lang="ts">

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	const action = () => layout.set({overlay:$layout.overlay != 'proximity' ? 'proximity' : null})

	$: proximity = $search.proximity

</script>



<Button id="search-proximity" {action} wrapper>
	
	<span>{#if proximity}{proximity} mi{:else}Any{/if} <Icon name="chevronDown" size=".75rem" /></span>

</Button>



<style lang="sass">

	:global(#search-proximity)
		border: 1px solid transparent
		border-radius: var(--pico-border-radius)

	:global(#search-proximity.active:focus)
		border-color: red !important
		background-color: rgba(255, 0, 0, 0.1)

</style>