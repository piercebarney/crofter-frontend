<script lang="ts">

	import { lazyLoad, imageLoad } from 'src/components/helpers'
	import { classes } from 'src/lib/helpers'



	// attributes
	export let src:	string|null
	export let alt:	string|undefined	= undefined
	export let c:	string|undefined	= undefined

	// options
	export let lazy:		boolean				= false
	export let border:		string|undefined	= undefined
	export let round:		string|undefined	= undefined
	export let square:		string|undefined	= undefined
	export let rounded:		boolean				= false
	export let application:	boolean				= false

	const style:		string|undefined	= undefined

	let divElement:	HTMLDivElement,
		loading:	boolean				= true,
		imgC:		string|undefined	= undefined,
		imgStyle:	string|undefined	= undefined,
		count:		number				= 0,
		load:		boolean				= false

	const loadTimer = setInterval(() => {

		if (count > 4) imgC = 'fade-in'
		
		count++
	
	}, 50)

	$: if (border && divElement) {

		divElement.style.border = `1px solid ${border}`

	}

	$: if (round && divElement) {

		round = round.replaceAll(' ', '')

		const value	= round.match(/[0-9.]+/g),
			unit	= round.match(/[a-zA-Z]+/g),
			radius	= value && unit ? `${parseFloat(value[0]) / 2}${unit[0]}` : ''

		divElement.style.minHeight		= round
		divElement.style.height			= round
		divElement.style.minWidth		= round
		divElement.style.width			= round
		divElement.style.borderRadius	= radius
	}

	$: if (square && divElement) {

		divElement.style.minHeight	= square
		divElement.style.height		= square
		divElement.style.minWidth	= square
		divElement.style.width		= square
	}

	$: if (rounded && divElement) {

		divElement.style.borderRadius = 'var(--pico-border-radius)'
	}

	$: if (!loading) {

		clearInterval(loadTimer)

		imgStyle = 'opacity: 1'
	}

	$: _ = classes(c, {application})

</script>



{#if src && lazy}

	<div class={_} aria-busy={loading} {style} bind:this={divElement} use:lazyLoad on:isVisible={() => (load = true)}>
		<img src={load ? src : undefined} class={imgC} {alt} style={imgStyle} use:imageLoad on:imageLoaded={() => (loading = false)} />
	</div>

{:else if src}

	<div class={_} aria-busy={loading} bind:this={divElement}>
		<img {src} class={imgC} {alt} style={imgStyle} use:imageLoad on:imageLoaded={() => (loading = false)} />
	</div>

{:else}

	<div></div>

{/if}



<style lang="sass">

	div
		overflow: hidden
		background-color: var(--cm-background-secondary)
		@include fill

		&.application
			background-color: #FBF9F6

		&[aria-busy=true]
			cursor: pointer
			@include flex-row-middle-center

			&::before
				position: absolute
				margin: 0

		img
			aspect-ratio: 16 / 9
			object-fit: cover
			@include fill

			&.fade-in
				opacity: 0
				transition: opacity .5s ease-in

</style>