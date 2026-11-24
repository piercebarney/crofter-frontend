<script lang="ts">

	import type { LayoutData } from './$types'

	import CompanyLayout from 'src/features/groups/company/layouts/company.svelte'



	export let data: LayoutData

</script>



<CompanyLayout user={data.user}>
	
	<slot />

</CompanyLayout>