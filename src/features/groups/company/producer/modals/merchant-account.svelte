<script lang="ts">

	import { PUBLIC_ZIFT_DROP } from '$env/static/public'
	import { company as c } from 'src/stores/company/store'
	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'

	

	export let modal: any

	const company = c.get($modal.data.companyId)

</script>



<Container label="Merchant Account" closeButtonText="Cancel" {modal}>

	{#if $company.ziftAccountId}

		<span>Merchant ID: {$company.ziftAccountId}</span>
		<div>
			
			<A href={PUBLIC_ZIFT_DROP} target="_blank" action={() => modal.close()} button>Update Banking Info</A>

		</div>

	{:else}

		<p>You must apply for a merchant account with our payment processor before can receive payments. Though you are able to create products as of now, they will not be visible to users until your application is accepted.</p>
		<p>Applications are usually accepted within 1-2 business days. If there are any questions about your application, our payment processor's underwriting team will reach out to you for clarification.</p>
		<div>
			
			<Button action={() => modal.open('zift-application', {companyId:$company.id})}>Merchant Account Application</Button>

		</div>

	{/if}
	
</Container>



<style lang="sass">

	div
		width: fit-content
		margin: 0 auto

</style>