<script lang="ts">

	import { browser } from '$app/environment'
	import { page } from '$app/stores'
	import { onMount } from 'svelte'
	import { company as c } from 'src/stores/company/store'
	import { account } from 'src/features/pages/account/store'
	import { layout } from 'src/stores/layout'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import { routes } from 'src/lists/routes'
	import Sidebar from 'src/features/groups/company/producer/layouts/application/partials/sidebar.svelte'
	import Body from 'src/features/groups/company/producer/layouts/application/partials/body.svelte'
	import AccountMenu from 'src/features/modules/header/units/account/partials/menu.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Modal from 'src/features/modules/modal/module.svelte'


	
	let accountMenueElement:	HTMLDivElement,
		overlayElement:			HTMLDivElement,
		company:				any				= null,
		open:					boolean			= true,
		widthInit:				boolean			= false

	const closeMenu = () => {
		
		layout.closeMenu()

		if (open) toggleNav()
	}

	const toggleNav = () => {

		open = !open

		layout.set({overlay:open ? 'nav' : null})
	}

	$: headerHeight = $layout.header.mainHeight

	$: if (browser && company == null && $c) company = c.get($account.active.id)

	$: if ($company && !$company.merchantApplicationDetails) company.merchantApplicationFetch()

	$: if ($company && $company.merchantApplicationDetails) application.updateStepsFromCompany($company.merchantApplicationDetails)

	$:	 if	(overlayElement && $layout.overlay == 'account')	overlayElement.style.zIndex = '300'
	else if	(overlayElement && isMobile)						overlayElement.style.zIndex = '250'
	else if	(overlayElement && open) {
		
		overlayElement.style.zIndex = '300'

		toggleNav()
	}

	$: accountMenueElement && (accountMenueElement.style.top = `${headerHeight - 8}px`)

	$: if (width) {
		
		if	(widthInit)	open = false
		else			widthInit = true

		layout.closeMenu()
	}

	$: name			= $company?.name
	$: overlay		= $layout.overlay
	$: width		= $layout.width
	$: isMobile		= $layout.isMobile
	$: routeName	= routes.name($page.url.pathname)
	$: status		= $company?.merchantApplicationDetails?.status
	$: inReview		= ['STARTED', 'READY'].includes(status) || !status ? false : true

	onMount(() => {
		
		application.init()
	})

</script>



<div class="wrapper">
	<div class="account-menu" bind:this={accountMenueElement}>
	
		<AccountMenu />
	
	</div>
	<div class="page">

		{#if routeName != 'application'}

			<div class="left" class:open>

				{#if isMobile}

					<div role="none" class="button" on:click={toggleNav} on:keypress={toggleNav}>
						<div>
							<div>

								{#if open}
							
									<Icon name="chevronLeft" size="2.25rem" />

								{:else}

									<Icon name="chevronRight" size="2.25rem" />

								{/if}

							</div>
						</div>
					</div>

				{/if}

				<Sidebar {name} {routeName} {inReview} {company} bind:open />

			</div>

		{/if}

		<div class="right">

			<Body {routeName}>

				<slot />

			</Body>

		</div>
	</div>

	{#if overlay}
		
		<div role="presentation" class="overlay" bind:this={overlayElement} on:click={closeMenu} on:keypress={closeMenu}></div>

	{/if}

</div>

<Modal />



<style lang="sass">

	.wrapper
		position: relative
		@include fill

		.account-menu
			z-index: 350
			right: 2rem !important
			@include absolute-top-right

		.page
			@include fill
			@include flex-row

			.left
				position: fixed
				top: 0
				left: 0
				bottom: 0
				z-index: 300
				width: calc(100% - 2rem)
				box-shadow: var(--cm-box-shadow)
				transform: translateX(-100%)
				transition: transform 0.2s ease-in-out

				&.open
					transform: translateX(0)

					.button
						background-color: #FBF9F6
						color: var(--cm-text)

				&:not(.open)

					.button:hover
						background-color: #356635

				.button
					top: 10rem !important
					right: -1.5rem !important
					box-shadow: 1px -1px 2px -2px rgba(0, 0, 0, 0.2), 1px 1px 2px -2px rgba(0, 0, 0, 0.2), 2px 0 2px -2px rgba(0, 0, 0, 0.2)
					height: 6rem
					width: 1.5rem
					border-radius: 0 var(--pico-border-radius) var(--pico-border-radius) 0
					background-color: #468047
					color: white
					transition: background-color var(--pico-transition), color var(--pico-transition)
					@include absolute-top-right

					&:hover
						cursor: pointer


					> div
						position: relative
						overflow: hidden
						@include fill

						> div
							@include absolute-middle-center


			.right
				z-index: 200
				width: 100%

		.overlay
			position: fixed
			z-index: 250
			background-color: var(--pico-modal-overlay-background-color)
			@include inset


	@media (min-width: #{breakpoint('sm')})

		.wrapper

			.account-menu
				right: 3rem !important

			.page

				.left
					width: 80%


	@media (min-width: #{breakpoint('md')})

		.wrapper

			.account-menu
				right: 2rem !important

			.page

				.left
					flex: 0 0 40%
					position: relative
					box-shadow: none
					transform: none !important


	@media (min-width: #{breakpoint('lg')})

		.wrapper

			.page

				.left
					flex: 0 0 35%


	@media (min-width: #{breakpoint('xl')})

		.wrapper

			.account-menu
				right: 3rem !important

			.page

				.left
					flex: 0 0 32rem

</style>