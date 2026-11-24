<script lang="ts">

	import Icon from 'src/components/elements/icon/element.svelte'
	import Button from 'src/components/elements/button.svelte'



	// data
	export let name: string
	export let title: string
	// export let availability:	string
	export let locationName: string|null

</script>



{#if name}

	<Button action={() => locationName = name} c="utility-bar-button" role="wrapper" active={locationName == name}>

		<Icon name="booth" size="2rem" />

		<span class="title">{title}</span>
		<!-- <span class="availability">{availability}</span> -->

	</Button>

{/if}



<style lang="sass">

	:global(.utility-bar-button)
		border: 1px solid var(--cm-background-secondary)
		border-radius: var(--pico-border-radius)
		background-color: var(--cm-background-secondary)
		padding: 1rem
		transition: background-color var(--pico-transition)
		@include flex-col-between(.5rem)
		@include area(7rem)

		&:hover
			background-color: var(--cm-secondary-hover)

		.title
			flex-grow: 0
			font-size: 1rem
			font-weight: 600

		// .availability
		// 	font-size: .8rem
		// 	color: rgba(0, 0, 0, .5)

	:global(.utility-bar-button.active)
		cursor: default
		fill: var(--cm-text-inverse)
		color: var(--cm-text-inverse)
		background-color: var(--cm-primary)
		transition: all var(--pico-transition)

		// .availability
		// 	color: rgba(255, 255, 255, .5)

</style>
