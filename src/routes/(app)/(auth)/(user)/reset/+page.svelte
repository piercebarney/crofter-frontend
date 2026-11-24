<script lang="ts">

	import type { PageData } from './$types'
	import type { ActionData } from './$types'

	import Reset from 'src/features/groups/auth/pages/reset/page.svelte'



	export let data: PageData
	export let form: ActionData

</script>



<Reset token={data.token} error={form?.error} />