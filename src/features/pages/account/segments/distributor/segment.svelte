<script lang="ts">

	import AccountContainer from '../containers/account/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let company: any

</script>



<AccountContainer>

	<svelte:fragment slot="details">

		<span>{$company.name}</span>

	</svelte:fragment>

	<svelte:fragment slot="options">

		<li><Button modal="distributor-profile-update" data={{companyId:$company.id}} wrapper>Distributor Profile</Button></li>
		<li><Button modal="addresses" data={{companyId:$company.id, companyRole:'distributor'}} wrapper>Addresses</Button></li>
		<!-- <li><Button modal="locations" data={{companyId:$company.id}} wrapper>Locations and Hours</Button></li> -->
		<li><Button modal="password-reset" wrapper>Change Password</Button></li>
		<li><Button modal="terms" wrapper>Terms and Conditions</Button></li>

  </svelte:fragment>

</AccountContainer>
