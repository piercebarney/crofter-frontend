<script lang="ts">

	import { classes } from 'src/lib/helpers'

	// options
	export let margin:	boolean	= true
	export let center:	boolean	= false
	export let loader:	boolean = false
	export let big:		boolean = false
	export let small:	boolean = false

	$: _ = classes({margin},{center},{big},{small})

</script>





{#if loader}

	<span class={`${_} loading-placeholder chunk`}></span>

{:else}

	<span class={_}>

		<slot />

	</span>

{/if}



<style lang="sass">
	
	span
		display: inline-block
		font-weight: 700
		font-size: 1.4rem
		overflow-wrap: break-word
		word-break: break-word
		max-width: 100%
		line-height: 1.2

		&.margin
			margin-bottom: 1rem

		&.center
			text-align: center

		&.big
			font-size: 2.4rem

		&.small
			font-size: 1rem

	@media (min-width: #{breakpoint('md')})

		span
			font-size: 1.8rem

			&.margin
				margin-bottom: 1.5rem

			&.big
				font-size: 3rem

			&.small
				font-size: 1.6rem

</style>