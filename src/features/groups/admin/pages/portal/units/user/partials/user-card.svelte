<script lang="ts">

	import type { UserData } from 'src/features/groups/admin/pages/portal/types'

	import { formatDateTime } from 'src/lib/helpers'
	import { impersonation } from 'src/stores/impersonation'
	import Card from 'src/features/groups/admin/pages/portal/wrappers/card.svelte'
	import DataSet from 'src/features/groups/admin/pages/portal/partials/data-set.svelte'



	export let user:			UserData
	// export let companyFetch:	CompanyFetch|undefined

	const handleImpersonate = async () => {
		// Start impersonation locally
		impersonation.startImpersonation(user.id, user.email)
		
		// Wait a moment to ensure cookies are set
		await new Promise(resolve => setTimeout(resolve, 100))
		
		// Redirect to home page - all API calls will now include the impersonation header
		window.location.href = '/'
	}

</script>

<Card>

	<svelte:fragment slot="head">

		<span class="head-title">{`${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`}</span>

		<DataSet label="Phone" value={user.phoneNumber ?? 'empty'} />

		<button class="impersonate-btn" on:click={handleImpersonate}>Impersonate</button>

	</svelte:fragment>

	<div slot="body">
		<div class="columns">
			<div class="column">

				<DataSet label="Email" value={user.email} />

				<DataSet label="Email Verified" value={user.emailVerified ? 'Yes' : 'No'} />

				<DataSet label="Location" value={user.defaultAddress ? `${user.defaultAddress.city}, ${user.defaultAddress.state}` : 'empty'} />

				<DataSet label="Zip Code" value={user.zipCode ?? 'empty'} />

			</div>
			<div class="column">

				<DataSet label="Role" value={user.role ?? 'USER'} />

				<!-- <DataSet label="Company" value={user.companies.length > 0 ? `${user.companies[0].name}` : 'empty'} />

				{#if user.companies.length > 0}

					<DataSet label="Company ID"><button role="link" class="company-link" on:click={() => companyFetch({id:user.companies[0].id})}>{user.companies[0].id}</button></DataSet>

				{/if} -->

			</div>
		</div>
	</div>

	<svelte:fragment slot="foot">
	
		<span>{user.id}</span>

		<DataSet label="Created" value={formatDateTime(user.insertedAt, {time:false})} />
		
	</svelte:fragment>

</Card>



<style lang="sass">

	.head-title
		font-weight: bold

	.columns
		@include flex-row(1rem)

		.column
			flex: 1
			@include flex-col-top(1rem)

	.impersonate-btn
		margin-left: auto
		padding: 0.5rem 1rem
		background-color: var(--contrast)
		color: var(--contrast-inverse)
		border: none
		border-radius: 4px
		cursor: pointer
		font-size: 0.875rem
		font-weight: 500

		&:hover
			opacity: 0.8

	// .company-link
	// 	text-align: left
		
</style>