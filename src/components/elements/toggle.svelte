<script lang="ts">

	import { classes } from 'src/lib/helpers'



	// attributes
	export let name: string|undefined = undefined

	// options
	export let application: boolean = false

	// function
	export let data:	boolean	= false
	export let changed:	boolean	= false

	$: _ = classes({application})

</script>



<label>
	<span>
		
		<slot />
	
	</span>
	<input type="checkbox" role="switch" {name} class={_} bind:checked={data} on:change={() => changed = true} />
</label>



<style lang="sass">

	label
		display: inline
		font-weight: inherit

		input
			padding: 0 !important

</style>