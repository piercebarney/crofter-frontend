<script lang="ts">

	import Pannel from 'src/components/wrappers/pannel-context/pannel.svelte'



	export let gap: string|undefined = undefined

	let element: HTMLDivElement

	$: if (gap != undefined && element) element.style.gap = gap

</script>




	<div class="wrapper" bind:this={element}>
		<div>

			<Pannel>

				<slot />
			
			</Pannel>

		</div>
		<div class="context">

			{#if $$slots.context}

				<Pannel>

					<slot name="context" />

				</Pannel>

			{/if}
		
		</div>
	</div>



<style lang="sass">

	.wrapper
		@include flex-row-top

		.context
			flex-grow: 0
			min-width: 20rem

</style>