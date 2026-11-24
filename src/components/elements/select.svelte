<script lang="ts">

	import { onMount } from 'svelte'

	

	// data
	export let list: string|undefined			= undefined
	export let options: Record<string,any>[]	= []

	// attribute
	export let name: string|undefined			= undefined
	export let value: string|undefined			= undefined
	export let required: boolean|undefined		= undefined
	export let placeholder: string|undefined	= undefined
	export let disabled: boolean|undefined		= undefined
	export let c: string|undefined				= undefined

	onMount(() => {
		
		if (list && list != 'routes') import(`../../lists/${list}.ts`)
			.then(data => {
				
				options = data.selectData.options
				
				if (!name) name = data.selectData.name

				if (!placeholder) placeholder = data.selectData.placeholder
			})
			.catch(() => console.error('Could not import select data from', `/src/lists/${list}.ts`))
	})

	$: if (value === null) value = ''

</script>



<select {name} class="{c ? c : ''} {!value ? 'placeholder' : ''}" bind:value={value} on:change {required} {disabled}>
	<option value="" disabled selected>{placeholder ? placeholder : 'Select'}</option>

	{#each options as {value, option} (value)}

		<option {value}>{option}</option>

	{/each}

</select>



<style lang="sass">

	select
		line-height: 1.2rem

		&.placeholder
			color: #757575
		
</style>