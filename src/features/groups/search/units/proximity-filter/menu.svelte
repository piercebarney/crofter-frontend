<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { search } from 'src/features/groups/search/store'



	const action = (proximity:number|null) => {
		
		search.set({proximity})
		
		layout.closeMenu()
	}

</script>



{#if $layout.overlay == 'proximity'}

	<div role="menu" tabindex="0" class="menu-wrapper" on:mouseleave={layout.closeMenu}>
		<ul>
			<li role="menuitem" on:click={() => action(10)} on:keypress={() => action(10)}>10 miles</li>
			<li role="menuitem" on:click={() => action(20)} on:keypress={() => action(20)}>20 miles</li>
			<li role="menuitem" on:click={() => action(30)} on:keypress={() => action(30)}>30 miles</li>
			<li role="menuitem" on:click={() => action(40)} on:keypress={() => action(40)}>40 miles</li>
			<li role="menuitem" on:click={() => action(50)} on:keypress={() => action(50)}>50 miles</li>
			<li role="menuitem" on:click={() => action(null)} on:keypress={() => action(null)}>Any Distance</li>
		</ul>
	</div>

{/if}



<style lang="sass">

	.menu-wrapper
		position: absolute
		z-index: 10
		top: calc(100% + var(--cm-nav-padding-vertical))
		right: 0
		height: fit-content
		width: max-content
		border: none !important
		border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius)
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

</style>