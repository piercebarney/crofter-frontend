<script lang="ts">

	import type { CompanyObject, CompanyData, ProductFetchAll } from 'src/features/groups/admin/pages/portal/types'

	import SectionContent from 'src/features/groups/admin/pages/portal/wrappers/section-content.svelte'
	import ButtonGroup from 'src/features/groups/admin/pages/portal/wrappers/button-group.svelte'
	import FilterGroup from 'src/features/groups/admin/pages/portal/wrappers/filter-group.svelte'
	import Count from 'src/features/groups/admin/pages/portal/partials/count.svelte'
	import CompanyCards	from 'src/features/groups/admin/pages/portal/units/company/partials/company-cards.svelte'



	export let company:			CompanyObject
	export let companiesData:	CompanyData[]|null
	export let active:			boolean				= false
	export let productFetchAll:	ProductFetchAll|undefined

</script>



<SectionContent section="company" name="all" {active}>

	<ButtonGroup slot="controls">

		<button on:click={company.fetchAll}>Fetch Data</button>

		<FilterGroup>

			<span>filter by:</span>
			<button role="link" class={company.filterByZift ? 'active' : undefined} on:click={() => company.filter('zift')} title="only show companies without a zift id" disabled={!companiesData}>no zift id</button>
			<!-- <span>|</span>
			<button role="link" on:click={() => company.filter.vars.application = true}>application</button> -->
			<span>|</span>
			<button role="link" class={company.filterByProducts ? 'active' : undefined} on:click={() => company.filter('products')} title="only show companies with products" disabled={!companiesData}>has products</button>
		
		</FilterGroup>

	</ButtonGroup>

	<Count data={companiesData} filteredCount={company.filteredCount} slot="count" />
	
	{#if companiesData}

		<CompanyCards {companiesData} companyFetch={company.fetch} {productFetchAll}/>

	{/if}

</SectionContent>