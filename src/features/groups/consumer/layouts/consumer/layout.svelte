<script lang="ts">

	import type { User } from 'src/types/user'

	import { browser } from '$app/environment'
	import { beforeNavigate, afterNavigate } from '$app/navigation'
	import { nav } from 'src/lib/nav'
	import { user as u } from 'src/stores/user'
	import { layout as l } from 'src/stores/layout'
	import { search } from 'src/features/groups/search/store'
	import { header } from 'src/features/modules/header/store'
	import { api } from 'src/lib/api'
	import MainLayout from 'src/components/layouts/main.svelte'
	import Footer from 'src/features/groups/consumer/layouts/consumer/partials/footer.svelte'
	import Cart from 'src/features/groups/consumer/modules/cart/module.svelte'
	import BackButton from 'src/features/groups/consumer/layouts/consumer/partials/back-button.svelte'
	


	export let user: User

	if		(user.id == null)	u.clear()
	else if	(!$u.id)			u.set(user)

	beforeNavigate(async ({ to, from, cancel }) => nav(to, from, cancel))

	// Reset scroll to top after navigation when pathname changes
	afterNavigate(({ from, to }) => {

		if (browser && from?.url.pathname !== to?.url.pathname) {

			const scrollElement = l.get('scroll').element

			if (scrollElement) {

				// Temporarily disable smooth scrolling
				scrollElement.style.scrollBehavior = 'auto'
				scrollElement.scrollTo({ top: 0, behavior: 'auto' })
				
				// Restore smooth scrolling after a brief delay
				setTimeout(() => scrollElement.style.scrollBehavior = 'smooth', 50)
			}
		}
	})

	
	// email verification
	const resendVerificationEmail = async () => {

		const { success } = await api.userResendEmailVerification()

		if (success) header.alert('user-email-verification-email-sent', {
			title		: 'Email Verification Email Sent',
			message		: 'Please check your spam folder if you cannot find this email.',
		})
	}

	if (user?.emailVerified === false) header.alert('user-email-verify', {	
		title		: 'User Email Not Verified',
		message		: `An email verification email was sent to ${user.email}. If you cannot locate this email, please check your spam folder.`,
		actions		: [
						{
							text	: 'Resend Verification Email',
							action	: resendVerificationEmail
						}
					],
		type		: 'warning',
		sections	: ['consumer']
	})


	// zip code
	search.set({zipCodeChecked:false})

	if (user?.zipCode) search.set({defaultZipCode:user.zipCode.slice(0, 5)})

	if (browser) {

		const storedZipCode = document.cookie.split(';').find(row => row.trim().startsWith('zip-code='))?.split('=')[1] || null

		if (storedZipCode) search.set({storedZipCode})
	}

	$: browser && (() => {

		const zipCode = $search.defaultZipCode ?? $search.enteredZipCode ?? $search.storedZipCode ?? null

		search.set({zipCode, zipCodeChecked:true})
		
	})()

</script>



<MainLayout>

	<slot />

	<svelte:fragment slot="footer">

		<Footer />
		
	</svelte:fragment>

	<Cart slot="cart" />

	<BackButton />

</MainLayout>