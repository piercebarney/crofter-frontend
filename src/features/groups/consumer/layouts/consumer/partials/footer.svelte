<script lang="ts">

	import { systemSettings as sS } from 'src/stores/systemSettings'
	import { layout as l } from 'src/stores/layout'
	import A from "src/components/elements/a.svelte"

	$: isMobile	= $l.isMobile
	$: isTablet	= $l.isTablet

</script>



{#if sS.val('component.footer')}

	<div class="footer-wrapper">
		<div class="content">
			<div class="text">
				<span class="title">BRINGING THE FARM TO YOU</span>
				<span class="subtitle">A curated online marketplace for premium food from local farms</span>
			</div>
			<div class="buttons">
				<div><A href="https://about.crofter.com" role="button" target="_blank" secondary thin={isMobile || isTablet} smaller={isMobile}>About Us</A></div>
				<div><A href="https://about.crofter.com/farmers-market-vendor-application/" role="button" target="_blank" thin={isMobile || isTablet} smaller={isMobile}>Sell on Crofter</A></div>
			</div>
		</div>
		<div class="video">
			<div class="video-container" class:placeholder={!sS.val('component.footerVideo')}>

				{#if sS.val('component.footerVideo')}

					<iframe
						width="100%"
						height="100%"
						src="https://www.youtube.com/embed/4Mu46RHndvc?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowfullscreen
					></iframe>

				{:else}

					<span>VIDEO</span>

				{/if}

			</div>
		</div>
	</div>

{/if}


<style lang="sass">

	.footer-wrapper
		padding: 1rem 0
		@include flex-col-between(1.5rem)

		.content
			@include flex-col-middle-left(1.5rem)

			.text
				@include flex-col-left(.5rem)

				span:first-child
					font-size: 1.4rem
					font-weight: 600

				span:last-child
					font-size: 1.1rem
					font-weight: 400

			.buttons
				@include flex-row-middle(1rem)

		.video
			margin: 0 auto
			width: 100%
			max-width: 560px
			overflow: hidden
			border-radius: var(--pico-border-radius)

			.video-container
				position: relative
				width: 100%
				background-color: var(--cm-primary)
				padding-bottom: 56.25% /* 16:9 aspect ratio */
				height: 0

				&.placeholder > span
					@include absolute-middle-center

				iframe
					position: absolute
					top: 0
					left: 0
					width: 100%
					height: 100%

	@media (min-width: #{breakpoint('md')})

		.footer-wrapper
			@include flex-row-between(4rem)

			.content
				flex: 6
				gap: 2rem

				.text

					span:first-child
						font-size: 2rem

					span:last-child
						font-size: 1.2rem

			.video
				flex: 4
				max-width: unset

</style>