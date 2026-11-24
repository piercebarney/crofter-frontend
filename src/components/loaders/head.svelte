<script lang="ts"></script>



<div class="loader-head">
	<div class="loading-placeholder"></div>
	<div>
		<div class="loading-placeholder"></div>
		<div class="loading-placeholder"></div>
	</div>
</div>



<style lang="sass">

	.loader-head		
		gap: .5rem
		@include flex-row-left

		> div:nth-child(1)			
			height: 3rem
			width: 3rem
			overflow: hidden
			background-color: var(--cm-background-color-alt)
			border-radius: 50%
			@include flex-row-middle-center

		> div:nth-child(2)
			flex-grow: 1			
			gap: .5rem
			@include flex-col

			div
				flex-grow: 1
				width: 100%
				border-radius: var(--cm-border-radius)

	@media (min-width: #{breakpoint('sm')})

		div
			gap: 1rem

			> div
				height: 4rem
				width: 4rem

	@media (min-width: #{breakpoint('md')})

		div

			> div
				height: 4.5rem
				width: 4.5rem

</style>