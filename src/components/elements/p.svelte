<script lang="ts">

	import { classes } from 'src/lib/helpers'



	export let danger:		boolean	= false
	export let warning:		boolean	= false
	export let center:		boolean	= false
	export let background:	boolean	= false

	$: _ = classes({danger}, {warning}, {center}, {background})

</script>



<p class={_}>

	<slot />

</p>



<style lang="sass">

	p

		&.danger,
		&.warning
			padding: .75rem

		&.danger
			//-color: var(--cm-danger)
			color: var(--cm-danger)

		&.warning
			//background-color: var(--cm-warning)
			color: var(--cm-warning)

		&.center
			width: 100%
			text-align: center

		&.background
			background-color: var(--cm-background)
			border-radius: var(--pico-border-radius)

</style>