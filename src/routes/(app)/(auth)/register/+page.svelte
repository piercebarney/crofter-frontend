<script lang="ts">

	import type { PageData } from './$types'

	import Register from 'src/features/groups/auth/pages/register/page.svelte'


	export let data: PageData

</script>



<Register user={data.user} />