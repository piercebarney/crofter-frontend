<script lang="ts">

	import { fly } from 'svelte/transition'
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import { user } from 'src/stores/user'
	import { routes } from 'src/lists/routes'
    import Container from 'src/features/groups/auth/pages/register/container.svelte'
	import A from 'src/components/elements/a.svelte'
	import NewUser from 'src/features/groups/auth/pages/register/partials/new-user.svelte'
	import ExistingUser from 'src/features/groups/auth/pages/register/partials/existing-user.svelte'
	import ApplicationSteps from 'src/components/units/application-steps/unit.svelte'



	export let newUser:		boolean	= false
	export let closeButton:	boolean	= false

	let formSubmit:		(()=>boolean),
		index:			number			= 0,
		name:			string			= '',
		disabled:		boolean			= true,
		loading:		boolean			= false,
		formChange:		boolean			= false

	const onSuccess = (data:any) => {

		if (data?.user) user.set(data.user)

		if (data?.company) user.companyAdd(data.company)

		application.completeStage('first')

		goto(routes.pathname('application'))
	}

	const onFailure = (error: any) => {

		if (error?.name) {
			
			index = 1

			document?.querySelector('#name')?.classList.add('form-error-input')
		}
	}

	const next = (e: KeyboardEvent) => {

		if (e.key === 'Enter') index++
	}

	$: if (name) disabled = false

	$: if (index > 2) loading = true

	onMount(() => {
		
		application.init()

		if (!$application.stages.first.completed) index = 1
	})

</script>



<Container bind:index={index} {formSubmit} {disabled} {loading} {formChange} {closeButton}>

	<div class="wrapper" slot="left">

		{#if index > 0}

			{#key index}

				<div class="left-body" in:fly={{ x: 300, duration: 300 }}>

					{#if index === 1}

						<div class="label">
							<span>What is the name of your shop?</span>
							<span>This is the name you'll show up by in the Crofter marketplace.</span>
						</div>
						<input id="name" type="text" name="name" class="application" placeholder="Shop Name" bind:value={name} on:keypress={next} autocomplete="organization" />
						
						{#if newUser}
						
							<span class="login">Already have an application in progress? <span><A route="application" application>Sign In</A></span></span>
						
							{/if}

					{:else if index === 2}

						{#if newUser}

							<NewUser bind:formSubmit bind:formChange {onSuccess} {onFailure} {name} />

						{:else}

							<ExistingUser bind:formSubmit bind:formChange {onSuccess} {onFailure} {name} />

						{/if}

					{/if}

				</div>

			{/key}

		{/if}

	</div>

	<div slot="right">

		{#if index == 2}

			<div class="right-body">

				<ApplicationSteps {name} nav={false} >

					<span slot="shop-details">We'll need to know a little more about your shop</span>
					<span slot="products">We’ll get your shop set up with the items you’re selling</span>
					<span slot="payment-processing">We’ll do the heavy lifting to help you get started accepting payments from buyers</span>

				</ApplicationSteps>
				
			</div>

		{/if}

	</div>

</Container>



<style lang="sass">

	.wrapper
		position: relative
		// min-height: 200px
		@include fill

		.left-body
			position: absolute
			width: 100%
			padding-bottom: 3rem
			@include flex-col(2.5rem)

	.label

		> span
			display: block

			&:first-child
				margin-bottom: 1.5rem
				font-size: 2.5rem
				font-weight: 600

			&:last-child
				font-size: 1.25rem
				font-weight: 400
				line-height: 1.2
				color: var(--cm-text-secondary)

	.login
		font-size: 1.25rem
		font-weight: 400
		line-height: 1.2
		color: var(--cm-text-secondary)

		> span
			display: inline-block
			width: fit-content

	@media (min-width: #{breakpoint('md')})

		.wrapper

			.left-body
				padding-bottom: 0

</style>