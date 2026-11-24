<script lang="ts">

	import { search } from 'src/features/groups/search/store'
	import { header } from 'src/features/modules/header/store'
	import { format } from 'src/lib/validate'
	import { checkDistance } from 'src/features/groups/consumer/pages/home/units/zip-code/helpers'
	import { fade } from 'svelte/transition'
	import Brand from 'src/components/elements/brand.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'



	let emailInput: HTMLInputElement,
		zipCodeInput: HTMLInputElement,
		isLocal: any	= null,
		enteredZipCode	= '',
		bypass			= false,
		submitted		= false,
		disabled		= true,
		zCChecked		= false,
		email			= ''

	$: zipCodeChecked	= $search.zipCodeChecked
	$: zipCode			= $search.zipCode
	$: active			= zipCodeChecked && !bypass && (!zipCode || isLocal === false)

	$: header.set({showCart:!active})

	$: if (isLocal === false && !submitted && emailInput) setTimeout(() => emailInput.focus(), 100)
	
	$: if (isLocal === null && zipCodeInput) setTimeout(() => zipCodeInput.focus(), 100)

	const checkZipCode = (value:string, target:HTMLInputElement|null, pass:boolean) => {

		if (pass && !zCChecked) {

			zCChecked = true

			enteredZipCode = value

			isLocal = checkDistance(value)

			if (isLocal) {

				search.set({enteredZipCode:value})

				document.cookie = `zip-code=${value}; path=/; expires=${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toUTCString()}` // 14 days
			}
		
		} else zCChecked = false
	}

	const checkEmail = (value:string, target:HTMLInputElement|null, pass:boolean, key:string|null) => {

		if (pass) {
			
			email = value

			if (key == 'Enter') submit()
		}

		disabled = !pass
	}

	const submit = async () => {

		try {

			// Send email to support
			const response = await fetch('/api/send-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					to: 'support@crofter.com',
					subject: 'New Service Area Request',
					message: `A user has requested service in their area.\n\nEmail: ${email}\nZip Code: ${enteredZipCode}\n\nPlease consider this location for future expansion.`
				})
			})

			if (!response.ok) console.error('Failed to send email:', response.statusText)

		} catch (error) {

			console.error('Error sending email:', error)
		}

		submitted = true

		setTimeout(bypassZipCode, 6 * 1000) // 6 seconds
	}

	const goBack = () => isLocal = null

	const bypassZipCode = () => bypass = true

</script>



{#if active}

	<div class="wrapper" transition:fade>
		<div>

			{#if isLocal === false}

				{#if submitted}

					<div class="body">
						<div class="title">
							<span>Thank You!</span>
						</div>
						<div class="buttons">
							
							<Button action={bypassZipCode} role="link" underline>Explore All Products</Button>

						</div>
					</div>

				{:else}

					<div class="body">
						<div class="title">
							<span>Bring Crofter Market to You</span>
							<span>Sorry, we don't serve your area yet. Enter your email below to help us pick our next location, and we'll keep you posted.</span>
						</div>
						<div class="email">
							<input bind:this={emailInput} type="text" placeholder="Email" on:click={format.email} on:keyup={(e) => format.email(e, checkEmail)} on:blur={(e) => format.email(e, checkEmail)} />

							<Button action={submit} secondary {disabled}>Submit</Button>

						</div>
						<div class="buttons">

							<Button action={goBack} role="link" underline>Try Another Zip Code</Button>

							<span>or</span>
							
							<Button action={bypassZipCode} role="link" underline>Explore All Products</Button>

						</div>
					</div>

				{/if}

			{:else}

				<div class="brand">

					<Brand primary />

				</div>
				<div class="body">
					<div class="title">
						<span>Enter Zip Code</span>
						<span>Find locally produced products in your area.</span>
					</div>
					<div class="zip-code">
						<input bind:this={zipCodeInput} type="text" placeholder="Zip Code" on:click={format.zipCode} on:keydown={(e) => format.zipCode(e, checkZipCode)} on:blur={(e) => format.zipCode(e, checkZipCode)} />
					</div>
					<div class="auth">
						<span>Have an account?</span>

						<A route="login" c="zip-code-auth-link" underline>Sign In</A>

					</div>
				</div>

			{/if}

		</div>
	</div>

{/if}



<style lang="sass">

	:global(.zip-code-auth-link)
		display: inline !important

	.wrapper
		z-index: 100
		backdrop-filter: blur(4px)
		background-color: rgba(0, 0, 0, 0.2)
		@include fixed

		> div
			width: 100%
			background-color: var(--cm-background)
			padding: 6rem 2rem
			text-align: center
			@include absolute-top-center(10rem)
			@include flex-col-center(3rem)

			> div
				@include flex-col-center(2rem)

			.brand,
			.body
				width: 100%

			.title
				color: var(--cm-text-secondary-dark)
				line-height: 1.5rem

				span
					display: block

				span:first-child
					margin-bottom: .5rem
					font-size: 1.5rem
					font-weight: 600
					color: var(--cm-text)
	
			.zip-code
				width: 12rem

			.email
				width: 100%

				input
					margin-bottom: .5rem

			.auth,
			.buttons
				color: var(--cm-text-secondary-dark)
				font-weight: 600

			.buttons
				@include flex-row(.5rem)

				span
					font-weight: 400


	@media (min-width: #{breakpoint('sm')})

		.wrapper

			> div
				max-width: #{breakpoint('xs')}
				border-radius: var(--pico-border-radius)

				.brand,
				.body
					width: 80%


	@media (min-width: #{breakpoint('md')})

		.wrapper

			> div
				max-width: #{breakpoint('sm')}

	
	@media (min-width: #{breakpoint('lg')})

		.wrapper

			> div
				max-width: #{breakpoint('md')}

				.brand,
				.body
					width: 60%

</style>
