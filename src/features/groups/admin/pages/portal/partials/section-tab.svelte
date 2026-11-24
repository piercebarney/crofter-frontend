<script lang="ts">

	export let name:	string
	export let active:	boolean					= false
	export let tab:		(tabName: any) => void

</script>



<span class="tab {name} {active ? 'active' : ''}" role="tab" tabindex={0} on:click={() => tab(name)} on:keyup={() => tab(name)}>
	
	<slot />

</span>



<style lang="sass">

	span
		padding: .25rem .5rem
		font-size: 1.25rem
		border-radius: .5rem .5rem 0 0

		&.active
			background-color: white
			border-top: 1px solid #ddd
			border-right: 1px solid #ddd
			border-left: 1px solid #ddd

		&:not(.active):hover
			background-color: #ddd
			cursor: pointer


	@media (min-width: #{breakpoint('md')})

		span
			padding: .5rem 1.5rem

</style>