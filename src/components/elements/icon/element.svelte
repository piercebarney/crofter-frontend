<script lang="ts">

	import { icons } from 'src/components/elements/icon/helpers'


	
	export let name:	string				= ''
	export let size:	string				= '1rem'
	export let c:		string|undefined	= undefined

	$: icon 	= icons(name)
	$: viewBox	= icon?.viewBox ? icon.viewBox : undefined
	$: data		= icon.data

</script>



<svg xmlns="http://www.w3.org/2000/svg" height={size} width={size} {viewBox} class={c}>

	{@html data}

</svg>



<style lang="sass">

	svg
		display: inline-block

</style>