<script lang="ts">

	export let index: number
	export let order: number
	export let action: (()=>void)|null		= null
	export let formSubmit: (()=>any)|null	= null
	void action, formSubmit // suppress unused warning - WIP component



	// let forward: (()=>void)|null = () => index++

	// $:	 if	(formSubmit)	forward = null
	// else if	(action)		forward = action

</script>



{#if index == order}

	<div class="checkout-panel">

		<slot />

		<span style="display:contents"></span>
	</div>

{/if}



<style lang="sass">

	.checkout-panel
		margin: 0 auto
		max-width: #{breakpoint('sm')}
		@include fill
		@include flex-col(4rem)
			
</style>