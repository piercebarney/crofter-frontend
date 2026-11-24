<script lang="ts">

	import { goto } from '$app/navigation'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { layout } from 'src/stores/layout'
	import { routes } from 'src/lists/routes'
	import CustomerSegment from './segments/consumer/segment.svelte'
	import ProducerSegment from './segments/producer/segment.svelte'
	import DistributorSegment from './segments/distributor/segment.svelte'
	import Account from 'src/features/groups/auth/pages/register/partials/account.svelte'



	let company: any = null

	$: accountType	= $account.active.type
	$: isCompany	= $account.active.isCompany

	$: if ($c.companies.length > 0 && isCompany)	company = c.get($account.active.id)
	else											company = null

	$: if (company && accountType == 'producer' && $company.ziftAccountId == null) goto(routes.pathname('application'))

</script>



<div class="wrapper container">

	{#if accountType == 'consumer'}

		<CustomerSegment />

	{:else if company}

		{#if accountType == 'producer'}

			<ProducerSegment {company} />

		{:else if accountType == 'distributor'}

			<DistributorSegment {company} />

		{/if}

	{/if}

	<span style="display:contents"></span>
</div>

{#if $layout.overlay == 'register'}

	<div role="button" tabindex="0" class="register" on:click|self={layout.closeMenu} on:keypress|self={layout.closeMenu}>

		<Account closeButton />

	</div>

{/if}



<style lang="sass">

	.wrapper
		position: relative
		padding-top: 2rem
		@include flex-col-left(2rem)

	.register
		position: fixed !important
		z-index: 900
		overflow: auto
		background-color: #FBF9F7
		@include fill
		@include absolute

</style>