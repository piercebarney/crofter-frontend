<script lang="ts">

	import { browser } from '$app/environment'
	import { onMount, tick } from 'svelte'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import { formatPhone } from 'src/lib/helpers'
	import { format } from 'src/lib/validate'
	import Icon from 'src/components/elements/icon/element.svelte'
	import Form from 'src/components/elements/form.svelte'
	import BlockWrapper from 'src/features/groups/company/producer/pages/application/partials/block-wrapper.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'
	import A from 'src/components/elements/a.svelte'
	import Owner from 'src/features/groups/company/producer/pages/application/partials/owner.svelte'



	let company:			any			= null,
		show:				boolean		= false,
		inReview:			boolean		= false,
		businessType:		string		= '',
		owners:             any[]		= [],
		formChangeBD:		boolean		= false,
		formChangeED:		boolean		= false,
		formChangeOD:		boolean		= false,
		formChangeOwD:		boolean		= false,
		buttonLoadingBD:	boolean		= false,
		buttonLoadingED:	boolean		= false,
		buttonLoadingOD:	boolean		= false,
		buttonLoadingOwD:	boolean		= false,
		formSubmitBD:		(()=>boolean),
		formSubmitED:		(()=>boolean),
		formSubmitOD:		(()=>boolean),
		formSubmitOwD:		(()=>boolean),
		buttonResetBD:		(()=>void),
		buttonResetED:		(()=>void),
		buttonResetOD:		(()=>void),
		buttonResetOwD:		(()=>void)

	const companyUpdate = (data: any) => {
		
		company.merchantApplicationUpdate(data)

		application.updateStepsFromCompany($company.merchantApplicationDetails)
	}

	const onSuccessBD = (data: any) => {

		companyUpdate(data)

		formChangeBD	= false
		buttonLoadingBD	= false
	}
	const onSuccessED = (data: any) => {
		
		companyUpdate(data)

		formChangeED	= false
		buttonLoadingED	= false
	}
	const onSuccessOD = (data: any) => {
		
		companyUpdate(data)

		formChangeOD	= false
		buttonLoadingOD	= false
	}
	const onSuccessOwD = (data: any) => {
		
		companyUpdate(data)

		formChangeOwD	= false
		buttonLoadingOwD	= false
	}

	const addOwner = () => owners = [...owners, {}]

	const removeOwner = (index: number) => {

		formChangeOwD = true
		
		owners = owners.filter((_, i) => i !== index)
	}
	
	const totalStakePercentage = (v:string = '', t:HTMLInputElement|null = null) => {

		if (t && v) {

			if (v.length == 1) {
				
				if (parseInt(v, 10) == 0)	t.value = ''
				else 						t.value = `${v}%`

			} else if (v.length == 2) {

				if (v[0] == '0')	t.value = `${v.slice(1)}%`
				else 				t.value = `${v}%`

			} else if (v.length == 4) {

				if (parseInt(v, 10) > 100) t.value = ''
				else if (v[0] == '0') {
					
					if (v[1] == '0') t.value = v.slice(2)
					else 			 t.value = v.slice(1)
				}
			}
		}

		const elements = document.querySelectorAll('input[name^="owners_stakePercentage"]') as NodeListOf<HTMLInputElement>

		let total = 0

		elements.forEach(el => total += parseInt(el.value.replace('%', ''), 10))

		if	(total != 100)	elements.forEach(el => el.classList.add('form-error-input'))
		else				elements.forEach(el => el.classList.remove('form-error-input'))
	}

	$: if (browser && company == null && $c) company = c.get($account.active.id)

	$: if (browser && owners) tick().then(() => totalStakePercentage())

	$: understood = $application.stages.third.steps.completed > 0 || $application.understood

	$: {

		$application.deposit

		if (show) application.updateStage3($company.merchantApplicationDetails)
	}

	onMount(() => {

		const check = setInterval(() => {
			
			if ($company && $company.merchantApplicationDetails) {

				const status = $company.merchantApplicationDetails.status

				inReview	= ['STARTED', 'READY'].includes(status) || !status ? false : true
				show		= true

				const application = $company.merchantApplicationDetails.application
		
				owners			= application.owners
				businessType	= application.business?.ownershipStructureType ?? ''

				clearInterval(check)

				// Check if we need to scroll to deposit-details
				if (window.location.hash === '#deposit-details') {

					tick().then(() => {

						const element = document.getElementById('deposit-details')

						if (element) element.scrollIntoView({ behavior: 'smooth' })
					})
				}
			}
			
		}, 100)

		return () => clearInterval(check)
	})

</script>



