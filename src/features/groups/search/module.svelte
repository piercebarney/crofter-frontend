<script lang="ts">

	import type { ActiveAccount } from 'src/features/pages/account/store'

	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Button from 'src/components/elements/button.svelte'
	import ProximityButton from 'src/features/groups/search/units/proximity-filter/button.svelte'



	// attributes
	export let disabled: boolean = false

	// data
	export let account:		ActiveAccount
	export let routeName:	string

	let inputElement:			HTMLInputElement|null	= null,
		zipCodeElement:			HTMLSpanElement|null	= null,
		iconWrapperWidth:		number,
		optionsWrapperWidth:	number,
		term: 					string				= $search.term,
		searchParams: 			string				= `${$search.term}${$search.zipCode}${$search.fulfillment}${$search.proximity}`,
		id:						string				= 'product-search',
		name:					string				= 'product-search',
		textIsSelected:			boolean				= false,
		zipEditing:				boolean				= false,
		zipText:				string				= '',
		mounted:				boolean				= false,
		preload:				boolean				= true,
		allow:					boolean				= true

	const clear = () => { 
		
		search.clear()
		
		term			= ''
		searchParams	= `${$search.term}${$search.zipCode}${$search.fulfillment}${$search.proximity}`
	}

	const blur = (e:KeyboardEvent|null = null) => {

		if 		(e && e.key == 'Enter' && term == '')	clear()
		else if (!e && term == '')						clear()
	}

	const init = () => {
		zipEditing = true
		zipText = ''
	}

	const key = (e:KeyboardEvent) => {

		if (zipCodeElement) {

			const text	= zipText
			const key	= e.key

			if (key == 'Enter') {
				
				e.preventDefault()
				
				zipCodeElement.blur()
			
			} else if ((text.length >= 5 && !textIsSelected) || !/^\d+$/.test(key)) {
				
				e.preventDefault()

				textIsSelected = false
			}
		
		} else e.preventDefault()
	}

	const update = () => {
		zipEditing = false

		const text = zipText

		if	(text.length != 5 || !/^\d+$/.test(text))	zipText = zipCode
		else									search.set({enteredZipCode:text})
	}

	const selected = () => {

		if (browser) {
			
			const selection = window.getSelection()

			if	(selection && selection.type == 'Range')	textIsSelected = true
			else											textIsSelected = false
		}
	}

	$: isDesktop	= $layout.isDesktop
	$: sortType		= $search.sort.type
	$: zipCode		= $search.zipCode ? $search.zipCode : 'Zip Code'
	$: hasZipCode	= zipCode == 'Zip Code' ? false : true
	$: if (!zipEditing) zipText = zipCode

	$: search.set({term:term.trim()})

	$: if (account) search.set({account})

	$: if (term && !$search.term) clear()

	$:	if ((routeName == 'producer-products' || routeName == 'distributor-products') && $search.api != 'companyProducts') {
			
			search.setApi('companyProducts')

			term	= ''
			id		= 'company-product-search'
			name	= 'company-product-search'
		
		} else if ((routeName == 'producer-orders' || routeName == 'distributor-orders')) {
		
			if (sortType == 'order' && $search.api != 'companySortByOrder') {
			
				search.setApi('companySortByOrder')

				term	= ''
				id		= 'company-by-order-search'
				name	= 'company-by-order-search'
			
			} else if (sortType == 'product' && $search.api != 'companySortByProduct') {

				search.setApi('companySortByProduct')

				term	= ''
				id		= 'company-by-product-search'
				name	= 'company-by-product-search'
			}
		
		} else if ($search.api != 'products') {
			
			search.setApi('products')

			term	= ''
			id		= 'product-search'
			name	= 'product-search'
		}

	$: if (inputElement && iconWrapperWidth !== null) inputElement.style.paddingLeft = `${iconWrapperWidth}px`

	$: if (inputElement && optionsWrapperWidth !== null) inputElement.style.paddingRight = `${optionsWrapperWidth}px`

	$: if (mounted && $search.term && searchParams != `${$search.term}${$search.zipCode}${$search.fulfillment}${$search.proximity}`) {
		
		if (!preload) {
			
			if (allow) search.do()

			allow = true
		}
		
		searchParams	= `${$search.term}${$search.zipCode}${$search.fulfillment}${$search.proximity}`
		preload			= false

	}

	$: if ($search.progTerm) term = $search.progTerm

	onMount(() => {

		if (!term && $search.term ? true : false)	{
			
			term	= $search.term
			allow	= false

		} else preload = false

		mounted	= true
	})

</script>



<div class="search-wrapper">
	<div>
		<sapn class="icon-wrapper" bind:clientWidth={iconWrapperWidth}>

			<A route="home" wrapper>
				
				<Icon name="search" />
			
			</A>

		</sapn>
		<input {id} {name} type="text" placeholder={$search.placeholder} {disabled} bind:this={inputElement} bind:value={term} on:blur={() => blur()} on:keypress={(e) => blur(e)} />
		<div class="options-wrapper" bind:clientWidth={optionsWrapperWidth}>

			{#if term}

				<span class="clear-wrapper">

					<Button action={clear} wrapper>

						<Icon name="x" size=".75rem" />

					</Button>

				</span>

			{/if}

			{#if account?.type == 'consumer'}

				<span class="options-spacer"></span>
				<span role="none" id="search-zip-code" class={`zip-code${hasZipCode ? '' : ' empty'}`} class:active={zipEditing} contenteditable bind:this={zipCodeElement} bind:textContent={zipText} on:focus={init} on:keypress={(e) => key(e)} on:keyup={selected} on:mouseup={selected} on:blur={update}>{zipCode}</span>
				
				{#if isDesktop && hasZipCode}

					<ProximityButton />

				{/if}

			{/if}

		</div>
	</div>
</div>



<style lang="sass">

	.search-wrapper
		@include fill
		@include flex-row-middle-center
		
		> div
			position: relative
			width: 100%
			padding: 1px

			.icon-wrapper				
				z-index: 1
				padding: 0 var(--cm-nav-input-option-spacing) 0 var(--cm-nav-input-padding-horizontal)
				color: var(--cm-nav-text-inverse)
				@include absolute-middle-left

			input
				padding-right: 50%
				padding-left: 1.5rem

			.options-wrapper				
				padding: 0 var(--cm-nav-input-padding-horizontal) 0 var(--cm-nav-input-option-spacing)
				color: var(--cm-text)
				@include absolute-middle-right
				@include flex-row-middle-right(var(--cm-nav-input-option-spacing))


				.clear-wrapper
					color: var(--cm-nav-text-inverse)
					stroke: var(--cm-nav-text-inverse)

				.options-spacer
					height: 1rem
					border-left: 1px solid black
				
				.zip-code
					min-width: 3.75rem
					margin: -2px -4px
					padding: 2px 4px
					border: 1px solid transparent
					text-align: center
					cursor: pointer

					&.empty
						color: var(--cm-text-secondary)

					&.active
						border-color: red !important
						background-color: rgba(255, 0, 0, 0.1)

					&:focus-visible
						outline: none
						border-color: black
						border-radius: 4px
						color: var(--cm-text)
						cursor: text

</style>