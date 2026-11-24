<script lang="ts">

	import { PUBLIC_ENV } from '$env/static/public'
	// import { capitalize } from 'src/lib/helpers'
	// import A from 'src/components/elements/a.svelte'
	// import Icon from 'src/components/elements/icon/element.svelte'
	// import Button from 'src/components/elements/button.svelte'
	// import Toggle from 'src/components/elements/toggle.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
   

	const toggled: boolean = true

	console.log({toggled})

</script>



{#if PUBLIC_ENV == 'local'}

	<main class="container">

		<div id="sandbox">

			<Textarea rte application />

		</div>

		<!-- <div id="flex">
			<div>1</div>
			<div>2</div>
			<div>3</div>
		</div> -->

		<!-- <div id="absolute">
			<div>x</div>
		</div> -->

		<!-- <div id="icon">
			<span>
				<Icon name="trash" size="12rem" />
			</span>
		</div> -->

		<!-- <div id="button"> -->

			<!-- <Button round outline>x</Button> -->

			<!-- <button role="link">Test Button</button>
			<br>
			<button class="inverse" role="link">Test Button Inverse</button>
			<br>
			<a href="#" class="danger">Test Anchor</a>
			<br>
			<a href="#" class="inverse">Test Anchor Inverse</a> -->
			
		<!-- </div> -->

		<!-- <div id="form">
			<form>
				<input type="text" name="text" placeholder="Text" aria-label="Text" />
				<input type="email" name="email" placeholder="Email" aria-label="Email" autocomplete="email" />
				<input type="number" name="number" placeholder="Number" aria-label="Number" />
				<input type="password" name="password" placeholder="Password" aria-label="Password" />
				<input type="tel" name="tel" placeholder="Tel" aria-label="Tel" autocomplete="tel" />
				<input type="url" name="url" placeholder="Url" aria-label="Url" />
				<textarea name="bio" placeholder="Write a professional short bio..." aria-label="Professional short bio"></textarea>
				<select name="favorite-cuisine" aria-label="Select your favorite cuisine..." required>
					<option selected disabled value="">
						Select your favorite cuisine...
					</option>
					<option>Italian</option>
					<option>Japanese</option>
					<option>Indian</option>
					<option>Thai</option>
					<option>French</option>
				</select>
				<fieldset>
					<legend>Language preferences:</legend>
					<label>
						<input type="checkbox" name="english" checked />
						English
					</label>
					<label>
						<input type="checkbox" name="french" />
						French
					</label>
					<label aria-disabled="true">
						<input type="checkbox" name="dothraki" disabled />
						Dothraki
					</label>
				</fieldset>
				<fieldset>
					<legend>Language preference:</legend>
					<label>
						<input type="radio" name="language" checked />
						English
					</label>
					<label>
						<input type="radio" name="language" />
						French
					</label>
					<label>
						<input type="radio" name="language" />
						Mandarin
					</label>
					<label>
						<input type="radio" name="language" />
						Thai
					</label>
					<label aria-disabled="true">
						<input type="radio" name="language" disabled />
						Dothraki
					</label>
				</fieldset>
				<fieldset>
					<label>
						<input name="terms" type="checkbox" role="switch" />
						I agree to the Terms
					</label>
					<label>
						<input name="opt-in" type="checkbox" role="switch" checked />
						Receive news and offers
					</label>
				</fieldset>
				<label>
					Brightness
					<input type="range" />
				</label>
			</form>
		</div> -->

	</main>

{/if}



<style lang="sass">

	main
		display: flex
		flex-direction: column
		align-items: center
		gap: 1rem
		padding: 1rem
		background-color: black

		> div
			overflow: scroll
			@include area(500px)


	#sandbox
		min-height: 4rem
		padding: 1rem
		@include background(var(--cm-background))

	// #flex
	// 	justify-content: space-between
	// 	@include background(red)
	// 	@include flex-col

	// 	div
	// 		// width: 100px
	// 		text-align: center
	// 		// @include area(100px)
	// 		@include border(blue)
	// 		@include background(white)

	// #absolute
	// 	position: relative
	// 	@include background(red)

	// 	div
	// 		@include absolute-center
	// 		// @include area(100px)
	// 		@include border(blue)
	// 		@include background(white)

	// #icon
	// 	position: relative
	// 	@include background(red)
	// 	color: #0f0

	// 	span:first-child
	// 		width: 100%
	// 		@include border(white)
	// 		@include absolute-middle-center

		// 	svg
		// 		color: white
		// 		stroke: white
		// 		fill: white

	// #button
	// 	position: relative
	// 	padding: 2rem
	// 	@include background(white)

	// 	button
			// font-size: 2rem
			// text-shadow: -.5px .5px #000, .5px .5px #000, .5px -.5px 0 #000, -.5px -.5px 0 #000
			// letter-spacing: 2px
			// font-size: 1.5rem

	// #form
	// 	position: relative
	// 	padding: 2rem
	// 	@include background(red)

	// 	form
	// 		padding: 2rem
	// 		@include background(#FBFCF7)
	// 		@include flex-col(.5rem)

	// 		fieldset
	// 			@include flex-col(.25rem)

	// 		legend
	// 			margin-bottom: .25rem

	// 		label
	// 			// background-color: red

</style>