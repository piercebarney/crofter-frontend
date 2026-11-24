<script lang="ts">

	type Option = {name?:string, title?:string, id:string, icon?:string}

	import { onMount } from 'svelte'
	import { formatTitle } from 'src/components/helpers'
	import { layout } from 'src/stores/layout'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let options: Option[]
	export let id: string|null		= options[0].id
	export let change: boolean		= false
	export let hideIcons: boolean	= false
	export let inverse: boolean		= false

	let containerElement: HTMLElement,
		selectorElement: HTMLElement,
		optionElements: NodeListOf<HTMLElement>,
		division: number							= 0

	//options = [{name:'OPTION A',id:''},{name:'OPTION B',id:''},{name:'OPTION C',id:''},{name:'OPTION D',id:''}]

	$: layoutSize	= $layout.size
	$: safeId		= options.some(o => o.id == id) ? id : options[0].id

	$: layoutSize, setEqualWidths()

	$: if (selectorElement && division && safeId) {

		const index = options.findIndex(o => o.id == safeId)

		containerElement.querySelector('li.active')?.classList.remove('active')
		containerElement.querySelectorAll('li')[index].classList.add('active')

		selectorElement.style.left = `${division * index}%`
	}

	const setEqualWidths = () => {

		if (!containerElement) return

		const items = containerElement.querySelectorAll('li')
		
		let maxWidth = 0

		items.forEach(item => {

			item.style.width = 'auto'

			const width = item.getBoundingClientRect().width

			if (width > maxWidth) maxWidth = width
		})

		items.forEach(item => item.style.width = `${maxWidth}px`)
	}

	const select = (index:number) => {

		id = options[index].id

		change = true
	}

	onMount(() => {

		optionElements	= containerElement.querySelectorAll('li')
		division		= 100 / optionElements.length

		selectorElement.style.width		= `${division}%`
		selectorElement.style.display	= 'block'

		setEqualWidths()
	})

</script>



<div class="slider" class:inverse>
	<ul bind:this={containerElement}>

		{#each options as option, index (index)}

			<li class={index === 0 ? 'active' : undefined}>
				<span>{#if !hideIcons && option?.icon}<Icon name={option.icon} size="1.5rem" />{/if}{option?.title ? option.title : option?.name ? formatTitle(option.name) : ''}<span style="display:contents"></span></span>
				<div role="none" on:click={() => select(index)} on:keypress={() => select(index)}></div>
			</li>

		{/each}

	</ul>
	<div bind:this={selectorElement}></div>
</div>



<style lang="sass">

	.slider
		position: relative
		width: 100%
		border-radius: 999px
		border: .25rem solid var(--cm-secondary)
		background-color: var(--cm-secondary)
		//box-shadow: 0px 1px 4px 0px rgba(0,0,0,0.15) inset

		&.inverse
			border-color: var(--cm-primary-hover)
			background-color: var(--cm-primary-hover)

			ul

				li
					color: var(--cm-primary-hover)
					stroke: var(--cm-primary-hover)

				li:not(.active)
					color: var(--cm-primary-inverse)
					stroke: var(--cm-primary-inverse)

			> div
				background-color: var(--cm-secondary)

		ul
			position: relative
			z-index: 20
			margin: 0
			padding: 0
			display: flex
			flex-wrap: nowrap
			width: 100%
			align-items: center

			li
				position: relative
				margin: 0
				padding: .5rem 1rem
				list-style: none
				text-align: center
				color: var(--cm-primary-inverse)
				stroke: var(--cm-primary-inverse)
				transition: color var(--pico-transition)

				span
					position: relative
					z-index: 30
					display: block
					white-space: nowrap
					@include flex-row-middle(.5rem)

				div
					z-index: 40
					background-color: transparent
					@include absolute

			li:not(.active)
				color: var(--cm-text)
				stroke: var(--cm-text)
				cursor: pointer

		> div
			display: none
			z-index: 10
			height: 100%
			border-radius: 999px
			background-color: var(--cm-primary)
			transition: left var(--pico-transition), color var(--pico-transition)
			@include absolute

</style>