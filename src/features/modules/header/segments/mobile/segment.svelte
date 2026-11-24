<script lang="ts">

	import type { BackButton as BackButtonType } from 'src/features/modules/header/store'

	import LiWrapper from 'src/features/modules/header/segments/wrappers/li.svelte'
	import BackButton from 'src/features/modules/header/segments/mobile/partials/backButton.svelte'
	import MenuButton from 'src/features/modules/header/segments/mobile/partials/menuButton.svelte'
	import Menu from 'src/features/modules/header/segments/mobile/partials/menu.svelte'
	import Brand from 'src/components/elements/brand.svelte'
	import Account from 'src/features/modules/header/units/account/unit.svelte'



	export let backButton:		BackButtonType|null
	export let wrapperMargin:	number
	export let activeType:		string

</script>



<LiWrapper>

	{#if backButton}
	
		<BackButton />

	{:else if activeType == 'distributor'}

		<MenuButton />

		<Menu {wrapperMargin} />

	{:else}

		<div style="width:56px"></div>

	{/if}

</LiWrapper>

<LiWrapper brandMobile>

	<Brand />

</LiWrapper>

<LiWrapper>

	<Account />

</LiWrapper>
