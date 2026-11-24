<script lang="ts">

	import { layout } from 'src/stores/layout'
	import { user } from 'src/stores/user'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import Button from 'src/components/elements/button.svelte'
	import Img from 'src/components/elements/img.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import A from 'src/components/elements/a.svelte'



	export let alwaysShowName:	boolean = false
	export let application:		boolean = false

	const action = () => layout.set({overlay:$layout.overlay != 'account' ? 'account' : null})

	$: isDesktop	= $layout.isDesktop
	$: activeId		= $account.active.id
	$: isCompany	= $account.active.isCompany
	$: company		= $c.companies.length > 0 && isCompany ? c.get(activeId) : null

</script>


{#if $user.id}

	<Button {action} c="account-button-wrapper" wrapper>

		{#if isCompany && company}

			{#if $company.image}

				<div class="user-image">

					<Img src={$company.image} round="2.5rem" {application} />

				</div>

			{:else}

				<span class="user-icon">
				
					<Icon name="user" size="1.75rem" />

				</span>

			{/if}

			{#if isDesktop || alwaysShowName}
			
				<div class="name">
					<span>{$company.name}</span>
				</div>

			{/if}

		{:else}

			<span class="user-icon">
					
				<Icon name="user" size="1.75rem" />

			</span>

			{#if isDesktop || alwaysShowName}
			
				<span class="name">{user.fullName()}</span>

			{/if}

		{/if}

		<div class="arrow-icon">
			
			<Icon name="chevronDown" />

		</div>

	</Button>

{:else}

	<A route="login" c="sing-in-link-wrapper" wrapper>Sign In</A>

{/if}



<style lang="sass">

	:root
		--c-account-button-font-size: 1.5rem

	:global(.sing-in-link-wrapper)		
		height: 100%
		font-size: var(--c-account-button-font-size)
		@include flex-row-middle-center

	:global(.account-button-wrapper)
		position: relative
		@include flex-row-middle

		.user-image
			@include flex-row-middle-center

		.user-icon
			line-height: 2.67rem
			// stroke: #fff

		.name
			margin-left: var(--cm-nav-input-option-spacing)
			font-size: var(--c-account-button-font-size)
			@include flex-col-middle

		.arrow-icon
			margin-left: var(--cm-nav-input-option-spacing)
			@include flex-col-middle

	@media (min-width: #{breakpoint('lg')})

		:root
			--c-account-button-font-size: 1.25rem

	@media (min-width: #{breakpoint('xl')})

		:root
			--c-account-button-font-size: 1.5rem

</style>