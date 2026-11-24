<script lang="ts">

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	const action = () => layout.set({overlay:$layout.overlay != 'fulfillment' ? 'fulfillment' : null})

	$: fulfillment = f.titleByName($search.fulfillment === null ? 'both' : $search.fulfillment)

</script>



<Button {action} wrapper>

	<span>Filter: {fulfillment} <Icon name="chevronDown" size=".75rem" /></span>

</Button>