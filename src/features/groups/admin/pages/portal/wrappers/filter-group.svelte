<script lang="ts"></script>



<div>
	
	<slot />

	<span style="display:contents"></span>
</div>



<style lang="sass">

	div
		@include flex-row-middle(.5rem)

	div :global(span)
		min-width: fit-content
		
</style>