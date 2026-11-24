<script lang="ts">

	import { tText } from 'src/components/elements/tooltip/helpers'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let tip:			string|undefined	= undefined
	export let str:			string|undefined	= undefined
	export let placement:	string|undefined	= undefined
	export let iconName:	string|undefined	= 'info'
	export let iconSize:	string|undefined	= undefined

	const getTip = (chain:string, tips:Record<string,any>):string|undefined => {

		const tArray	= chain.split(':')
		const key		= tArray.shift()

		if (key) {
			
			const newTips = tips[key]

			if (newTips) {
			
				if (tArray.length > 0 && typeof newTips == 'object') return getTip(tArray.join(':'), newTips)
				
				const str = tips[key]

				if (str) return str

				return undefined
			}

			return undefined
		}

		return undefined
	}

	$: dT = tip ? getTip(tip, tText) : str ? str : undefined

</script>



<span data-tooltip={dT} data-placement={placement} data-html="true">

	<slot />

	{#if iconName}

		<Icon name={iconName} size={iconSize == undefined ? '1rem' : iconSize} />

	{/if}

</span>