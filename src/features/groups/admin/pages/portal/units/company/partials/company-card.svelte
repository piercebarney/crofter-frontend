<script lang="ts">

	import type { CompanyData, CompanyFetch, ProductFetchAll } from 'src/features/groups/admin/pages/portal/types'

	import { formatDateTime } from 'src/lib/helpers'
	import Card from 'src/features/groups/admin/pages/portal/wrappers/card.svelte'
	import DataSet from 'src/features/groups/admin/pages/portal/partials/data-set.svelte'



	export let companyData:				CompanyData
	export let companyFetch:	CompanyFetch
	export let lookup:			boolean						= false
	export let productFetchAll:	ProductFetchAll|undefined

	const productCount: number	= companyData.products.length
	const dataFilter			= [
			`zift:${companyData.ziftAccountId ? 1 : 0}`,
			`products:${productCount ? 1 : 0}`
		].join('|')

</script>

<Card {dataFilter}>

	<svelte:fragment slot="head">

		<span class="title">{companyData.name}</span>

		<DataSet label="Zift ID" value={companyData.ziftAccountId ?? 'empty'} />

	</svelte:fragment>

	<svelte:fragment slot="body-first">

		<DataSet label="Email" value={companyData.email} />

		<DataSet label="Email Verified" value={companyData.emailVerified ? 'Yes' : 'No'} />

		<DataSet label="Phone" value={companyData.phoneNumber ?? 'empty'} />

		<DataSet label="Location" value={companyData.addresses.length > 0 ? `${companyData.addresses[0].city}, ${companyData.addresses[0].state}` : 'empty'} />

	</svelte:fragment>

	<svelte:fragment slot="body-second">

		<DataSet label="Role" value={companyData.role ?? 'PRODUCER'} />

		<DataSet label="Application" value={companyData.merchantApplicationDetails?.status ?? 'empty'} />

		{#if productCount}

			<DataSet label="Products"><button role="link" on:click={() => productFetchAll?.('id', companyData.id)}>{productCount}</button></DataSet>

		{:else}

			<DataSet label="Products" value="empty" />

		{/if}

	</svelte:fragment>

	<svelte:fragment slot="foot">
	
		{#if lookup}

			<span>{companyData.id}</span>
		
		{:else}

			<button role="link" on:click={() => companyFetch({id:companyData.id})}>{companyData.id}</button>
		
		{/if}

		<DataSet label="Created" value={formatDateTime(companyData.insertedAt, {time:false})} />
		
	</svelte:fragment>

</Card>