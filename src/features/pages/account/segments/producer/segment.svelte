<script lang="ts">

	import AccountContainer from '../containers/account/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let company: any

</script>



<AccountContainer>

	<svelte:fragment slot="details">

		<span>{$company.name}</span>

		{#if $company.addresses.length > 0}
	
			<span>{`${$company.addresses[0].city}, ${$company.addresses[0].state}`}</span>

		{/if}

	</svelte:fragment>

	<svelte:fragment slot="options">

		<li><Button modal="producer-profile-update" data={{companyId:$company.id}} wrapper>Seller Profile</Button></li>
		<li><Button modal="merchant-account" data={{companyId:$company.id}} wrapper>Merchant Account</Button></li>
		<li><Button modal="addresses" data={{companyId:$company.id, companyType:'producer', singular:true}} wrapper>Physical Address</Button></li>
		<li><Button modal="password-reset" wrapper>Change Password</Button></li>
		<li><Button modal="terms" wrapper>Terms and Conditions</Button></li>

	</svelte:fragment>

</AccountContainer>