<script lang="ts">

	import { browser } from '$app/environment'
	import { header } from 'src/features/modules/header/store'
	import { company as c } from 'src/stores/company/store'
	import { account } from 'src/features/pages/account/store'
	import { api } from 'src/lib/api'
	import MainLayout from 'src/components/layouts/main.svelte'



	let company: any = null

	$: if (browser && $c) company = c.get($account.active.id)

	const resendVerificationEmail = async () => {

		const { success } = await api.companyResendEmailVerification({variables:{companyId:$company.id}})

		if (success) header.alert('company-email-verification-email-sent', {
			title		: 'Email Verification Email Sent',
			message		: 'Please check your spam folder if you cannot find this email.',
		})
	}

	$: if (company && $company.emailVerified === false) header.alert('company-email-verify', {	
		title		: 'Company Email Not Verified',
		message		: `An email verification email was sent to ${$company.email}. If you cannot locate this email, please check your spam folder.`,
		actions		: [
						{
							text	: 'Resend Verification Email',
							action	: resendVerificationEmail
						}
					],
		type		: 'warning',
		sections	: ['producer','distributor']
	})

</script>



<MainLayout>

	<slot />

</MainLayout>