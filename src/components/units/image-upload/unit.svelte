<script lang="ts">

	import { onDestroy } from 'svelte'
	import { imageUpload } from 'src/features/modules/image-upload/store'
	import { layout } from 'src/stores/layout'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Img from 'src/components/elements/img.svelte'
	import Button from 'src/components/elements/button.svelte'
	


	export let label: string|null = null

	// options
	export let application:	boolean	= false

	// function
	export let formElement: HTMLFormElement
	export let name:		string			= 'input'
	export let src:			string|null		= null
	export let changed:		boolean			= false

	let dropZoneElement:		HTMLDivElement,
		removeWrapperElement:	HTMLDivElement,
		counter:				number			= 0,
		iSrc:					string|null		= null

	const imageAdd = () => imageUpload.select(formElement, name)
	
	const dragEnter = () => {

		counter++

		if (application)	dropZoneElement.style.borderColor = '#468047'
		else 				dropZoneElement.style.borderColor = 'var(--cm-primary)'
	}

	const dragLeave = () => {

		counter--

		if (counter == 0) dropZoneElement.style.borderColor = 'var(--cm-form-border-color)'
	}

	const dragDrop = (e:DragEvent) => {

		e.preventDefault()

		imageUpload.drop(formElement, 'input', e)
		
		dropZoneElement.style.borderColor = 'var(--cm-form-border-color)'
	}

	const mouseEnter = () => {

		if (iSrc) removeWrapperElement.style.display = 'block'
	}

	const mouseLeave = () => {
	
		if (iSrc) removeWrapperElement.style.display = 'none'
	}

	const removeImage = () => {
		
		imageUpload.clear()

		if (src) src = null

		removeWrapperElement.style.display = 'none'

		changed = true
	}

	$: if	($imageUpload.src !== null)	iSrc = $imageUpload.src
	else if	(src !== null)				iSrc = src
	else								iSrc = null

	$: if ($imageUpload.status.success === true) changed = true

	$: width		= $layout.width
	$: isNotXSmall	= layout.compare(width, '>=', 'sm')

	onDestroy(() => imageUpload.clear())

</script>



<div class="image-upload-wrapper">
	<div role="region" class="image-drop-wrapper{application ? ' application' : ''}" bind:this={dropZoneElement} on:dragenter={dragEnter} on:dragleave={dragLeave} on:drop={dragDrop} on:dragover={(e) => e.preventDefault()} on:mouseenter={mouseEnter} on:mouseleave={mouseLeave}>

		{#if !iSrc}
		
			<div class="add-wrapper{isNotXSmall ? '' : ' x-small'}">

				{#if label}

					<span class="label">{label}</span>

				{/if}

				{#if isNotXSmall}
				
					<span class="text">Drag & Drop or</span>
					<button type="button" class="pill thin" on:click={imageAdd}><Icon name="plus" /> Add JPG or PNG</button>

				{:else}

					<button type="button" class="round" on:click={imageAdd}><Icon name="plus" /></button>
				
				{/if}
				
			</div>

		{/if}

		<div class="remove-wrapper{isNotXSmall ? '' : ' x-small'}" bind:this={removeWrapperElement}>

			<Button action={removeImage} round boarder {application}><Icon name="trash" size="2rem" /></Button>

		</div>

		{#if iSrc}

			<div class="image-wrapper">

				<Img src={iSrc} {application} />

			</div>

		{/if}
		
	</div>

	{#if $imageUpload.status.error}

		<span>{$imageUpload.status.error}</span>

	{/if}

</div>



<style lang="sass">

	.image-upload-wrapper

		.image-drop-wrapper
			position: relative
			width: 100%
			padding-bottom: 100%
			background-color: white
			border: 1px solid
			border-color: var(--cm-form-border-color)

			&.application
				overflow: hidden
				border-radius: var(--pico-border-radius)

			.add-wrapper
				z-index: 20
				padding: 1rem
				@include fill
				@include absolute-middle-center
				@include flex-col-middle-center(1rem)

				.label
					font-size: 1.5rem

				.text
					color: var(--cm-text-secondary)

				button
					max-width: max-content
					border: none
					color: var(--cm-text)
					stroke: var(--cm-text)
					font-size: 1rem
					font-weight: 400
					background-color: var(--cm-form-background)
					transition:	background-color var(--pico-transition)

					&:hover
						background-color: #EBEBEB

				&.x-small
					padding: .5rem
					
					.label
						font-size: 1rem

			.remove-wrapper
				display: none
				z-index: 20
				width: fit-content
				@include absolute-top-right(1rem)

				&.x-small
					@include absolute-middle-center

			.image-wrapper
				z-index: 10
				@include fill
				@include absolute-middle-center

		> span
			display: inline-block
			margin-top: 1rem
			color: var(--cm-danger)

</style>