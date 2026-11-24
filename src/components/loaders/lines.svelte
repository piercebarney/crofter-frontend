<script lang="ts">

	export let count:number = 6

</script>



{#each Array(count) as _, i (i)}

	<div class="loading-placeholder"></div>

{/each}



<style lang="sass">

	div
		width: 100%
		height: 4rem

</style>