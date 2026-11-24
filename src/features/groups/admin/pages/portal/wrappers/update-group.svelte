<script lang="ts"></script>



<div>
	
	<slot />
	
	<span style="display:contents"></span>
</div>



<style lang="sass">

	div
		width: 100%
		@include flex-row-middle-left(1rem)

	div :global(> div),
	div :global(> input)
		flex-grow: 1

	div :global(.checkbox-group)
		flex-wrap: wrap
		@include flex-row-middle-left(1rem)

	div	:global(> span)
		flex-grow: 0
		min-width: fit-content
		font-weight: bold

	div :global(> button)
		flex-grow: 0

</style>