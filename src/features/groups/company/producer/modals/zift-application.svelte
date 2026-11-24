<script lang="ts">

	import { PUBLIC_ZIFT_APPLY, PUBLIC_ZIFT_APPLY_SP } from '$env/static/public'
	import Container from 'src/features/modules/modal/container.svelte'
	import A from 'src/components/elements/a.svelte'



	export let modal: any

	const data = $modal.data

</script>



<Container label="Merchant Account Application" closeButtonText="Cancel" {modal}>

	<div>
	
		<A href="{PUBLIC_ZIFT_APPLY}{data.companyId}" target="_blank" action={() => modal.close()} button>Apply as a State Registered Business</A>


		<A href="{PUBLIC_ZIFT_APPLY_SP}{data.companyId}" target="_blank" action={() => modal.close()} button>Apply as an Individual</A>

		<span style="display:contents"></span>
	</div>

</Container>



<style lang="sass">

	div		
		width: fit-content
		margin: 0 auto
		@include flex-col(1rem)

</style>