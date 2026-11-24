<script lang="ts"></script>



<div>
	
	<slot />
	
	<span style="display:contents"></span>
</div>



<style lang="sass">

	div
		border-top: 1px solid #ddd
		padding: .5rem
		@include flex-col(.5rem)


	@media (min-width: #{breakpoint('md')})

		div
			padding: 1rem
			gap: 1rem

</style>