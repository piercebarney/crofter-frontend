import type { ImageUpload } from 'src/features/modules/image-upload/types'

import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import { snakeCase } from 'src/lib/helpers'



const values: ImageUpload = {
	form		: null,
	input		: null,
	inputName	: null,
	name		: null,
	src			: null,
	status		: {
					error		: null,
					processing	: false,
					success		: null
				}
}

const { subscribe, update } = writable(values)

const imageWidth	= 1280
const imageHeight	= 720
const imageQuality	= .9

const __getDimensions = async (file:File) => {

	const image		= new Image()
	const reader	= new FileReader()
	const promise	= new Promise((resolve) => {
		
		image.onload = () => {
			
			resolve({width:image.naturalWidth, height:image.naturalHeight})
		}
	})

	reader.readAsDataURL(file)
	reader.onload = (e) => image.src = e.target ? e.target.result as string : ''

	return await promise as {width:number, height:number} 
}

const __compressImage = async (file:File, {width = imageWidth, height = imageHeight, quality = imageQuality, type = 'image/jpeg'}:{width?:number, height?:number, quality?:number, type?:string}): Promise<File|null> => {

	const imageBitmap	= await createImageBitmap(file)
	const canvas		= document.createElement('canvas')
	const hRatio		= width / imageBitmap.width

	height = imageBitmap.height * hRatio

	const vRatio		= height / imageBitmap.height
	const ratio			= Math.max ( hRatio, vRatio )
	const centerShift_x	= (width - (imageBitmap.width * ratio)) / 2
	const centerShift_y	= (height - (imageBitmap.height * ratio)) / 2

	canvas.width	= width
	canvas.height	= height

	const ctx = canvas.getContext('2d')

	if (ctx) {

		ctx.fillStyle = "#FFF"
		ctx.fillRect(0, 0, width, height)
		ctx.drawImage(imageBitmap, 0, 0, imageBitmap.width, imageBitmap.height, centerShift_x, centerShift_y, imageBitmap.width * ratio, imageBitmap.height * ratio)

		const blob: Blob = await new Promise((resolve) => {
			
			canvas.toBlob(resolve as BlobCallback, type, quality)
		})

		return new File([blob], file.name, {type: blob.type})
	}

	return null
}

const clear = (clearAll = true) => {

	const $image: ImageUpload = get({subscribe})

	if ($image.input) {
		
		$image.input.value = ''

		$image.form?.querySelector(`input[name="${$image.inputName}"]`)?.remove()
	}
	
	update((v:ImageUpload) => {

		v.form		= null
		v.inputName	= null
		v.name		= null
		v.src		= null

		if (clearAll) {

			v.status	= {
							error		: null,
							processing	: false,
							success		: null
						}
		}

		return v
	})
}

const select = (formElement:HTMLFormElement, inputName:string, name:string|null = null) => {
		
	const $image: ImageUpload = get({subscribe})

	if ($image.input) {

		update((v:ImageUpload) => { 
			
			v.form		= formElement
			v.inputName	= inputName
			v.name		= name ? snakeCase(name) : null
			
			return v 
		})
		
		$image.input.click()
	}
}

const drop = (formElement:HTMLFormElement, inputName:string, e:DragEvent) => {

	const dT = e.dataTransfer

	if (dT) {
		
		const file			= dT.files[0]
		const dataTransfer	= new DataTransfer()

		if (file instanceof File) {

			const type = file.type

			if (type == 'image/png' || type == 'image/jpeg') {

				dataTransfer.items.add(file)

				update((v:ImageUpload)=> {
				
					v.form		= formElement
					v.inputName	= inputName

					if (v.input) v.input.files = dataTransfer.files
	
					return v				
				})

				process()

			} else {
				
				update((v:ImageUpload) => {
			
					v.status	= {
									error		: `Images must have an .png, .jpg, or .jpeg extention.`,
									processing	: false,
									success		: false
								}
					
					return v
				})
			
				clear(false)
			}
		}
	}
}

const process = async () => {

	update((v:ImageUpload) => {
		
		v.status	= {
						error		: null,
						processing	: true,
						success		: null
					}
		
		return v
	})

	const $image: ImageUpload = get({subscribe})
	
	const input = $image.input

	if (input && input.files?.length && input.files[0].type.startsWith('image')) {

		// make sure image isn't too small

		const file			= input.files[0]
		const dimensions	= await __getDimensions(file)

		if (dimensions.width >= imageWidth && dimensions.height >= imageHeight) {
			
			// resize image

			const dataTransfer		= new DataTransfer()
			const compressedFile	= await __compressImage(file, {})

			if (compressedFile) dataTransfer.items.add(compressedFile)

			update((v:ImageUpload)=> {
				
				if (v.input) v.input.files = dataTransfer.files

				return v				
			})

			const input = $image.input

			if (input && input.files?.length && input.files[0].type.startsWith('image')) {

				// add image to form
				
				const reader	= new FileReader()
				const imageFile	= input.files[0]

				try {

					reader.readAsDataURL(imageFile)

					reader.onload = (e) => update((v:ImageUpload) => { v.src = e.target ? e.target.result as string : null; return v })

					if ($image.form && $image.inputName) {

						$image.form.querySelectorAll(`input[name="${$image.inputName}"]`).forEach(element => element.remove())
					
						const clone = input.cloneNode() as HTMLInputElement

						clone.setAttribute('name', $image.inputName)

						// Note: Safari does not preserve file input value on clone for security reasons
						// Ensure the file data is preserved in form submission
						if (input.files && input.files.length > 0) {

							const dataTransfer = new DataTransfer()

							for (let i = 0; i < input.files.length; i++) {

								dataTransfer.items.add(input.files[i])

							}

							clone.files = dataTransfer.files
						}

						const inputWrapper = $image.form?.querySelector('.form-input-wrapper')
						
						inputWrapper?.appendChild(clone)

						const event = new Event('change')

						inputWrapper?.dispatchEvent(event)

						update((v:ImageUpload) => {
			
							v.status = {
										error		: null,
										processing	: false,
										success		: true
									}
							
							return v
						})
					}
				
				} catch {

					update((v:ImageUpload) => {
			
						v.status	= {
										error		: `An unknown error occured. CODE: 1001`,
										processing	: false,
										success		: false
									}
						
						return v
					})

					clear(false)
				}
			}

		} else {
			
			update((v:ImageUpload) => {
				
				v.status	= {
								error		: `Images must be at least ${imageWidth} pixels wide and ${imageHeight} pixels high (${imageWidth} x ${imageHeight}).`,
								processing	: false,
								success		: false
							}
				
				return v
			})

			clear(false)
		}
	
	} else {

		update((v:ImageUpload) => {
			
			v.status	= {
							error		: `An unknown error occured. CODE: 1002`,
							processing	: false,
							success		: false
						}
			
			return v
		})

		clear(false)		
	}
}

export const imageUpload = (():any => ({ subscribe, ...setGet(subscribe, update),

	clear,
	select,
	drop,
	process,

}))()