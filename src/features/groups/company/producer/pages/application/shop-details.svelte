<script lang="ts">

	import { browser } from '$app/environment'
	import { onMount } from 'svelte'
	import { account } from 'src/features/pages/account/store'
	import { company as c } from 'src/stores/company/store'
	import { application } from 'src/features/groups/company/producer/pages/application/store'
	import { formatPhone } from 'src/lib/helpers'
	import { format } from 'src/lib/validate'
	import Form from 'src/components/elements/form.svelte'
	import BlockWrapper from 'src/features/groups/company/producer/pages/application/partials/block-wrapper.svelte'
	import ImageUpload from 'src/components/units/image-upload/unit.svelte'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'



	let formElement:		HTMLFormElement,
		company:			any					= null,
		show:				boolean				= false,
		inReview:			boolean				= false,
		errorB:				string|null			= null,
		errorSD:			string|null			= null,
		errorBH:			string|null			= null,
		formChangeB:		boolean				= false,
		formChangeSD:		boolean				= false,
		formChangeBH:		boolean				= false,
		buttonLoadingB:		boolean				= false,
		buttonLoadingSD:	boolean				= false,
		buttonLoadingBH:	boolean				= false,
		formSubmitB:		(()=>boolean),
		formSubmitSD:		(()=>boolean),
		formSubmitBH:		(()=>boolean),
		buttonResetB:		(()=>void),
		buttonResetSD:		(()=>void),
		buttonResetBH:		(()=>void)

	const companyUpdate = (data:any) => {

		console.log('company update', data)
		
		if (data?.company) company.update(data.company)

		if (data?.application) company.merchantApplicationUpdate(data.application)

		if (data?.address) {

			if	($company.addresses.length > 0)	company.addressUpdate(data.address)
			else								company.addressAdd(data.address)
		}

		application.updateStepsFromCompany($company.merchantApplicationDetails)
	}

	const onSuccessB = (data:any) => {

		companyUpdate(data)

		formChangeB		= false
		buttonLoadingB	= false
	}
	const onSuccessSD = (data:any) => {

		companyUpdate(data)

		formChangeSD	= false
		buttonLoadingSD	= false
	}
	const onSuccessBH = (data:any) => {

		companyUpdate(data)

		formChangeBH	= false
		buttonLoadingBH	= false
	}

	const onFailureB = (message:any) => {

		errorB = message.errorCompany.message

		buttonResetB()
	}
	const onFailureSD = (message:any) => {

		if		(message.errorCompany)		errorSD = message.errorCompany.message
		else if	(message.errorAddress)		errorSD = message.errorAddress.message
		else if	(message.errorApplication)	errorSD = message.errorApplication.message

		buttonResetSD()
	}
	const onFailureBH = (message:any) => {

		if		(message.errorCompany)		errorBH = message.errorCompany.message
		else if	(message.errorApplication)	errorBH = message.errorApplication.message

		buttonResetBH()
	}

	$: if (browser && company == null && $c) company = c.get($account.active.id)

	onMount(() => {

		let i = 0;

		const check = setInterval(() => {

			if (i > 10) {
				
				console.error('application not found')
				
				clearInterval(check)
			}

			i++

			if ($company && $company.merchantApplicationDetails) {

				const status = $company.merchantApplicationDetails.status

				inReview	= ['STARTED', 'READY'].includes(status) || !status ? false : true
				show		= true

				clearInterval(check)
			}

		}, 100)
	})

</script>



