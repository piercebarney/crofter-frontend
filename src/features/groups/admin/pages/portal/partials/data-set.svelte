<script lang="ts">

	export let label: string
	export let value: string|undefined = undefined

</script>



<div class="data-set">
	<span>{label}</span>
	
	{#if value}

		<span class={value == 'empty' ? 'empty' : ''}>{value}</span>

	{:else}

		<span>
			
			<slot />
		
		</span>

	{/if}

</div>



<style lang="sass">

	.data-set
		@include flex-row-top-left(.5rem)
		
		span
			display: inline-block

		span:first-child
			min-width: max-content
			font-weight: bold

		span:last-child
			flex-grow: 0

		span.empty
			color: #666
			font-style: italic

</style>