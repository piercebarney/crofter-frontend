<script lang="ts">

	import { user } from 'src/stores/user'
	import { modal as m } from 'src/features/modules/modal/store'
	import { cardTypes } from 'src/lists/card-types'
	import Button from 'src/components/elements/button.svelte'



	export let modal:	any		= null
	export let single:	boolean	= false
	export let valid:	boolean	= false
	export let message:	string	= ''

	$: if (!modal) modal = m

	const currentDate	= new Date()
	const currentYear	= currentDate.getFullYear()
	const currentMonth	= currentDate.getMonth() + 1 // Months are 0-indexed

	let cardType:		string,
		accountNumber:	string,
		expiration:		string

	$: paymentToken = $user.paymentToken

	$: if (paymentToken) {

		const expMonth		= parseInt(paymentToken.expiration.slice(0,2))
		const expYear		= parseInt(paymentToken.expiration.slice(2,4))
		const fullExpYear	= 2000 + expYear

		cardType		= cardTypes.titleById(paymentToken.accountType)
		accountNumber	= `••••${paymentToken.maskedNumber.substring(paymentToken.maskedNumber.length-4, paymentToken.maskedNumber.length)}`
		expiration		= `${expMonth}/${expYear}`
		valid			= (fullExpYear > currentYear || (fullExpYear === currentYear && expMonth >= currentMonth))
		message			= ''

		if (!valid) message = 'expired'
	}

</script>



<div class="list">

	{#if paymentToken}
		
		<div class="cm-list-item payment-info">
			<div>
				<div><b>{cardType}</b></div>
				<div>{accountNumber}</div>
				<div>{expiration}</div>
			</div>
			<!-- <div>

				<Button action={() => modal.open('payment-info-update', {caller})} c="inverse" role="link">Edit</Button>

			</div> -->
		</div>
		<div class="cm-list-item">

			<Button action={() => modal.open('payment-info-add', {label:'Replace Payment Method'})} c="inverse" role="link">Replace Payment Method</Button>

		</div>

	{:else}

		<div class="cm-list-item add-payment-info-button">

			{#if single}

				<Button action={() => modal.open('payment-info-add')} thin>Add Payment Method</Button>

			{:else}

				<div>

					<Button action={() => modal.open('payment-info-add')} thin>Add Payment Method</Button>

				</div>

			{/if}

		</div>

	{/if}

</div>



<style lang="sass">

	.payment-info		
		align-items: center
		gap: var(--main-inner-gap)
		@include flex-row

		> div:first-child
			@include flex-col-left(.5rem)

		> div:last-child
			flex-grow: 0

	.add-payment-info-button
		
		> div
			margin: 3rem auto 0
			width: fit-content

</style>