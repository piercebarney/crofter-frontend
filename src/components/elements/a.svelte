<script lang="ts">

	type Company = {
		id: string
		name: string
		role: string
		[key: string]: any
	}
	import type { Alert } from 'src/types/alert'

	import { goto } from '$app/navigation'
	import { modal } from 'src/features/modules/modal/store'
	import { routes } from 'src/lists/routes'
	import { classes } from 'src/lib/helpers'



	// attributes
	export let href: string|undefined		= undefined
	export let target: string|undefined		= undefined
	export let aria: string|undefined		= undefined
	export let title: string|undefined		= undefined
	export let role: string|undefined		= undefined
	export let c: string|undefined			= undefined
	export let disabled: boolean|undefined	= undefined

	// svelte properties
	export let preloadCode:	true|"eager"|"viewport"|"hover"|"tap"|"off"|null|undefined	= 'off' // viewport
	export let preloadData:	true|"hover"|"tap"|"off"|null|undefined						= 'off' // hover

	// options
	export let wrapper: boolean				= false // removes all styles and formatting
	export let button: boolean				= false
	export let tr: boolean					= false
	export let outline: boolean				= false
	export let light: boolean				= false
	export let secondary: boolean			= false
	export let inverse: boolean				= false
	export let danger: boolean				= false
	export let tall: boolean				= false
	export let thin: boolean				= false
	export let mini: boolean				= false
	export let boarder: boolean				= false
	export let application: boolean			= false
	export let square: boolean				= false
	export let hoverUnderline: boolean		= false
	export let hoverApplication: boolean	= false
	export let smaller: boolean				= false
	export let underline: boolean			= false

	// function
	export let route: string				= '' // name of route
	export let company: Company|null		= null
	export let values: Record<string,any>	= {} // values needed by route
	export let action: (()=>any)|null		= null // function to call
	export let alert: Alert|null			= null

	let resolvedHref: string|undefined = undefined

	const trigger = (e:Event) => {

		if (alert) {

			e.preventDefault()

			const alertPromise = new Promise((resolve) => modal.open('alert', {alert:{...alert, resolve}}))

			alertPromise.then(() => actions())

		} else actions()
	}

	const actions = () => {

		if (action)			action()
		if (alert && href) {

			if (_isExternalHref(href) || _isFragmentHref(href)) window.location.href = href
			else goto(_normalizeInternalHref(href))
		}
	}

	const _isExternalHref = (value: string) => {
		return /^[a-z][a-z0-9+.-]*:/.test(value) || value.startsWith('//')
	}

	const _isFragmentHref = (value: string) => {
		return value.startsWith('#')
	}

	const _normalizeInternalHref = (value: string) => {
		return value.startsWith('/') ? value : `/${value}`
	}

	$:   if	(company)	href = routes.pathname(company.role.toLowerCase(), {path:{id: company.id, name: company.name}})
	else if	(route)		href = routes.pathname(route, values)

	$: resolvedHref = href
		? (_isExternalHref(href) || _isFragmentHref(href)
			? href
			: _normalizeInternalHref(href))
		: href

	$: _ = classes(c, (!href && !action ? 'disabled' : undefined), (tr ? 'table-row' : undefined), {light}, {secondary}, {inverse}, {danger}, {tall}, {thin}, {mini}, {boarder}, {application}, {square}, {outline}, {hoverUnderline}, {hoverApplication}, {smaller}, {underline})

	$:   if	(wrapper)	role = 'wrapper'
	else if	(button)	role = 'button'

</script>



<a href={resolvedHref} {target} aria-label={aria} {title} class={_} {role} aria-disabled={disabled} on:click={trigger} on:keypress={trigger} tabindex="0" data-sveltekit-preload-code={preloadCode} data-sveltekit-preload-data={preloadData}>

	<slot />

	<span style="display:contents"></span>
</a>



<style lang="sass">

	a
		&:not([role="wrapper"])
			@include flex-row-middle(.5rem)

		&.smaller
			font-size: .8rem

		&.table-row
			display: table-row

		&.disabled
			pointer-events: none
			color: #ccc

		&[aria-disabled="true"]
			pointer-events: none
			opacity: 0.6
			cursor: not-allowed

		&.underline
			text-decoration: underline

</style>