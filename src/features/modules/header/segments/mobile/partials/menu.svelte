<script lang="ts">

	import { layout } from 'src/stores/layout'
	import A from 'src/components/elements/a.svelte'



	// data
	export let wrapperMargin:	number = 0

	let wrapperElement:			HTMLElement,
		wrapperElementMargin:	number			= 0

	$: layoutSize	= $layout.size

	$: if (wrapperElement && (0 <= wrapperMargin || layoutSize)) {

		wrapperElement.removeAttribute('style')

		wrapperElementMargin = parseInt(getComputedStyle(wrapperElement).marginTop.replace('px', ''))

		wrapperElement.style.marginTop = `${wrapperElementMargin + wrapperMargin}px`
	}

</script>



{#if $layout.overlay == 'nav'}

	<div role="menu" tabindex="0" class="wrapper" on:mouseleave={layout.closeMenu} bind:this={wrapperElement}>
		<ul>
			<li>

				<A route="distributor-products" action={layout.closeMenu} c="nav-menu-link-wrapper" wrapper>
					
					<span>Products</span>
				
				</A>

			</li>
			<li>

				<A route="distributor-stock" action={layout.closeMenu} c="nav-menu-link-wrapper" wrapper>
					
					<span>Stock</span>
				
				</A>

			</li>
			<li>

				<A route="distributor-orders" action={layout.closeMenu} c="nav-menu-link-wrapper" wrapper>
					
					<span>Fulfillment</span>
				
				</A>

			</li>
		</ul>
	</div>

{/if}



<style lang="sass">

	:global(.nav-menu-link-wrapper)
		@include flex-row-middle-left

		span
			padding: .5rem 1.5rem//padding: 1.5rem 3rem


	.wrapper
		position: absolute
		z-index: 10
		top: calc(100% + var(--cm-nav-padding-vertical))
		border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius)
		background-color: var(--cm-utility-background)
		box-shadow: var(--cm-box-shadow)
		color: var(--cm-text)
		cursor: default

		ul
			margin: 0
			padding: .5rem 0

			li
				margin: 0
				list-style-type: none

			li:hover
				background-color: var(--cm-utility-highlight)
				cursor: pointer

</style>