<script lang="ts">

	import { formatPhone } from 'src/lib/helpers'
	import { format } from 'src/lib/validate'
	import { layout } from 'src/stores/layout'
	import Select from 'src/components/elements/select.svelte'
	import Button from 'src/components/elements/button.svelte'
	import Icon from 'src/components/elements/icon/element.svelte'



	export let owner:					any											= {}
	export let index:					number
	export let totalStakePercentage:	(v:string,t:HTMLInputElement|null)=>void
	export let onRemove:				()=>void
	export let inReview:				boolean

	$: width	= $layout.width
	$: isXSmall	= layout.compare(width, '<', 'sm')

</script>

<div class="wrapper">

	{#if isXSmall}

		<div class="row">
			<input type="text" name="owners_firstName_{index}" placeholder="First Name" value={owner?.firstName ?? ''} disabled={inReview} />

			{#if !inReview}

				<div class="remove">

					<Button action={onRemove} wrapper>

						<Icon name="trash" size="1.5rem" c="application-owner-remove-icon" />

					</Button>

					<span style="display:contents"></span>
				</div>

			{/if}
			
		</div>
		<input type="text" name="owners_lastName_{index}" placeholder="Last Name" value={owner?.lastName ?? ''} disabled={inReview} />

	{:else}

		<div class="row">
			<input type="text" name="owners_firstName_{index}" placeholder="First Name" value={owner?.firstName ?? ''} disabled={inReview} />
			<input type="text" name="owners_lastName_{index}" placeholder="Last Name" value={owner?.lastName ?? ''} disabled={inReview} />

			{#if !inReview}

				<div class="remove">

					<Button action={onRemove} wrapper>

						<Icon name="trash" size="1.5rem" c="application-owner-remove-icon" />

					</Button>

					<span style="display:contents"></span>
				</div>

			{/if}

		</div>

	{/if}

	<input type="text" name="owners_phone_{index}" placeholder="Phone Number" value={formatPhone(owner?.phone ?? '')} on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:paste={format.phoneNumber} on:input={format.phoneNumber} on:blur={format.phoneNumber} disabled={inReview} />
	<input type="text" name="owners_socialSecurity_{index}" placeholder="Social Security" value={owner?.socialSecurity ?? ''} on:click={format.socialSecurityNumber} on:keydown={format.socialSecurityNumber} on:paste={format.socialSecurityNumber} on:input={format.socialSecurityNumber} on:blur={format.socialSecurityNumber} disabled={inReview} />
	<input type="text" name="owners_address_address1_{index}" placeholder="Home Address" value={owner?.address?.address1 ?? ''} disabled={inReview} />
	<input type="text" name="owners_address_address2_{index}" placeholder="Apt. #, Unit #, etc. (optional)" value={owner?.address?.address2 ?? ''} disabled={inReview} />
	
	{#if isXSmall}

		<input type="text" name="owners_address_city_{index}" placeholder="City" value={owner?.address?.city ?? ''} disabled={inReview} />
		<div>

			<Select list="states" name="owners_address_state_{index}" value={owner?.address?.state ?? ''} disabled={inReview} />

		</div>

	{:else}
	
		<div class="row">
			<input type="text" name="owners_address_city_{index}" placeholder="City" value={owner?.address?.city ?? ''} disabled={inReview} />
			<div>

				<Select list="states" name="owners_address_state_{index}" value={owner?.address?.state ?? ''} disabled={inReview} />

			</div>
		</div>

	{/if}

	<input type="text" name="owners_address_zipCode_{index}" placeholder="Zip Code" value={owner?.address?.zipCode ?? ''} on:click={format.zipCode} on:keydown={format.zipCode} on:paste={format.zipCode} on:input={format.zipCode} on:blur={format.zipCode} disabled={inReview} />
	<input type="text" name="owners_birthDate_{index}" placeholder="Date of Birth" value={owner?.birthDate ?? ''} on:click={format.date} on:keydown={format.date} on:paste={format.date} on:input={format.date} on:blur={format.date} disabled={inReview} />
	<input type="text" name="owners_email_{index}" placeholder="Email" value={owner?.email ?? ''} on:click={format.email} on:keydown={format.email} on:paste={format.email} on:input={format.email} on:blur={format.email} disabled={inReview} />
	<input type="text" name="owners_stakePercentage_{index}" placeholder="Stake Percentage" value={owner?.stakePercentage ?? ''} on:click={(e) => format.stakePercentage(e, totalStakePercentage)} on:keydown={(e) => format.stakePercentage(e, totalStakePercentage)} on:paste={(e) => format.stakePercentage(e, totalStakePercentage)} on:input={(e) => format.stakePercentage(e, totalStakePercentage)} on:blur={(e) => format.stakePercentage(e, totalStakePercentage)} disabled={inReview} />
</div>

<style lang="sass">

	:global(.application-owner-remove-icon)

		&:hover
			transition: all var(--pico-transition)
			color: red

	.wrapper
		width: 100%
		padding: 1.5rem 0
		border-top: 1px solid var(--cm-border)
		@include flex-col(1.5rem)

	.row
		@include flex-row-middle(1.5rem)

		> *
			flex: 1

		.remove
			flex: 0
			min-width: 2.2rem
			@include flex-col-center

</style>