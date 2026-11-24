<script lang="ts">

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'



	const action = (fulfillment:string|null) => {
		
		search.set({fulfillment})
		layout.closeMenu()
	}

</script>




{#if $layout.overlay == 'fulfillment'}

	<div role="menu" tabindex="0" class="wrapper" on:mouseleave={layout.closeMenu}>
		<ul>
			<li role="menuitem" on:click={() => action(null)} on:keypress={() => action(null)}>Pickup & Delivery</li>
			<li role="menuitem" on:click={() => action('pickup')} on:keypress={() => action('pickup')}>Pickup Only</li>
			<li role="menuitem" on:click={() => action('delivery')} on:keypress={() => action('delivery')}>Delivery Only</li>
		</ul>
	</div>

	<div role="presentation" class="fulfillment-overlay" on:click={layout.closeMenu} on:keypress={layout.closeMenu}></div>

{/if}



<style lang="sass">

	.wrapper
		position: absolute
		z-index: 100
		top: calc(100% + 2rem)
		right: 0
		height: fit-content
		width: max-content
		border: none !important
		border-radius: var(--pico-border-radius) var(--pico-border-radius)
		background-color: var(--cm-utility-background)
		box-shadow: var(--cm-box-shadow)
		color: var(--cm-text)
		cursor: default

		ul
			margin: 0
			padding: .25rem 0

			li				
				margin: 0
				padding: .25rem 1rem
				list-style-type: none
				@include flex-row-left(.75rem)

			li:hover
				background-color: var(--cm-utility-highlight)
				cursor: pointer

	.fulfillment-overlay
		position: fixed
		z-index: 30		
		background-color: var(--pico-modal-overlay-background-color)
		@include inset

</style>