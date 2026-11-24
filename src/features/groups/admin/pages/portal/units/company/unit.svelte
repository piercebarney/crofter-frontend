<script lang="ts">

	import type { Keys, Sections, Objects, CompanyTabKeys, CompanyTabs, CompanyObject, CompanyData, CompanyFetchVariables, MessageOptions } from 'src/features/groups/admin/pages/portal/types'

	import { api } from 'src/lib/api'
	import Section from 'src/features/groups/admin/pages/portal/wrappers/section.svelte'
	import Tab from 'src/features/groups/admin/pages/portal/partials/section-tab.svelte'
	import All from 'src/features/groups/admin/pages/portal/units/company/segments/all-content.svelte'
	import Lookup from 'src/features/groups/admin/pages/portal/units/company/segments/lookup-content.svelte'



	export let key:			Keys
	export let title:		string
	export let sections:	Sections
	export let objects:		Objects
	
	const tabs: CompanyTabs = { company:'all', product:'lookup', user:'lookup' }

	let companyAllData:		CompanyData[]|null											= null,
		companyLookupData:	CompanyData|null											= null,
		tabSelector: 		(sectionName:Keys, tabName:CompanyTabKeys) => void,
		messageUpdate: 		(id:string, options:MessageOptions) => void

	const company: CompanyObject = {
		filteredCount		: 0,
		filterByZift		: false,
		filterByProducts	: false,
		searchTerm			: '',
		updateRoleValue		: '',
		updateProductValue	: '',
		updateRoleChanged	: false,
		updateZiftIdChanged	: false,
		updateProductChanged: false,

		tabs : (tabName:CompanyTabKeys) => tabSelector('company', tabName),

		filter : (type:string) => {

			if (!companyAllData) return

			company.filteredCount = companyAllData?.length ?? 0

			if (type == 'zift') company.filterByZift = !company.filterByZift
			if (type == 'products') company.filterByProducts = !company.filterByProducts

			const elements = sections.company?.querySelectorAll('.content.all .card-wrapper') as NodeListOf<HTMLDivElement>

			if (elements) {

				elements.forEach((element:HTMLDivElement) => {

					const filter = element.attributes.getNamedItem('data-filter')?.value

					const ziftFilter		= company.filterByZift && filter?.includes('zift:1')
					const productsFilter	= company.filterByProducts && filter?.includes('products:0')

					if	(ziftFilter || productsFilter) {
						
						element.style.display = 'none'

						company.filteredCount--
					
					} else element.style.display = 'block'
				})
			}
		},

		search : (type:string) => {

			if (type == 'clear') {

				company.searchTerm	= ''
				companyLookupData	= null

			} else company.fetch({[type]:company.searchTerm})	
		},

		update : async (key:string, _data?:Record<string,any>) => {

			messageUpdate('company-lookup', { message: 'Updating...', type: 'info', display: true })

			switch (key) {

				case 'role': {

					const { error:roleError } = await api.companyUpdate({ variables:{companyId:companyLookupData?.id, role:companyLookupData?.role} })

					if (roleError) {

						console.error('company: update role error', roleError)

						messageUpdate('company-lookup', { message: 'Server Error: Could not update role', type: 'error' })

					} else {

						console.log('company: update role success')
				
						company.updateRoleChanged = false

						messageUpdate('company-lookup', { display: false })
					}

					break
				}

				case 'ziftId': {

					const { error:ziftIdError } = await api.ziftIdAdmin({ variables:{companyId:companyLookupData?.id, ziftAccountId:companyLookupData?.ziftAccountId} })

					if (ziftIdError) {

						console.error('company: update ziftId error', ziftIdError)
						
						messageUpdate('company-lookup', { message: 'Server Error: Could not update ziftId', type: 'error' })
					
					} else {

						console.log('company: update ziftId success')
						
						company.updateZiftIdChanged = false

						messageUpdate('company-lookup', { display: false })
					}

					break
				}

				case 'product': {

					const variables = {
						companyId			: companyLookupData?.id,
						active				: false,
						availability		: '',
						description			: 'new product added by admin for distribution',
						price_amount		: 1000.00,
						title				: company.updateProductValue,
						unit				: 'item'
					}

					const { error } = await api.productCreate({ variables })

					if (error) {

						console.error('company: update product error', error)
						
						messageUpdate('company-lookup', { message: 'Server Error: Could not add product', type: 'error' })
					
					} else {

						console.log('company: update product success')
						
						company.updateProductChanged	= false
						company.updateProductValue		= ''

						messageUpdate('company-lookup', { display: false })
					}

					break
				}

				default:

					messageUpdate('company-lookup', { display: false })

					break
			}
		},

		fetchAll : async () => {

			companyAllData				= null
			company.filterByZift		= false
			company.filterByProducts	= false

			messageUpdate('company-all', { message: 'Loading...', type: 'info', display: true })

			const { companies, error } = await api.companiesAdmin()

			if (error) {

				console.error('company: fetch all error', error)
				
				messageUpdate('company-all', { message: 'Server Error: Could not fetch companies', type: 'error' })
			
			} else if (companies.length > 0) {

				console.log('company: fetch all', companies)

				company.filteredCount	= companies.length
				companyAllData			= companies

				messageUpdate('company-all', { display: false })
			
			} else {
				
				console.log('company: fetch all no companies found')
				
				messageUpdate('company-all', { message: 'No companies found', type: 'none' })
			}
		},

		fetch : async (variables:CompanyFetchVariables) => {

			companyLookupData			= null
			company.updateRoleChanged	= false
			company.updateZiftIdChanged	= false

			if (tabs.company != 'lookup') company.tabs('lookup')

			messageUpdate('company-lookup', { message: 'Loading...', type: 'info', display: true })

			variables.filterBy_status = 'OPEN'

			const { company:c, error } = await api.companyAdmin({ variables })

			if (error) {

				console.error('company: fetch error', error)
				
				messageUpdate('company-lookup', { message: 'Server Error: Could not fetch company', type: 'error' })
			
			} else if (c) {

				console.log('company: fetch', c)

				companyLookupData = c

				messageUpdate('company-lookup', { display: false })

			} else {
				
				console.log('company: fetch no company found')
				
				messageUpdate('company-lookup', { message: 'Company not found', type: 'none' })
			}
		}
	}

	$: company && objects.company == null && (objects.company = company)

</script>



<Section {key} {title} {sections} {tabs} bind:tabSelector={tabSelector} bind:messageUpdate={messageUpdate}>

	<svelte:fragment slot="tabs">

		<Tab name="all" tab={company.tabs} active>Show All</Tab>
		
		<Tab name="lookup" tab={company.tabs}>Lookup</Tab>

	</svelte:fragment>

	<All {company} companiesData={companyAllData} active productFetchAll={objects.product?.fetchAll} />

	<Lookup {company} companyData={companyLookupData} productFetchAll={objects.product?.fetchAll} />

</Section>