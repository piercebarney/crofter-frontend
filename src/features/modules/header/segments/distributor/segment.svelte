<script lang="ts">

	// import type { ActiveAccount } from 'src/features/pages/account/store'

	import LiWrapper from 'src/features/modules/header/segments/wrappers/li.svelte'
	import Brand from 'src/components/elements/brand.svelte'
	// import SearchInput from 'src/features/groups/search/module.svelte'
	import A from 'src/components/elements/a.svelte'
	import LinkWrapper from 'src/features/modules/header/segments/wrappers/link.svelte'
    import Account from 'src/features/modules/header/units/account/unit.svelte'



	// options
	// export let showSearch:	boolean
	export let showAccount:	boolean
	// export let isMobile:	boolean
	export let routeName:	string
	// export let account:		ActiveAccount

</script>



<LiWrapper brand>

	<Brand />

</LiWrapper>

<LiWrapper search>

	<!-- {#if !isMobile && showSearch}

		<SearchInput {account} {routeName} />

	{/if} -->

</LiWrapper>

<LiWrapper>

	<A route="distributor-products" c={routeName == 'distributor-products' ? 'active' : undefined} wrapper>

		<LinkWrapper>

			<span>Products</span>

		</LinkWrapper>

	</A>

</LiWrapper>

<LiWrapper>

	<A route="distributor-stock" c={routeName == 'distributor-stock' ? 'active' : undefined} wrapper>

		<LinkWrapper>

			<span>Stock</span>

		</LinkWrapper>

	</A>

</LiWrapper>

<LiWrapper>

	<A route="distributor-orders" c={routeName == 'distributor-orders' ? 'active' : undefined} wrapper>
		
		<LinkWrapper>

			<span>Fulfillment</span>

		</LinkWrapper>
	
	</A>

</LiWrapper>

{#if showAccount}

	<LiWrapper>

		<Account />

	</LiWrapper>

{/if}