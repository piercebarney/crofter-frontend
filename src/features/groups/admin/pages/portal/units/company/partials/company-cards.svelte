<script lang="ts">

	import type { CompanyData, CompanyFetch, ProductFetchAll } from 'src/features/groups/admin/pages/portal/types'

	import Cards from 'src/features/groups/admin/pages/portal/wrappers/cards.svelte'
	import CompanyCard from 'src/features/groups/admin/pages/portal/units/company/partials/company-card.svelte'



	export let companiesData:	CompanyData[]|null
	export let companyFetch:	CompanyFetch
	export let productFetchAll:	ProductFetchAll|undefined

</script>

<Cards>

	{#if companiesData}

		{#each companiesData as companyData (companyData)}

			<CompanyCard {companyData} {companyFetch} {productFetchAll} />

		{/each}

	{/if}

</Cards>