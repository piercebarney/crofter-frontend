<script lang="ts">

	import { page as p } from '$app/stores'
	import { browser } from '$app/environment'
	import { account } from 'src/features/pages/account/store'
	import { user } from 'src/stores/user'
	import { layout } from 'src/stores/layout'
	import { routes } from 'src/lists/routes'
	import { slide } from 'svelte/transition'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'



	export let header:	any
	export let height:	number	= 0
	
	let wrapperElement: HTMLDivElement

	const captureHeight = (element: HTMLDivElement) => {

		height = element.offsetHeight
		
		const observer = new ResizeObserver(() => height = element.offsetHeight)
		
		observer.observe(element)
		
		return {destroy() { observer.disconnect() }}
	}

	$: alerts		= $header.alerts
	$: layoutWidth	= $layout.width
	$: isMobile		= $layout.isMobile
	$: section		= $account.active.type
	$: page			= routes.name($p.url.pathname)
	$: loggedIn		= $user.id ? true : false

	$: 	 if (wrapperElement && layoutWidth)	height = wrapperElement.offsetHeight
	else if (!wrapperElement)				height = 0

</script>



{#if browser && alerts && alerts.length > 0}

	<div id="header-alert-wrapper" bind:this={wrapperElement} use:captureHeight>

		{#each alerts as {id, data} (id)}

			{#if data && data.message && (!data.sections || data.sections.includes(section)) && (!data.pages || data.pages.includes(page)) && (data.loggedIn === false || (data.loggedIn && loggedIn) )}

				<div id={`header-alert-${id}`} class={`alert ${data?.type ? data.type : 'info'}`} transition:slide>

					<div class="container">
						<div>

							{#if data.title}

								<span class="title">{data.title}:</span>

							{/if}

							<span>{data.message}</span>

							{#if isMobile}

								{#if data?.links && data?.links.length > 0}

									{#each data.links as {text, url} (url)}
									
										<A href={url} hoverUnderline>{text}</A>

									{/each}

								{/if}

								{#if data?.actions && data?.actions.length > 0}

									{#each data.actions as {text, action} (action)}
									
										<Button {action} link underline>{text}</Button>

									{/each}

								{/if}

								{#if data.links == undefined && data.actions == undefined && data.dismissAble !== false}

									<Button action={() => header.dismissAlert(id)} link underline>Dismiss</Button>

								{/if}

							{/if}

						</div>
						
						{#if !isMobile && ((data?.links && data?.links.length > 0) || (data?.actions && data?.actions.length > 0) || data?.dismissAble !== false)}

							<div>

								{#if data?.links && data?.links.length > 0}

									{#each data.links as {text, url} (url)}
									
										<A href={url} hoverUnderline>{text}</A>

									{/each}

								{/if}

								{#if data?.actions && data?.actions.length > 0}

									{#each data.actions as {text, action} (action)}
									
										<Button {action} link hoverUnderline>{text}</Button>

									{/each}

								{/if}

								{#if data.links == undefined && data.actions == undefined && data.dismissAble !== false}

									<Button action={() => header.dismissAlert(id)} link hoverUnderline>Dismiss</Button>

								{/if}

							</div>

						{/if}

					</div>
				</div>

			{/if}

		{/each}

	</div>

{/if}



<style lang="sass">

	#header-alert-wrapper
		background-color: var(--cm-background)

		.alert
			border-bottom: 1px solid var(--cm-nav-background)

			&.danger
				background-color: var(--cm-danger)
				color: white

			&.warning
				background-color: var(--cm-warning)

			&.success
				background-color: var(--cm-success)
				color: white
			
			&.info
				background-color: var(--cm-info)
				color: white

			> div
				padding: 1rem
				line-height: 1.5
				@include flex-col-middle-center(1rem)

				div:first-child
					flex-grow: 0

					span
						font-weight: 400

					.title
						font-weight: 600

				div:last-child
					min-width: fit-content

	@media (min-width: #{breakpoint('md')})

		#header-alert-wrapper
			
			.alert

				> div
					font-size: 1.2rem
					@include flex-row-middle-between(2rem)

	@media (min-width: #{breakpoint('lg')})

		#header-alert-wrapper
			
			.alert

				> div
					font-size: 1rem
					@include flex-row-middle-between(2rem)

</style>