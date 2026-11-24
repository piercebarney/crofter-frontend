<script lang="ts">

	import type { Company } from 'src/types/company'

	import { user } from 'src/stores/user'
	import { layout } from 'src/stores/layout'
	import AccountContainer from '../containers/account/container.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'



	let fullName: string | null = null

	const action = () => layout.set({overlay:$layout.overlay != 'register' ? 'register' : null})

	$: hasNoProducerAccount = $user.companies.length == 0 || $user.companies.every((c:Company) => c.role != 'PRODUCER')
	$: hasNoMerchantAccount = $user.companies.length == 0 || $user.companies.every((c:Company) => c.ziftAccountId == null)

	$: $user.firstName, $user.lastname, (() => fullName = user.fullName())()

</script>



<AccountContainer>

	<svelte:fragment slot="details">

		{#if fullName}

			<span>{fullName}</span>

		{/if}

		<span>{$user.email}</span>

	</svelte:fragment>

	<svelte:fragment slot="options">

		<li><Button modal="profile-update" wrapper>User Profile</Button></li>
		<li><Button modal="payment-info" wrapper>Payment Info</Button></li>
		<li><Button modal="addresses" wrapper>Addresses</Button></li>
		<li><Button modal="password-reset" wrapper>Change Password</Button></li>
		<li><Button modal="terms" wrapper>Terms and Conditions</Button></li>

		{#if hasNoProducerAccount}

			<li><Button {action} wrapper>Sell on Crofter Market</Button></li>

		{:else if hasNoMerchantAccount}

			<li><A route="application" wrapper>Sell on Crofter Market</A></li>

		{/if}

	</svelte:fragment>

</AccountContainer>