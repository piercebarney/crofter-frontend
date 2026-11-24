<script lang="ts">

	export let dataFilter: string|undefined = undefined

</script>



<div class="card-wrapper" data-filter={dataFilter}>
	<div class="head">
			
		<slot name="head" />

		<span style="display:contents"></span>
	</div>
	<div class="body">

		{#if $$slots['body']}

			<slot name="body" />

		{:else if ($$slots['body-first'] || $$slots['body-second'])}

			<div>
				<div>

					<slot name="body-first" />

				</div>
				<div>

					<slot name="body-second" />

				</div>
			</div>

		{/if}

	</div>
	<div class="foot">
		
		<slot name="foot" />

		<span style="display:contents"></span>
	</div>
</div>



<style lang="sass">

	.card-wrapper
		overflow: hidden
		flex-shrink: 0
		border: 1px solid #ddd
		border-radius: .5rem

		.head
			padding: .5rem
			background: #ddd
			font-size: 1rem
			@include flex-col-left(.5rem)

		.head :global(.title)
			font-weight: bold

		.body
			padding: .5rem
			@include flex-col-top(.5rem)

			> div
				@include flex-col-top(.5rem)

				> div
					@include flex-col-top(.5rem)

		.foot
			padding: .5rem
			border-top: 1px solid #ddd
			@include flex-col-left(.5rem)


	@media (min-width: #{breakpoint('md')})

		.card-wrapper

			.head
				padding: 1rem
				font-size: 1.25rem
				@include flex-row-between(1rem)

			.body
				padding: 1rem
				gap: 1rem

				> div
					@include flex-row(1rem)

					> div
						flex: 1
						gap: 1rem

			.foot
				padding: 1rem
				@include flex-row-between(1rem)

</style>