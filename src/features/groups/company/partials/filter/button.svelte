<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let filterFulfillmentMethod:	string
	export let filterOrderStatus:		string

	const action = () => layout.set({overlay:$layout.overlay != 'order-fulfillment' ? 'order-fulfillment' : null})

</script>



<div>

	<Button {action} c={`order-fulfillment-button-wrapper${filterFulfillmentMethod == 'all' && filterOrderStatus == 'all' ? ' text' : ''}`} inverse pill mini>

		<Icon name="filter" />

		<span>Filter</span>

	</Button>

</div>



<style lang="sass">

	:global(.order-fulfillment-button-wrapper)
		position: relative
		@include flex-row-left(var(--cm-nav-button-padding-horizontal))

</style>