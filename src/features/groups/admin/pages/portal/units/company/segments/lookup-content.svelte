<script lang="ts">

	import type { CompanyObject, CompanyData, ProductFetchAll } from 'src/features/groups/admin/pages/portal/types'

	// import { api } from 'src/lib/api'
	import SectionContent from 'src/features/groups/admin/pages/portal/wrappers/section-content.svelte'
	import InputGroup from 'src/features/groups/admin/pages/portal/wrappers/input-group.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/wrappers/lookup.svelte'
	import CompanyCard from 'src/features/groups/admin/pages/portal/units/company/partials/company-card.svelte'
	import UpdateGroup from 'src/features/groups/admin/pages/portal/wrappers/update-group.svelte'
	import Select from 'src/components/elements/select.svelte'



	export let company:			CompanyObject
	export let companyData:		CompanyData|null
	export let active:			boolean						= false
	export let productFetchAll:	ProductFetchAll|undefined

	// const companyResendEmailVerification = async () => {

	// 	const { success } = await api.companyResendEmailVerification({variables:{companyId:companyData?.id}})

	// 	if	(success)	alert('Email verification email sent')
	// 	else			alert('Failed to send email verification email')

	// }

</script>



<SectionContent section="company" name="lookup" active={active}>

	<InputGroup slot="controls">

		<input type="text" placeholder="Search" bind:value={company.searchTerm} />
		<button on:click={() => company.search('id')} disabled={company.searchTerm == ''}>by ID</button>
		<button on:click={() => company.search('email')} disabled={company.searchTerm == ''}>by Email</button>
		<button on:click={() => company.search('phoneNumber')} disabled={company.searchTerm == ''}>by Phone</button>
		<button on:click={() => company.search('clear')} disabled={companyData == null && company.searchTerm == ''}>Clear</button>

	</InputGroup>
	
	{#if companyData}

		<Lookup>

			<CompanyCard {companyData} companyFetch={company.fetch} lookup {productFetchAll} />

			<UpdateGroup>

				<span>Role</span>
				
				<Select list="company-roles" bind:value={companyData.role} on:change={() => company.updateRoleChanged = true} />

				<button on:click={() => company.update('role')} disabled={!company.updateRoleChanged}>Update</button>
			
			</UpdateGroup>

			<UpdateGroup>

				<span>Zift Id</span>
				<input type="text" bind:value={companyData.ziftAccountId} placeholder="Zift Id" on:keyup={() => company.updateZiftIdChanged = true} />
				<button on:click={() => company.update('ziftId')} disabled={!company.updateZiftIdChanged}>Update</button>
			
			</UpdateGroup>

			<UpdateGroup>

				<span>Product</span>
				<input type="text" bind:value={company.updateProductValue} placeholder="Product Title" on:keyup={() => company.updateProductChanged = true} />
				<button on:click={() => company.update('product')} disabled={!company.updateProductChanged}>Add</button>

			</UpdateGroup>

			<!-- {#if companyData.emailVerified === false}

				<div class="input-button-group">
					<button on:click={() => companyResendEmailVerification()}>Resend Email Verification</button>
				</div>

			{/if} -->

		</Lookup>

	{/if}

</SectionContent>