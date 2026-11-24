<script lang="ts">

	import { browser } from '$app/environment'
	import { search } from 'src/features/groups/search/store'



	let zipCodeElement: HTMLInputElement,
		textIsSelected:	boolean				= false

	const init = () => {

		if (zipCodeElement) zipCodeElement.value = ''
	}

	const key = (e:KeyboardEvent) => {

		if (zipCodeElement) {

			const text	= zipCodeElement.value
			const key	= e.key

			if (key == 'Enter') {
				
				e.preventDefault()
				
				zipCodeElement.blur()
			
			} else if ((text.length >= 5 && !textIsSelected) || !/^\d+$/.test(key)) {
				
				e.preventDefault()

				textIsSelected = false
			}
		
		} else e.preventDefault()
	}

	const selected = () => {

		if (browser) {
			
			const selection = window.getSelection()

			if	(selection && selection.type == 'Range')	textIsSelected = true
			else											textIsSelected = false
		}
	}

	const update = () => {

		if (zipCodeElement) {
			
			const text = zipCodeElement.value

			if	(text.length != 5 || !/^\d+$/.test(text))	zipCodeElement.value = zipCode
			else											search.set({enteredZipCode:text})
		}

		zipCodeElement.classList.remove('active')
	}

	$: zipCode = $search.zipCode ? $search.zipCode : 'Zip Code'

</script>



<div class="zip-code-wrapper">

	<input type="text" placeholder="Zip Code" value={zipCode} bind:this={zipCodeElement} on:focus={init} on:keypress={(e) => key(e)} on:keyup={selected} on:mouseup={selected} on:blur={update}/>

</div>



<style lang="sass">

	.zip-code-wrapper
		height: 100%
		width: 5rem
		@include flex-col-middle

		input
			width: 100%
			padding: .5rem .25rem
			text-align: center

</style>
