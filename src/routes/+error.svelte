<script lang="ts">
	
	import CenteredLayout from 'src/components/layouts/centered.svelte'
	import A from 'src/components/elements/a.svelte'

</script>


<div class="pico-scope" style="display:contents">

	<CenteredLayout>

		<div class="error">
			<span>404 - Page Not Found</span>

			<A route="default">Go Home</A>
			
		</div>

	</CenteredLayout>

</div>



<style lang="sass">

	div
		@include flex-col-center(3rem)

		span
			font-size: 3rem

</style>