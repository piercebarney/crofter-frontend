<script lang="ts">

	import type { ActionResult } from '@sveltejs/kit'
	type ErrorGroup = Record<string,string>

	import { reporter, type ErrorReport } from 'src/lib/reporter/module'
	import { enhance } from '$app/forms'
	import { modal } from 'src/features/modules/modal/store'
	import { classes } from 'src/lib/helpers'
	import P from 'src/components/elements/p.svelte'
	import Button from 'src/components/elements/button.svelte'



	// attributes
	export let id: string|undefined		= undefined
	export let method: "dialog" | "get" | "post" | "DIALOG" | "GET" | "POST" | null | undefined = 'post'
	export let action: string|undefined	= undefined
	export let style: string|undefined	= undefined

	// options
	export let gap: string						= '.75rem'
	export let auth: boolean					= false
	export let application: boolean				= false
	export let errorMessageDisabled: boolean	= false

	// function
	export let element: HTMLFormElement|null						= null	
	export let onSuccess: ((resultData:any)=>void)|null				= null
	export let onFailure: ((message:ErrorGroup|string)=>void)|null	= null
	export let onFinal: (()=>void)|null								= null
	export let onDelete: (()=>void)|null							= null
	export let change: boolean										= false

	// data
	export let data: any										= null
	export let error: ErrorGroup|string|boolean|undefined|null	= null
	export let submitText: string|undefined						= undefined

	export const submit: (()=>boolean) = () => {
		
		submitElement.click()

		element?.querySelectorAll('.form-error-input').forEach(e => e.classList.remove('form-error-input'))

		removeGroupError()

		const inputs = Array.from(element?.querySelectorAll('input, textarea, select') || [])

		let pass = true

		if (inputs) {

			for (const i of inputs) {

				const input = i as HTMLInputElement

				if (input.hasAttribute('required') && !input.checkValidity()) {

					pass = false
					
					break
				}
			}
		}

		return pass
	}
	
	let submitElement:	HTMLElement

	const reportError = reporter({type:'error', file:'/src/components/elements/form.svelte'})

	const success = (resultData:any) => {

		data = resultData

		modal.set({formChange:false})

		if (onSuccess) onSuccess(resultData)
	}

	const parseError = (error:any) => {

		const message:string[] = []

		if (Array.isArray(error)) {

			for (const e of error) {

				if		(e.message)	message.push(e.message)
				// else if	(e.detail)	message.push(e.detail)
				else				message.push('Unknown error')
			}
			
		} else {

			if		(error.message)	message.push(error.message)
			// else if	(error.detail)	message.push(error.detail)
			else					message.push('Unknown error')
		}	

		return { message:message.join(' | '), error }
	}

	const failure = (errorData:ErrorReport|ErrorGroup|string) => {
	// const failure = (errorData:ErrorGroup|string) => {

		// console.log(errorData)

		if (typeof errorData == 'object' && errorData.hasOwnProperty('_type')) {

			error = 'Please fill out all required fields.'

			addGroupError(errorData as ErrorGroup)

		} else if (Array.isArray(errorData)) {

			error = errorData.map((e:any) => e.message).join(', ')
		
		} else {

			if (typeof errorData == 'object' && 'message' in errorData && typeof errorData.message == 'string') {

				error = errorData.message

			} else {
				
				if (typeof errorData == 'string') {

					error = errorData

					reportError({
						message		: errorData,
						action,
						location	: 'form > submit > failure'
					})

				} else {

					const errorReport = errorData as ErrorReport

					const { message } = parseError(errorReport)

					reportError({
						message		: message ?? 'An unknown error occurred submitting a form.',
						action,
						location	: 'form > submit > failure',
						raw			: errorReport
					})
					
					error = 'An unknown error occurred.'
				}
			}
		}

		if (onFailure) onFailure(error)
	}

	const enhancement = () => async ({ result }:{result:ActionResult}) => {

		// console.log('form > enhancement', result)

		error = null

		if (result.type == 'success' && result.data) {

			if		(result.data.error)	failure(result.data.error)
			else if (result.data.data)	success(result.data.data)
			else						failure('An unknown error occured.')
		
		} else {
			
			if	(result.type == 'failure' && result.data)	failure(result.data.error)
			else											failure('An unknown error occured.')
		}

		if (onFinal) onFinal()
	}

	const addGroupError = (error:ErrorGroup) => {

		if (element) {

			Object.keys(error).forEach(value => {

				if (value == '_image') {

					const inputElement = element?.querySelector('.image-drop-wrapper')

					inputElement?.classList.add('form-error-input')

				} else if (value.includes('_tinymce')) {

					const inputElement = element?.querySelector(`[name="${value.replace('_tinymce-', '')}"]`)

					inputElement?.parentElement?.querySelector('div.tox-tinymce')?.classList.add('form-error-input')

				} else if (value.includes('_check')) {

					const inputElement = element?.querySelectorAll(`[name="${value.replace('_check-', '')}"] > input`)

					inputElement?.forEach(iE => iE.classList.add('form-error-input'))
					
				} else if (value != '_type') {

					const inputElement = element?.querySelector(`[name="${value}"]`) as HTMLInputElement

					inputElement?.classList.add('form-error-input')

					if (inputElement?.type != 'hidden') {

						// Create wrapper
						const wrapper = document.createElement('div')

						wrapper.className = 'form-error-input-group'
						
						// Create error message
						const errorMessage = document.createElement('span')

						errorMessage.className		= 'form-error-message'
						errorMessage.textContent	= error[value]
						
						// Clone input and move to wrapper
						const newInput = inputElement?.cloneNode(true)

						if (newInput) {

							wrapper.appendChild(newInput)
							wrapper.appendChild(errorMessage)
							
							// Replace original input with wrapper
							inputElement?.replaceWith(wrapper)
						}
					}
				}
			})
		}
	}

	const removeGroupError = () => {

		element?.querySelectorAll('.form-error-input-group').forEach(group => {

			// Get the input from inside the group
			const input = group.querySelector('input, textarea, select')

			if (input) {

				// Remove the error class
				input.classList.remove('form-error-input')

				// Replace the group with just the input
				group.replaceWith(input)
			}
		})
	}

	$: if (element && gap) element.style.gap = gap

	$: _ = classes({auth}, {application})

