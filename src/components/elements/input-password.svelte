<script lang="ts">

	import { browser } from '$app/environment'



	// attribute
	export let id:			string|undefined	= undefined
	export let name:		string				= 'password'
	export let placeHolder:	string				= 'Password'

	// options
	// export let re:			boolean = false
	export let signup:		boolean	= false
	export let auth:		boolean = false
	export let required:	boolean = true

	let password:		HTMLElement,
		// repassword:		HTMLElement,
		text:			string						= 'SHOW',
		placeholder:	string,
		autocomplete:	AutoFill | null | undefined

	const visibility = () => {

		if (browser) {

			if (text == 'SHOW') {
			
				text = 'HIDE'
				password.setAttribute('type', 'text')
				
				// if (re || signup) repassword.setAttribute('type', 'text')

			} else {

				text = 'SHOW'
				password.setAttribute('type', 'password')
				
				// if (re || signup) repassword.setAttribute('type', 'password')
			}
		}
	}

	$: placeholder = `${signup ? '*' : ''}${placeHolder}`
	$: autocomplete = signup ? 'new-password' : 'current-password'

	$: _ = auth ? 'auth' : undefined

</script>



<div class="wrapper">
	<input {id} type="password" {name} class={_} {placeholder} bind:this={password} {autocomplete} {required} />
	<span role="none" on:click={visibility} on:keypress={visibility}>{text}</span>
</div>

<!-- {#if re || signup}

	<input type="password" name={`repassword`} placeholder={replaceholder} bind:this={repassword} required />

{/if} -->



<style lang="sass">

	.wrapper
		position: relative
		width: 100%

		input
			padding-right: 7rem

		input:autofill + span,
		input:-webkit-autofill + span
			color: var(--cm-text)

		span
			cursor: pointer
			@include absolute-middle-right(2rem)

		span:hover :global(svg)
			stroke: var(--color)

</style>