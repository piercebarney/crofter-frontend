<script lang="ts">

	import type { Alert } from 'src/types/alert'

	import { classes } from 'src/lib/helpers'
	import { modal as m } from 'src/features/modules/modal/store'



	// attributes
	export let id: string|undefined								= undefined
	export let aria: string|undefined							= undefined
	export let title: string|undefined							= undefined
	export let role: string|undefined							= undefined
	export let type: "button"|"submit"|"reset"|null|undefined	= "button"
	export let c: string|undefined								= undefined
	export let disabled: boolean|undefined						= undefined
	export let style: string|undefined							= undefined

	// options
	export let div: boolean						= false
	export let wrapper: boolean					= false // removes all styles and formatting
	export let link: boolean					= false
	export let selected: boolean				= false
	export let outline: boolean					= false
	export let text: boolean					= false
	export let secondary: boolean				= false
	export let inverse: boolean					= false
	export let danger: boolean					= false
	export let warning: boolean					= false
	export let success: boolean					= false
	export let info: boolean					= false
	export let application: boolean				= false
	export let applicationSecondary: boolean	= false
	export let square: boolean					= false
	export let pill: boolean					= false
	export let tall: boolean					= false
	export let thin: boolean					= false
	export let mini: boolean					= false
	export let tr: boolean						= false
	export let round: boolean					= false
	export let boarder: boolean					= false
	export let underline: boolean				= false
	export let hoverUnderline: boolean			= false
	export let active: boolean					= false
	export let stopPropagation: boolean			= false
	export let smaller: boolean					= false

	// function
	export let element: HTMLElement|undefined	= undefined
	export let modal: string|null				= null
	export let action: (()=>any)|null			= null
	export let formSubmit: (()=>any)|null		= null
	export let loading: boolean					= false
	export let alert: Alert|null				= null
	export let modalAlert: Alert|null			= null
	
	export const reset = () => {

		disabled	= false
		loading		= false
	}

	// data
	export let data: any = null

	let isDisabled: boolean				= false,
		widths: Record<string, string>	= {minH: '', maxH: '', minW: '', maxW: ''}

	const trigger = () => {

		if (alert) {

			const alertPromise = new Promise((resolve) => m.open('alert', {alert:{...alert, resolve}}))

			alertPromise.then(actions)

		} else if (modalAlert) {

			const alertPromise = m.alert(modalAlert)

			alertPromise.then(() => actions())

		} else actions()
	}

	const actions = () => {

		if (modal)		m.open(modal, data)
		if (action)		action()
		if (formSubmit)	loading = formSubmit()
	}

	$: loading, (() => {
	
		if (element) {

			if (loading) {

				const width = element.offsetWidth
				const height = element.offsetHeight

				widths.minH = element.style.minHeight || ''
				widths.maxH = element.style.maxHeight || ''
				widths.minW = element.style.minWidth || ''
				widths.maxW = element.style.maxWidth || ''

				element.style.minHeight = `${height}px`
				element.style.maxHeight = `${height}px`
				element.style.minWidth = `${width}px`
				element.style.maxWidth = `${width}px`

				isDisabled = true
				
			} else {

				element.style.minWidth = widths.minW
				element.style.maxWidth = widths.maxW
				element.style.minHeight = widths.minH
				element.style.maxHeight = widths.maxH

				widths = {minH: '', maxH: '', minW: '', maxW: ''}

				isDisabled = disabled ? true : false
			}
		}
	})()

	$:	 if	(wrapper)	role = 'wrapper'
	else if	(link)		role = 'link'

	$: _ = classes(c, (tr ? 'button' : undefined), {selected}, {outline}, {text}, {secondary}, {inverse}, {danger}, {warning}, {success}, {info}, {application}, {applicationSecondary}, {square}, {pill}, {tall}, {thin}, {mini}, {round}, {boarder}, {underline}, {hoverUnderline}, {active}, {smaller})

	// Default to a non-submitting button unless explicitly set or used for form submission
	$: if (type == null) type = formSubmit ? 'submit' : 'button'

</script>



{#if tr}

	<tr {id} class={_} on:click={trigger} on:keypress={trigger}>

		<slot />

	</tr>

{:else if div}

	<div {id} aria-label={aria} {title} {role} class={_} {style} bind:this={element} on:click={trigger} on:keypress={trigger}>

		{#if loading}

			<div aria-busy="true"></div>

		{:else}
		
			<slot />

		{/if}

	</div>

{:else if stopPropagation}

	<button {id} aria-label={aria} {title} {role} {type} class={_} {style} bind:this={element} on:click|stopPropagation={trigger} on:keypress|stopPropagation={trigger} disabled={isDisabled}>

		{#if loading}

			<div aria-busy="true"></div>

		{:else}
		
			<slot />

		{/if}

	</button>

{:else}

	<button {id} aria-label={aria} {title} {role} {type} class={_} {style} bind:this={element} on:click={trigger} on:keypress={trigger} disabled={isDisabled}>

		{#if loading}

			<div aria-busy="true"></div>

		{:else}
		
			<slot />

		{/if}

	</button>

{/if}



<style lang="sass">

	div
		cursor: pointer

	button

		&.smaller
			font-size: .8rem
		
</style>