{#if show}

	<div class="wrapper-shop-details">

		<div class="image">
			
			<ImageUpload {formElement} label="Shop Image" src={$company?.image} application />

		</div>

		<Form action="/account?/applicationShopDetails" bind:submit={formSubmitB} bind:element={formElement} bind:change={formChangeB} onSuccess={onSuccessB} onFailure={onFailureB} error={errorB} gap="1.5rem" application>

			<input type="hidden" name="companyId" value={$company?.id ?? ''} />
			<input type="hidden" name="form" value="b" />
			<textarea name="bio" placeholder="Shop Bio - this is what your customers will read to learn more about you" rows="5" value={$company?.bio ?? ''}></textarea>
			<div class="submit-button">
				<div>
				
					<Button formSubmit={formSubmitB} bind:reset={buttonResetB} disabled={!formChangeB} bind:loading={buttonLoadingB} application>Save</Button>
				
				</div>
			</div>

		</Form>

		<Form action="/account?/applicationShopDetails" bind:submit={formSubmitSD} bind:change={formChangeSD} onSuccess={onSuccessSD} onFailure={onFailureSD} error={errorSD} application>

			<input type="hidden" name="companyId" value={$company?.id ?? ''} />
			<input type="hidden" name="addressId" value={$company?.addresses[0]?.id ?? ''} />
			<input type="hidden" name="business_email" value={$company?.email ?? ''} />
			<input type="hidden" name="force" value="true" />
			<input type="hidden" name="form" value="sd" />

			<BlockWrapper {company} {inReview} required={['name','phoneNumber','address_address1','address_city','address_state','address_zipCode']}>

				<svelte:fragment slot="label">Seller Details</svelte:fragment>

				<input type="text" name="name" placeholder="Shop Name - doing business as (DBA) name" value={$company?.name ?? ''} disabled={inReview} />
				<input type="text" name="business_legalName" placeholder="Shop Legal Name - if not DBA name" value={$company?.merchantApplicationDetails?.application?.business?.legalName ?? ''} disabled={inReview} />
				<input type="text" name="phoneNumber" placeholder="Shop Phone Number" value={formatPhone($company?.phoneNumber ?? '')} on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:blur={format.phoneNumber} disabled={inReview} />
				<input type="text" name="address1" placeholder="Shop Legal Address - physical address" value={$company?.addresses[0]?.address1 ?? ''} disabled={inReview} />
				<input type="text" name="address2" placeholder="Apt. #, Unit #, etc. (optional)" value={$company?.addresses[0]?.address2 ?? ''} disabled={inReview} />
				<div class="row">
					<input type="text" name="city" placeholder="City" value={$company?.addresses[0]?.city ?? ''} disabled={inReview} />
					<div>
						<Select list="states" name="state" value={$company?.addresses[0]?.state ?? ''} disabled={inReview} />
					</div>
				</div>
				<input type="text" name="zipCode" placeholder="Zip Code" value={$company?.addresses[0]?.zipCode ?? ''} on:click={format.zipCode} on:keydown={format.zipCode} on:blur={format.zipCode} disabled={inReview} />
				
				<svelte:fragment slot="submit-button">

					{#if !inReview}
					
						<Button formSubmit={formSubmitSD} bind:reset={buttonResetSD} disabled={!formChangeSD} bind:loading={buttonLoadingSD} application>Save</Button>

					{/if}
					
				</svelte:fragment>

			</BlockWrapper>

		</Form>

		<Form action="/account?/applicationShopDetails" bind:submit={formSubmitBH} bind:change={formChangeBH} onSuccess={onSuccessBH} onFailure={onFailureBH} error={errorBH} application>

			<input type="hidden" name="companyId" value={$company?.id ?? ''} />
			<input type="hidden" name="form" value="bh" />

			<BlockWrapper {company} {inReview} required={['business_timeZoneCode']}>

				<svelte:fragment slot="label">Business Hours</svelte:fragment>

				<Select list="time-zones" name="business_timeZoneCode" value={$company?.merchantApplicationDetails?.application?.business?.timeZoneCode ?? ''}  disabled={inReview} />

				<input type="text" name="operatingHours" placeholder="Shop Hours - example: Mon - Fri 9:00am - 5:00pm" value={$company?.operatingHours ?? ''} disabled={inReview} />
				
				<svelte:fragment slot="submit-button">

					{#if !inReview}
					
						<Button formSubmit={formSubmitBH} bind:reset={buttonResetBH} disabled={!formChangeBH} bind:loading={buttonLoadingBH} application>Save</Button>
					
					{/if}

				</svelte:fragment>

			</BlockWrapper>

		</Form>

	</div>

{/if}



<style lang="sass">

	.wrapper-shop-details
		@include flex-col(4rem)

		.image
			margin: 0 auto
			width: 50%

		.submit-button
			width: 100%

			> div
				float: right
				width: 8rem

		.row
			@include flex-col(1.5rem)


	@media (min-width: #{breakpoint('sm')})

		.wrapper-shop-details

			.row
				@include flex-row-middle(1.5rem)

				> *
					flex: 1


	@media (min-width: #{breakpoint('md')})

		.wrapper-shop-details
			padding: 4rem 0


	@media (min-width: #{breakpoint('lg')})

		.wrapper-shop-details
			margin: 0 auto
			max-width: #{breakpoint('sm')}


	@media (min-width: #{breakpoint('xl')})

		.wrapper-shop-details
			max-width: #{breakpoint('md')}

</style>