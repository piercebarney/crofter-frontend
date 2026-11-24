<script lang="ts">

	import { layout } from 'src/stores/layout'
	import Icon from 'src/components/elements/icon/element.svelte'
	import { afterUpdate, onDestroy } from 'svelte'



	export let optionName: string|null	= null
	export let bannerHeight: number		= 0

	let bannerElement: HTMLDivElement|null = null
	let measureTimeout: ReturnType<typeof setTimeout>|null = null
	let measureRequested: boolean = false
	let measureKey: string = ''
	let lastMeasureKey: string = ''

	// $: isMobile		= $layout.isMobile
	$: layoutSize	= $layout.size
	$: mainHeight	= $layout.header.mainHeight
	$: measureKey = `${layoutSize}:${mainHeight}:${optionName}`

	$: if (measureKey !== lastMeasureKey) {

		lastMeasureKey = measureKey
		measureRequested = true
	}

	afterUpdate(() => {

		if (!measureRequested) return

		measureRequested = false

		if (measureTimeout) clearTimeout(measureTimeout)

		measureTimeout = setTimeout(() => {

			if (bannerElement) {

				bannerElement.style.opacity = '1'

				const nextHeight = bannerElement.offsetHeight

				if (bannerHeight !== nextHeight) bannerHeight = nextHeight
			}
		}, 100)
	})

	onDestroy(() => {
		if (measureTimeout) clearTimeout(measureTimeout)
	})

</script>



<div class="banner-wrapper">
	<div bind:this={bannerElement}>
		<div class="container">
			<div class="left">
				<span class="title">BRINGING THE FARM TO YOU</span>
				<span class="subtitle">A curated online marketplace for premium food from local farms</span>
			</div>
			<div class="right">

				{#if optionName == 'delivery'}

					<div>
						<div>

							<Icon name="clockwise" size="100%" />

						</div>
						<span>Check product<br />ready lead time</span>
					</div>
					<div>
						<div>

							<Icon name="basket" size="100%" />

						</div>
						<span>Place your<br />order</span>
					</div>
					<div>
						<div>

							<Icon name="bell" size="100%" />

						</div>
						<span>Get notified<br />when it's shipped</span>
					</div>

				{:else}

					<div>
						<div>

							<Icon name="mapPin" size="100%" />

						</div>
						<span>Select a pickup<br />location</span>
					</div>
					<div>
						<div>

							<Icon name="basket" size="100%" />

						</div>
						<span>Place your<br />order</span>
					</div>
					<div>
						<div>

							<Icon name="bell" size="100%" />

						</div>
						<span>Get notified<br />when it's ready</span>
					</div>

				{/if}
				
			</div>
		</div>
	</div>
</div>



<style lang="sass">

	.banner-wrapper
		z-index: 10
		width: 100%
		padding-bottom: .5rem
		background-color: var(--cm-background)

		> div
			opacity: 0
			padding-top: 1rem
			padding-bottom: .5rem

			.container
				@include flex-row-middle

				.left
					display: none

				.right
					min-width: max-content
					justify-content: space-around
					@include flex-row-middle(.5rem)

					> div
						@include flex-col-center(.5rem)

						> div
							color: var(--cm-primary)
							@include area(2rem)

						> span
							font-size: .8rem
							text-align: center
							line-height: 1.2

	@media (min-width: #{breakpoint('xs')})

		.banner-wrapper

			> div

				.container

					.right

						> div

							> div
								@include area(3rem)

							> span
								font-size: 1rem


	@media (min-width: #{breakpoint('md')})

		.banner-wrapper

			> div
				background-color: var(--cm-primary)
				padding-top: 0
				padding-bottom: 0
				color: var(--cm-primary-inverse)

				.container
					padding-top: 2rem
					padding-bottom: 2rem
					@include flex-row-middle-between(4rem)

					.left
						display: block

						> span
							display: block

						span:first-child
							margin-bottom: .5rem
							font-size: 1.6rem
							font-weight: 600

					.right
						gap: 2rem

						> div

							> div
								color: var(--cm-primary-inverse)
								@include area(4rem)

							> span
								font-size: 1rem


	@media (min-width: #{breakpoint('lg')})

		.banner-wrapper

			> div

				.container

					.left
						
						span:first-child
							font-size: 1.8rem

						span:last-child
							font-size: 1.2rem

					.right
						gap: 3rem


	@media (min-width: #{breakpoint('xl')})

		.banner-wrapper

			> div

				.container

					.right
						gap: 4rem

</style>