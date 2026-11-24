<script lang="ts">

	import { user } from 'src/stores/user'
	import Form from 'src/components/elements/form.svelte'



	export let formSubmit:	(()=>boolean)
	export let onSuccess:	((resultData:any)=>void)
	export let onFailure:	((error: any)=>void)
	export let formChange:	boolean
	export let name:		string

	let email:		string	= $user.email,
		newEmail:	string	= ''

	const onChange = () => {

		const selector	= document.querySelector('#email-selector') as HTMLDivElement
		const target	= selector.querySelector('input:checked') as HTMLInputElement

		if	(target.value == 'new')	email = newEmail
		else						email = $user.email
	}

	const onFocus = () => {

		const radio = document.querySelector('input[value="new"]') as HTMLInputElement

		if (radio) radio.checked = true
		
		onChange()
	}

	$: if (email)	formChange = true
	else			formChange = false

</script>



<div class="label">
	<span>Let's create your shop</span>
	<span>Would you like to use your personal email or a new company email?</span>
</div>

<Form action="/register?/existinguser" bind:submit={formSubmit} {onSuccess} {onFailure} style="display:none" application>

	<input type="hidden" name="name" bind:value={name} />
	<input type="hidden" name="email" bind:value={email} />

</Form>

<div id="email-selector" class="radio-group" on:change={onChange}>
	<label>
		<input type="radio" name="email_choice" value="existing" checked>
		<div>
			<span>{$user.email}</span>
		</div>
	</label>
	<label>
		<input type="radio" name="email_choice" value="new">
		<div>
			<input type="email" name="email" class="application" placeholder="New Email" autocomplete="email" bind:value={newEmail} on:focus={onFocus} on:keydown={() => formChange = true} />
		</div>
	</label>
</div>



<style lang="sass">

	.label

		> span
			display: block

			&:first-child
				margin-bottom: 1.5rem
				font-size: 3rem
				font-weight: 600

			&:last-child
				font-size: 1.5rem
				font-weight: 400
				line-height: 1.2
				color: var(--cm-text-secondary)

	.radio-group
		@include flex-col(2rem)

		label
			cursor: pointer
			@include flex-row-middle(1rem)

			> input
				margin: 0
				border-radius: 50%
				background-color: #F9F9F9
				@include min-area(20px)

				&:where(:checked, :active, :focus)
					border-color: #FFFFFF
					outline: var(--pico-border-width) solid #468047
					background-color: #468047

			div

				> span
					padding: 1rem
					font-size: 1.25rem
					font-weight: 400
					font-style: italic
					color: var(--cm-text-secondary)


	@media (min-width: #{breakpoint('lg')})

		.label

			> span

				&:first-child
					font-size: 2.5rem

				&:last-child
					font-size: 1.15rem


	@media (min-width: #{breakpoint('xl')})

		.label

			> span

				&:first-child
					font-size: 3rem

				&:last-child
					font-size: 1.5rem

</style>