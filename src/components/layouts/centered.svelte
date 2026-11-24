<script lang="ts">

	import Brand from 'src/components/elements/brand.svelte'

</script>



<div class="main-wrapper">
	<div class="container">
		<main>
			<div class="brand-wrapper">
			
				<Brand />

			</div>
			<div class="slot-wrapper">
			
				<slot />

				<span style="display:contents"></span>
			</div>
		</main>
	</div>
</div>

<slot name="modal" />



<style lang="sass">
	
	.main-wrapper
		flex-grow: 1		
		overflow: auto
		background: var(--cm-auth-background-gradiant)
		@include fill
		@include flex-col

		.container
			@include flex-col-middle-center

			main			
				margin: 4rem 0
				width: 100%
				max-width: #{viewport('sm')}
				@include flex-col-center(6rem)

				.brand-wrapper
					width: 80%

				.slot-wrapper					
					width: 100%
					color: var(--cm-auth-text)
					@include flex-col-center(2rem)
				
</style>