</script>



{#if onSuccess || onFailure || onFinal}

	<form {id} {method} {action} class={_} bind:this={element} use:enhance={enhancement} enctype="multipart/form-data" {style}>
		<div role="none" class="form-input-wrapper" on:keyup={() => change = true} on:change={() => change = true} style="display: contents;">
			
			<slot />

		</div>

		{#if !errorMessageDisabled && error && typeof error == 'string'}

			<P danger center background={auth}>{error}</P>
		
		{/if}

		<button type="submit" bind:this={submitElement} style={submitText ? 'display:block' : 'display:none'}>{submitText ? submitText : 'Submit'}</button>
	</form>

{:else}

	<form {id} {method} {action} bind:this={element} class={_} enctype="multipart/form-data" {style}>
		<div role="none" class="form-input-wrapper" on:keyup={() => change = true} on:change={() => change = true} style="display: contents;">

			<slot />

		</div>

		{#if !errorMessageDisabled && error && typeof error == 'string'}

			<P danger center background={auth}>{error}</P>
		
		{/if}

		<button type="submit" bind:this={submitElement} style={submitText ? 'display:block' : 'display:none'}>{submitText ? submitText : 'Submit'}</button>	
	</form>

{/if}

{#if onDelete}

	<div class="delete-button-wrapper">
		
		<Button action={onDelete} c="danger" role="link">Delete</Button>

	</div>

{/if}



<style lang="sass">

	:global(.form-error-input-group)
		position: relative
		margin-bottom: 1rem
		width: 100%

	:global(.form-error-message)
		color: var(--cm-danger) !important
		bottom: -1.25rem !important
		@include absolute-bottom

	:global(.form-error-input)
		border-color: var(--cm-danger) !important

	:global(form .form-row)
		width: 100%
		@include flex-row-top(.75rem)

	:global(form .form-row > *)
		flex: 1 1 0 !important
		min-width: 0 !important
		
	form
		width: 100%
		@include flex-col-left

	.delete-button-wrapper
		z-index: 2
		@include absolute-top-left(1rem)

</style>