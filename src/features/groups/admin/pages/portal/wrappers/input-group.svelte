<script lang="ts"></script>



<div>
	
	<slot />
	
	<span style="display:contents"></span>
</div>



<style lang="sass">

	div
		width: 100%
		flex-wrap: wrap
		@include flex-row-between(.5rem)

	div :global(input)
		flex-grow: 1

	div	:global(span)
		flex-grow: 0
		width: 3.5rem
		min-width: 3.5rem
		font-weight: bold

	div :global(button)
		flex-grow: 0


	@media (min-width: #{breakpoint('md')})

		div
			flex-wrap: nowrap
			@include flex-row-middle(1rem)

</style>