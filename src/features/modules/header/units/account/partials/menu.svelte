<script lang="ts">

	import type { Company, CompanyRole } from 'src/types/company'

	import { layout } from 'src/stores/layout'
	import { account } from 'src/features/pages/account/store'
	import { user } from 'src/stores/user'
	import { company as c } from 'src/stores/company/store'
	import { page } from '$app/stores'
	import { routes } from 'src/lists/routes'
	import A from 'src/components/elements/a.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Img from 'src/components/elements/img.svelte'



	let wrapperElement: HTMLElement

	const select = (id:string|null = null, role:CompanyRole|null = null) => {

		if	(id) {

			if	(role == 'PRODUCER')	account.setActive(`producer:${id}`, routeName == 'account' ? 'account' : routes.producerDefaultRoute)
			else						account.setActive(`distributor:${id}`, routeName == 'account' ? 'account' : routes.distributorDefaultRoute)

		} else account.setActive(`consumer:${$user.id}`, routeName == 'account' ? 'account' : routes.consumerDefaultRoute)

		layout.closeMenu()
	}

	$: heightWithoutMain	= $layout.header.heightWithoutMain
	$: routeName			= routes.name($page.url.pathname)
	$: activeId				= $account.active.id
	$: activeType			= $account.active.type
	$: isConsumer			= $account.active.isConsumer
	$: isCompany			= $account.active.isCompany
	$: companies			= $user.companies.filter((c:Company) => c.id != activeId)
	$: company				= $c.companies.length > 0 && isCompany ? c.get(activeId) : null
	$: ziftAccountId		= company ? $company.ziftAccountId : null

	$: wrapperElement && (wrapperElement.style.marginTop = `${heightWithoutMain}px`)

</script>



{#if $layout.overlay == 'account'}

	<div role="menu" tabindex="0" class="account-menu-wrapper" on:mouseleave={layout.closeMenu} bind:this={wrapperElement}>
		<ul>

			{#if isConsumer}

				{#if $user.role && $user.role.includes('admin')}

					<li>
						
						<A route="admin" c="account-menu-link-wrapper" wrapper>

							<span>
								
								<Icon name="key" />

							</span>
							<span>Admin Portal</span>

						</A>
					
					</li>

				{/if}

				<li>

					<A route="orders" action={layout.closeMenu} c="account-menu-link-wrapper" wrapper>

						<span>
							
							<Icon name="list" />

						</span>
						<span>Orders</span>

					</A>

				</li>

			{/if}

			{#if activeType != 'producer' || (activeType == 'producer' && ziftAccountId)}

				<li>

					<A route="account" action={layout.closeMenu} c="account-menu-link-wrapper" wrapper>

						<span>
							
							<Icon name="user" />
						
						</span>
						<span>{activeType == 'producer' ? 'Seller' : activeType == 'distributor' ? 'Distributor' : 'User'} Info</span>

					</A>

				</li>

			{/if}

			<li>

				<A route="logout" preloadCode="off" preloadData="off" c="account-menu-link-wrapper" wrapper>

					<span>
						
						<Icon name="logOut" />
					
					</span>
					<span>Sign Out</span>

				</A>

			</li>
		</ul>

		{#if isCompany && company}

			<ul>
				<li>

					<Button action={select} c="account-menu-button-wrapper" wrapper>

						<div class="name">

							{#if $user.firstName || $user.lastName}

								<span>
			
									{`${$user.firstName}${$user.firstName && $user.lastName ? ' ' : ''}${$user.lastName}`}

								</span>
			
							{/if}

							<span>User Account</span>
						</div>

					</Button>

				</li>
			</ul>

		{:else}

			{#if companies.length > 0}

				<ul>
					
					{#each companies as { id, image, name, role} (id)}

						<li>

							<Button action={() => select(id, role)} c="account-menu-button-wrapper" wrapper>

								{#if image}

									<div class="image">

										{#if image}

											<Img src={image} />

										{/if}
										
									</div>

								{/if}
								
								<div class="name">
									<span>{name}</span>
									<span>{role == 'PRODUCER' ? 'Seller' : 'Distributor'} Account</span>
								</div>

							</Button>

						</li>

					{/each}

				</ul>

			{/if}

		{/if}

	</div>

{/if}



<style lang="sass">

	:global(.account-menu-link-wrapper)		
		width: 100%
		padding: .5rem 1.5rem .5rem 1rem
		@include flex-row-left(.75rem)

		span:first-child
			width: 2rem
			text-align: center
			color: var(--cm-text)
			stroke: var(--cm-text)

	:global(.account-menu-button-wrapper)		
		width: 100%
		padding: .5rem 1.5rem
		@include flex-row-middle(calc(var(--cm-button-spacing) / 2))

	.account-menu-wrapper
		position: absolute
		z-index: 10
		top: calc(100% + var(--cm-nav-padding-vertical))
		right: 0
		height: fit-content
		min-width: max-content
		width: 100%
		border: none !important
		border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius)
		background-color: var(--cm-utility-background)
		box-shadow: var(--cm-box-shadow)
		color: var(--cm-text)
		cursor: default

		ul
			margin: 0

			li				
				margin: 0
				list-style-type: none
				text-align: left
				@include flex-row-left(.75rem)

		ul:first-child
			padding: 1rem 0

			li:hover
				background-color: var(--cm-utility-highlight)

		ul:nth-child(2)
			padding: 1rem 0
			background-color: var(--cm-utility-background-secondary)
			border-radius: 0 0 var(--pico-border-radius) var(--pico-border-radius)

			li

				.image					
					border-radius: 1rem
					background-color: var(--cm-primary)
					overflow: hidden
					@include area(2rem, 2rem, 2rem)

				.name					
					text-align: left
					@include flex-col-left(calc(var(--cm-button-spacing) / 4))

					span:first-child
						width: 100%

					span:last-child
						color: var(--cm-primary)
						font-size: .75rem

</style>