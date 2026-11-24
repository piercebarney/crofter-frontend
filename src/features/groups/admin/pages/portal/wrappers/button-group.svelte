<script lang="ts"></script>



<div>

	<slot />

	<span style="display:contents"></span>
</div>



<style lang="sass">

	div
		@include flex-col-left(.5rem)


	@media (min-width: #{breakpoint('md')})

		div
			@include flex-row-middle-left(1rem)

</style>