{#if show}

	<div class="wrapper-payment-processing">

		<p class="notice"><span class="icon"><span><Icon name="info" size="3rem" /></span></span>In accordance with federal regulation, <span><A href="https://zift.io/" target="_blank" application>Zift</A></span> must verify your business information to collect payments from your customers. To prevent delays in activating your account, please provide the requested information as accurately as possible. <span><A href="https://zift.io/" target="_blank" application>Zift</A></span> will contact you directly for any needed clarifications.</p>

		{#if understood}

			<Form action="/account?/applicationPaymentProcessing" bind:submit={formSubmitBD} bind:change={formChangeBD} onSuccess={onSuccessBD} onFailure={buttonResetBD} application>

				<input type="hidden" name="companyId" value={$company?.id ?? ''} />

				<BlockWrapper {company} {inReview} required={['business_description','business_ownershipStructureType','business_registrationYear','business_taxId']}>

					<svelte:fragment slot="label">Business Details</svelte:fragment>

					<textarea name="business_description" placeholder="Business Description - describe the products you sell" rows="5" value={$company?.merchantApplicationDetails?.application?.business?.description ?? ''} disabled={inReview}></textarea>
					<div class="row">
						<div>

							<Select list="business-types" name="business_ownershipStructureType" placeholder="Business Type" bind:value={businessType} disabled={inReview} />

						</div>
						<input type="text" name="business_registrationYear" placeholder="Registration Year" value={$company?.merchantApplicationDetails?.application?.business?.registrationYear ?? ''} disabled={inReview} />
					</div>
					<input type="text" name="business_taxId" placeholder="Tax ID - sole proprietors use SSN" value={$company?.merchantApplicationDetails?.application?.business?.taxId ?? ''} on:click={format.taxId} on:keydown={format.taxId} on:paste={format.taxId} on:input={format.taxId} on:blur={format.taxId} disabled={inReview} />
					
					<svelte:fragment slot="submit-button">

						{#if !inReview}
						
							<Button formSubmit={formSubmitBD} bind:reset={buttonResetBD} disabled={!formChangeBD} bind:loading={buttonLoadingBD} application>Save</Button>

						{/if}

					</svelte:fragment>

				</BlockWrapper>

			</Form>

			<Form action="/account?/applicationPaymentProcessing" bind:submit={formSubmitED} bind:change={formChangeED} onSuccess={onSuccessED} onFailure={buttonResetED} application>

				<input type="hidden" name="companyId" value={$company?.id ?? ''} />

				<BlockWrapper {company} {inReview} required={['estimates_annualCardsVolume','estimates_avgCardsTransactionAmount','estimates_maxTransactionAmount']}>

					<svelte:fragment slot="label">Estimate Details</svelte:fragment>

					<div class="info">
						<p>
							These estimates are used to help with fraud prevention.
						</p>
					</div>
					<div class="row">
						<div>

							<Select list="transaction-volumes" name="estimates_annualCardsVolume" placeholder="Annual Transaction Volume" value={`${$company?.merchantApplicationDetails?.application?.estimates?.annualCardsVolume ?? ''}`} disabled={inReview} />

						</div>
						<div>

							<Select list="transaction-amounts" name="estimates_avgCardsTransactionAmount" placeholder="Average Transaction Amount" value={`${$company?.merchantApplicationDetails?.application?.estimates?.avgCardsTransactionAmount ?? ''}`} disabled={inReview} />

						</div>
					</div>
					<div class="row">
						<div>

							<Select list="transaction-amounts" name="estimates_maxTransactionAmount" placeholder="Maximum Transaction Amount" value={`${$company?.merchantApplicationDetails?.application?.estimates?.maxTransactionAmount ?? ''}`} disabled={inReview} />

						</div>
						<div></div>
					</div>

					<svelte:fragment slot="submit-button">

						{#if !inReview}
						
							<Button formSubmit={formSubmitED} bind:reset={buttonResetED} disabled={!formChangeED} bind:loading={buttonLoadingED} application>Save</Button>

						{/if}
						
					</svelte:fragment>

				</BlockWrapper>

			</Form>

			{#if businessType != 'SOLE_PROPRIETORSHIP'}

				<Form action="/account?/applicationPaymentProcessing" bind:submit={formSubmitOwD} bind:change={formChangeOwD} onSuccess={onSuccessOwD} onFailure={buttonResetOwD} application>

					<input type="hidden" name="companyId" value={$company?.id ?? ''} />

					<BlockWrapper {company} {inReview} status={inReview && owners.length > 0 ? true : false}>

						<svelte:fragment slot="label">Beneficial Owner Details</svelte:fragment>

						<div class="info">
							<p>
								<span><A href="https://www.fincen.gov/sites/default/files/2018-04/FinCEN_Guidance_CDD_FAQ_FINAL_508_2.pdf" target="_blank" application>Federal regulation</A></span> requires us to obtain and verify information about the beneficial owners of your business.
							</p>
							<div>
								<span>A beneficial owner is:</span>
								<ol>
									<li>Anyone who owns directly or indirectly, <u>25 percent or more</u> of the equity interests of your business or;</li>
									<li>An individual with <u>significant responsibility</u> for managing the legal entity.</li>
								</ol>
							</div>
							<p>
								To help us comply with the rule and verify the identity of the beneficial owners of your business, please fill out the fields for each owner with the most correct and up to date information as possible. If we are unable to verify your identity with the information provided below, we may have to request additional information to help us comply with the rule which may delay the activation of your account. 
							</p>
						</div>
						<div class="owners">

							{#each owners as owner, index (index)}

								<Owner {owner} {index} {totalStakePercentage} {inReview} onRemove={() => removeOwner(index)} />

							{/each}

							{#if inReview && owners.length == 0}

								<div class="button-wrapper">
									<div class="no-owners">

										No beneficial owners were added.

									</div>
								</div>

							{:else if !inReview}

								<div class="button-wrapper">
									<div>

										<Button type="button" action={addOwner} applicationSecondary>Add Beneficial Owner</Button>

									</div>
								</div>

							{/if}

						</div>

						<svelte:fragment slot="submit-button">

							{#if owners.length > 0 && !inReview}
							
								<Button formSubmit={formSubmitOwD} bind:reset={buttonResetOwD} disabled={!formChangeOwD} bind:loading={buttonLoadingOwD} application>Save</Button>

							{/if}
							
						</svelte:fragment>

					</BlockWrapper>

				</Form>

			{/if}

			<Form action="/account?/applicationPaymentProcessing" bind:submit={formSubmitOD} bind:change={formChangeOD} onSuccess={onSuccessOD} onFailure={buttonResetOD} application>

				<input type="hidden" name="companyId" value={$company?.id ?? ''} />

				<BlockWrapper {company} {inReview} required={['officer_firstName', 'officer_lastName', 'officer_title', 'officer_phone', 'officer_socialSecurity', 'officer_address_address1', 'officer_address_city', 'officer_address_state', 'officer_address_zipCode', 'officer_birthDate', 'officer_email']}>

					<svelte:fragment slot="label">Individual with Significant Control</svelte:fragment>

					<div class="info">
						<p>
							Provide information for someone with significant responsibility to control, manage or direct the business. If appropriate, an individual listed as a Beneficial Owner may be listed in this section.
						</p>
					</div>
					<div class="row">
						<input type="text" name="officer_firstName" placeholder="First Name" value={$company?.merchantApplicationDetails?.application?.officer?.firstName ?? ''} disabled={inReview} />
						<input type="text" name="officer_lastName" placeholder="Last Name" value={$company?.merchantApplicationDetails?.application?.officer?.lastName ?? ''} disabled={inReview} />
					</div>
					
					<Select list="professional-titles" name="officer_title" placeholder="Title" value={$company?.merchantApplicationDetails?.application?.officer?.title ?? ''} disabled={inReview} />

					<input type="text" name="officer_phone" placeholder="Contact Phone" value={formatPhone($company?.merchantApplicationDetails?.application?.officer?.phone ?? '')} on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:paste={format.phoneNumber} on:input={format.phoneNumber} on:blur={format.phoneNumber} disabled={inReview} />
					<input type="text" name="officer_socialSecurity" placeholder="Social Security" value={$company?.merchantApplicationDetails?.application?.officer?.socialSecurity ?? ''} on:click={format.socialSecurityNumber} on:keydown={format.socialSecurityNumber} on:paste={format.socialSecurityNumber} on:input={format.socialSecurityNumber} on:blur={format.socialSecurityNumber} disabled={inReview} />
					<input type="text" name="officer_address_address1" placeholder="Home Address" value={$company?.merchantApplicationDetails?.application?.officer?.address?.address1 ?? ''} disabled={inReview} />
					<input type="text" name="officer_address_address2" placeholder="Apt. #, Unit #, etc. (optional)" value={$company?.merchantApplicationDetails?.application?.officer?.address?.address2 ?? ''} disabled={inReview} />
					<div class="row">
						<input type="text" name="officer_address_city" placeholder="City" value={$company?.merchantApplicationDetails?.application?.officer?.address?.city ?? ''} disabled={inReview} />
						<div>

							<Select list="states" name="officer_address_state" value={$company?.merchantApplicationDetails?.application?.officer?.address?.state ?? ''} disabled={inReview} />

						</div>
					</div>
					<input type="text" name="officer_address_zipCode" placeholder="Zip Code" value={$company?.merchantApplicationDetails?.application?.officer?.address?.zipCode ?? ''} on:click={format.zipCode} on:keydown={format.zipCode} on:paste={format.zipCode} on:input={format.zipCode} on:blur={format.zipCode} disabled={inReview} />
					<input type="text" name="officer_birthDate" placeholder="Date of Birth" value={$company?.merchantApplicationDetails?.application?.officer?.birthDate ?? ''} on:click={format.date} on:keydown={format.date} on:paste={format.date} on:input={format.date} on:blur={format.date} disabled={inReview} />
					<input type="text" name="officer_email" placeholder="Email" value={$company?.merchantApplicationDetails?.application?.officer?.email ?? ''} on:click={format.email} on:keydown={format.email} on:paste={format.email} on:input={format.email} on:blur={format.email} disabled={inReview} />
					
					<svelte:fragment slot="submit-button">

						{#if !inReview}
						
							<Button formSubmit={formSubmitOD} bind:reset={buttonResetOD} disabled={!formChangeOD} bind:loading={buttonLoadingOD} application>Save</Button>

						{/if}
						
					</svelte:fragment>

				</BlockWrapper>

			</Form>

			<Form id="deposit-details" application>

				<BlockWrapper values={$application.deposit} {inReview} required={['bankName', 'holderName', 'accountType', 'accountNumber', 'routingNumber']}>

					<svelte:fragment slot="label">Deposit Details</svelte:fragment>

					<div class="info">
						<p>This information cannot be saved until you are ready to submit your application.</p>
					</div>
					
					<input type="text" name="bankName" placeholder={inReview ? '**********' : 'Bank Name'} bind:value={$application.deposit.bankName} disabled={inReview} />
					<input type="text" name="holderName" placeholder={inReview ? '**********' : 'Name on Account'} bind:value={$application.deposit.holderName} disabled={inReview} />

					<Select list="bank-account-types" name="accountType" placeholder={inReview ? '**********' : 'Account Type'} bind:value={$application.deposit.accountType} disabled={inReview} />
					
					<input type="text" name="accountNumber" placeholder={inReview ? '**********' : 'Account Number'} bind:value={$application.deposit.accountNumber} disabled={inReview} />
					<input type="text" name="routingNumber" placeholder={inReview ? '**********' : 'Routing Number'} bind:value={$application.deposit.routingNumber} disabled={inReview} />

				</BlockWrapper>

			</Form>

		{:else}

			<div class="button">
				<div>
		
					<Button action={application.understand} role="button" application>I understand</Button>
		
				</div>
			</div>

		{/if}

	</div>

{/if}



<style lang="sass">

	.wrapper-payment-processing
		@include flex-col(4rem)

		.notice
			border-radius: var(--pico-border-radius)
			padding: 1.5rem
			font-size: 1.25rem
			line-height: 1.2
			stroke: var(--cm-text)
			background-color: #F9F9F9
			position: relative
			min-height: 4.5rem

			> span
				display: inline-block
				width: fit-content

				&.icon
					float: left
					height: 3rem
					margin-right: .5rem

					span
						display: block
						height: 100%
						display: flex
						align-items: flex-start

		.button

			> div
				margin: 0 auto
				max-width: fit-content

		.info

			> *:not(:last-child)
				margin-bottom: 1rem

			> p
				line-height: 1.2
				
				> span
					display: inline-block
					width: fit-content
			
			> div

				> span
					display: inline-block
					margin-bottom: .5rem
					font-weight: 600

				li
					line-height: 1.2

				li:not(:last-child)
					margin-bottom: .5rem

		.owners

			.button-wrapper
				width: 100%
				
				> div
					margin: 0 auto
					width: 17rem

					&.no-owners
						padding: 1rem
						font-size: 1.5rem
						font-weight: 600
						width: fit-content

		.row
			@include flex-col(1.5rem)


	@media (min-width: #{breakpoint('sm')})
		
		.wrapper-payment-processing

			.owners

				.button-wrapper
					width: 100%
					
					> div
						margin: 0 auto
						width: 18rem

			.row
				@include flex-row-middle(1.5rem)

				> *
					flex: 1


	@media (min-width: #{breakpoint('md')})

		.wrapper-payment-processing
			padding: 4rem 0


	@media (min-width: #{breakpoint('lg')})

		.wrapper-payment-processing
			margin: 0 auto
			max-width: #{breakpoint('sm')}


	@media (min-width: #{breakpoint('xl')})

		.wrapper-payment-processing
			max-width: #{breakpoint('md')}

</style>