type E = Event|KeyboardEvent|ClipboardEvent
type Final = ((v:string, t:HTMLInputElement|null, p:boolean, k:string|null)=>any)|null

const regEx = {
	address:		/.*?\b((?:P(?:ost)?[.\s]*(?:O(?:ffice)?)?[.\s]*(?:Box|B(?:ox)?|B|Bin))|(?:P(?:ost)?[.\s]*B(?:ox|in)?))[.\s]*[#\d-]*\b/i,
	email:			/^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	password:		/^(?=.{8,32}$)/,
	phoneNumber:	/^(?:\+?1\s*[-.]?)?(?:\(?([2-9][0-9]{2})\)?[-.\s]?)?([2-9][0-9]{2})[-.\s]?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/,
	zipCode:		/^\d{5}$/,
}

/**
 * Validate a date string in the format MM/DD/YYYY
 * @param dateStr - The date string to validate
 * @returns true if the date is valid, false otherwise
 */
const isValidDate = (dateStr: string): boolean => {

	// Expected format: MM/DD/YYYY
	const parts = dateStr.split('/')

	if (parts.length !== 3) return false

	const month	= parseInt(parts[0], 10)
	const day	= parseInt(parts[1], 10)
	const year	= parseInt(parts[2], 10)

	// Basic range checks
	if (month < 1 || month > 12) return false
	if (day < 1 || day > 31) return false
	if (year < 1900) return false

	// Days in each month
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

	// Check for leap year
	const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)

	if (isLeapYear) daysInMonth[1] = 29

	// Check if day is valid for the month
	if (day > daysInMonth[month - 1]) return false

	return true
}

/**
 * Validate a credit card number using the Luhn algorithm
 * @param cardNumber - The credit card number to validate
 * @returns true if the card number is valid, false otherwise
 */
const luhnCheck = (cardNumber: string): boolean => {
	// Remove all non-digits
	const digits = cardNumber.replace(/\D/g, '')
	
	if (digits.length < 13 || digits.length > 19) return false

	let sum		= 0,
		isEven	= false

	// Loop through digits from right to left
	for (let i = digits.length - 1; i >= 0; i--) {

		let digit = parseInt(digits[i], 10)

		if (isEven) {

			digit *= 2
			
			if (digit > 9) digit -= 9
		}

		sum += digit
		isEven = !isEven
	}

	return sum % 10 === 0
}

type CardType = {
	type: 'visa' | 'mastercard' | 'amex' | 'discover' | 'dinersclub' | 'jcb' | 'unknown'
	length: number
	format: number[] // spacing pattern, e.g., [4,4,4,4] or [4,6,5]
}

/**
 * Detect the type of credit card based on the card number
 * @param cardNumber - The credit card number to detect
 * @returns The type of credit card
 */
const detectCardType = (cardNumber: string): CardType => {

	// Remove all non-digits
	const digits = cardNumber.replace(/\D/g, '')
	
	// Visa: starts with 4
	if (/^4/.test(digits)) return { type: 'visa', length: 16, format: [4, 4, 4, 4] }
	
	// Mastercard: starts with 51-55 or 2221-2720
	if (/^(5[1-5]|2(22[1-9]|2[3-9]\d|[3-6]\d{2}|7[01]\d|720))/.test(digits)) return { type: 'mastercard', length: 16, format: [4, 4, 4, 4] }
	
	// Amex: starts with 34 or 37
	if (/^3[47]/.test(digits)) return { type: 'amex', length: 15, format: [4, 6, 5] }
	
	// Discover: starts with 6011, 622126-622925, 644-649, 65
	if (/^(6011|65|64[4-9]|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9[01]\d|92[0-5]))/.test(digits)) return { type: 'discover', length: 16, format: [4, 4, 4, 4] }
	
	// Diners Club: starts with 300-305, 36, 38
	if (/^(30[0-5]|36|38)/.test(digits)) return { type: 'dinersclub', length: 14, format: [4, 6, 4] }
	
	// JCB: starts with 2131, 1800, 35
	if (/^(2131|1800|35)/.test(digits)) return { type: 'jcb', length: 16, format: [4, 4, 4, 4] }
	
	// Default to 16-digit format if unknown
	return { type: 'unknown', length: 16, format: [4, 4, 4, 4] }
}

/**
 * Generic number formatter for input fields with masking and validation
 * Handles user input events (keydown, paste, input, blur) and applies formatting patterns
 * @param e - The event object (Event, KeyboardEvent, or ClipboardEvent)
 * @param options - Configuration object with limit, mask, format function, backspace position handler, optional final callback, optional validate function, and optional inputmode
 * @returns void - Modifies the input element directly
 */
const numberFormatter = (e:Event|KeyboardEvent|ClipboardEvent, {limit, mask, format, bSPos: _bSPos, final = null, validate = null, inputmode = 'numeric', indicateInvalid = false}:{limit:number, mask:string, format:(v:string, crs:number|null)=>{v:string, l:number, p:number}, bSPos:(s:number)=>number, final?:Final, validate?:((v:string)=>boolean)|null, inputmode?:string, indicateInvalid?:boolean}) => {

	if (e instanceof KeyboardEvent ? e.metaKey || e.ctrlKey || e.key === 'Tab' : false) return

	const target				= e.target as HTMLInputElement
	const type: string			= e.type

	// Don't prevent default on click events - allows Safari autofill button to work
	if (type !== 'click') {
		e.preventDefault()
	}

	const selStart				= target.selectionStart as number
	const selEnd				= target.selectionEnd as number
	const value: string			= target.value
	const pH: string|null		= target.getAttribute('ph')
	const placeholder: string	= pH ? pH : target.placeholder
	const shift: boolean		= e instanceof KeyboardEvent ? e.shiftKey : false
	const key: string|null		= e instanceof KeyboardEvent ? e.key as string : null
	const scrub: RegExp			= /#.*$/

	const read = (v:string, k:string|null, c:number) => {

		// Strip mask and ALL non-digits to get truly unformatted value
		v = value.replace(scrub, '').replace(/\D/g, '')

		const l = v.length

		if (k != null && !isNaN(Number(k))) {
			
			// Convert cursor position from formatted to unformatted by counting only digits
			const unformattedPos = value.substring(0, c).replace(/\D/g, '').length
			
			if (unformattedPos < l)	return v.substring(0, unformattedPos) + k + v.substring(unformattedPos, l)
			else					return v + k
		
		} else return v
	}

	const write = (val:string, {crs = null, sel = null, pre = false, final: _final = false}:{crs?:number|null, sel?:{s:number, e:number}|null, pre?:boolean, final?:boolean} = {}) => {

		const {v, l, p} = format(val, crs)

		if (l > 0) {

			if (pre) target.value = v.replace(scrub, '')
			
			target.value = v + mask.substring(l, limit)

		} else target.value = ''

		if	(sel)	target.setSelectionRange(sel.s, sel.e)
		else		target.setSelectionRange(p, p)
	}

	let val: string						= read(value, key, selStart),
		crs: number|null				= null,
		sel: {s:number, e:number}|null	= null

	const len: number = val.length

	if (type == 'click') {

		target.classList.remove('form-error-input')
		
		target.placeholder = mask

		// Set inputmode for better mobile keyboard UX
		if (!target.hasAttribute('inputmode')) target.setAttribute('inputmode', inputmode)

		// Get formatted string to check cursor limits
		const formatted = format(val, null)
		const maxPos = formatted.v.length

		if		(selStart != selEnd)	sel = {s:selStart, e:selEnd}
		else if	(selStart <= maxPos)	crs = selStart

		if (value.length > 0) write(val, {crs, sel, pre:true})

		if (!pH) target.setAttribute('ph', placeholder)
	
	} else if (type == 'paste') {

		// Get pasted text from clipboard
		const pasteEvent = e as ClipboardEvent
		const pastedText = pasteEvent.clipboardData?.getData('text') || ''

		// Strip all non-numeric characters
		const numericOnly = pastedText.replace(/\D/g, '')

		if (numericOnly.length > 0) {

			// Replace selection with numeric characters (up to limit)
			if (selStart != selEnd) val = val.substring(0, selStart) + val.substring(selEnd, len)

			val = val.substring(0, selStart) + numericOnly

			// Detect card type to get correct digit limit
			const currentCard = detectCardType(val)

			// Trim to digit limit (not formatted limit)
			if (val.length > currentCard.length) val = val.substring(0, currentCard.length)

			// Format and place cursor at end
			write(val, {pre:true})

			// Set cursor to end
			setTimeout(() => {

				const formatted = target.value.replace(scrub, '')

				target.setSelectionRange(formatted.length, formatted.length)

			}, 0)
		}

		if (final) {

			const v		= target.value.replace(scrub, '')
			const l		= v.length
			const pass	= l == limit
			
			final(v, target, pass, null)
		}

	} else if (type == 'keydown') {

		if (key == 'Backspace') {

			// Convert formatted cursor positions to unformatted (digits-only) positions
			const unformattedStart = value.substring(0, selStart).replace(/\D/g, '').length
			const unformattedEnd = value.substring(0, selEnd).replace(/\D/g, '').length

			if	(selStart != selEnd) {
				
				val = val.substring(0, unformattedStart) + val.substring(unformattedEnd, len)
				
			} else {
				
				val = val.substring(0, unformattedStart - 1) + val.substring(unformattedStart, len)
			}

			// Format the new value
			const formatted = format(val, null)
			target.value = formatted.v + mask.substring(formatted.l, limit)
			
			// Calculate cursor position: we deleted one digit, so cursor should be after (unformattedStart - 1) digits
			const targetDigitIndex = (selStart != selEnd) ? unformattedStart : unformattedStart - 1
			
			// Find that position in the formatted string
			let digitsSeen = 0
			let cursorPos = 0
			for (let i = 0; i < formatted.v.length; i++) {
				if (/\d/.test(formatted.v[i])) {
					digitsSeen++
					if (digitsSeen === targetDigitIndex) {
						cursorPos = i + 1
						break
					}
				}
			}
			
			target.setSelectionRange(cursorPos, cursorPos)

		} else if (key == 'Delete') {

			// Convert formatted cursor positions to unformatted (digits-only) positions
			const unformattedStart = value.substring(0, selStart).replace(/\D/g, '').length
			const unformattedEnd = value.substring(0, selEnd).replace(/\D/g, '').length

			if	(selStart != selEnd)	val = val.substring(0, unformattedStart) + val.substring(unformattedEnd, len)
			else						val = val.substring(0, unformattedStart) + val.substring(unformattedStart + 1, len)
	
			crs = selStart

			write(val, {crs, pre:true})
		
		} else if (!isNaN(Number(key))) {

			if (selStart != selEnd) {

				if		(selStart == 0 && selEnd == limit)	val = key as string
				else if	(selEnd == limit)					val = val.substring(0, selStart) + key
				else {

					val = val.substring(0, selStart) + key+ val.substring((selEnd + 1), (limit + 1))

					crs = selStart + 1
				}

				write(val, {crs})
			
			} else if (len <= limit) {

			// val already has the key inserted by read() function
			// Format to get the formatted string
			const formatted = format(val, null)
			
			// Calculate where cursor should be in the formatted string
			// Count how many digits are before cursor in the unformatted string
			const digitsBeforeCursor = value.substring(0, selStart).replace(/\D/g, '').length
			const targetDigitIndex = digitsBeforeCursor // Index of digit we just typed (0-based)
			
			// Find that digit's position in the NEW formatted string
			let digitsSeen = 0
			let cursorPos = formatted.v.length
			for (let i = 0; i < formatted.v.length; i++) {
				if (/\d/.test(formatted.v[i])) {
					if (digitsSeen === targetDigitIndex) {
						// Found the digit we just typed, place cursor after it
						cursorPos = i + 1
						// Advance past any separators within formatted content
						while (cursorPos < formatted.v.length && !/\d/.test(formatted.v[cursorPos])) {
							cursorPos++
						}
						break
					}
					digitsSeen++
				}
			}
			
			// Write with calculated cursor position
			target.value = formatted.v + mask.substring(formatted.l, limit)
			target.setSelectionRange(cursorPos, cursorPos)
		}
		
		} else if (key == 'ArrowRight') {

			// Get formatted string to check cursor limits
			const formatted = format(val, null)
			const maxPos = formatted.v.length

			if		(shift)					target.setSelectionRange(selStart, selEnd + 1)
			else if (selStart != selEnd)	target.setSelectionRange(selEnd, selEnd)
			else if	(selStart < maxPos)		target.setSelectionRange(selStart + 1, selStart + 1)
		
		} else if	(key == 'ArrowLeft') {
			
			if		(shift)					target.setSelectionRange(selStart - 1, selEnd)
			else if (selStart != selEnd)	target.setSelectionRange(selStart, selStart)
			else if	(selStart > 0)			target.setSelectionRange(selStart - 1, selStart - 1)
		
		}
		else if (value.length == 0) write('')

		if (final) {

			const v		= target.value.replace(scrub, '')
			const l		= v.length
			const pass	= l == limit
			
			final(v, target, pass, key)
		}
	
	} else if (type == 'input') {

		// Handle autofill and programmatic value changes
		// Strip to digits only
		const digitsOnly = target.value.replace(/\D/g, '')
		
		// Check if value is already formatted correctly to avoid infinite loops
		const formatted = format(digitsOnly, null)
		const expectedValue = formatted.v + mask.substring(formatted.l, mask.length)
		
		if (target.value !== expectedValue && digitsOnly.length > 0) {
			// Reformat
			target.value = expectedValue
			
			// Place cursor at end
			target.setSelectionRange(formatted.v.length, formatted.v.length)
		}

		// Run validation
		const v				= target.value.replace(scrub, '')  // Keep formatted value for validation
		const l				= v.replace(/\D/g, '').length  // Digit count for length check
		
		// If validate function exists, rely on it instead of strict length check (for dynamic formats like credit cards)
		const lengthPass	= validate ? (l > 0) : (l == limit)
		const validPass		= validate ? validate(v) : true
		const pass			= lengthPass && validPass
		const error 		= l > 0 && !pass

		if (final) {
			if (error && indicateInvalid) target.classList.add('form-error-input')
			final(v, target, pass, null)
		} else if (error)	target.classList.add('form-error-input')
		else				target.classList.remove('form-error-input')
	
	} else if (type == 'blur') {

		target.placeholder = placeholder

		const v				= target.value.replace(scrub, '')
		const l				= v.length
		const lengthPass	= l == limit
		const validPass		= validate ? validate(v) : true
		const pass			= lengthPass && validPass
		const error 		= l > 0 && !pass

		target.value = v

		// trigger input event to notify Svelte's binding system
		target.dispatchEvent(new Event('input', { bubbles: true }))

		if (final) {

			if (error && indicateInvalid) target.classList.add('form-error-input')
			
			final(v, target, pass, null)
		
		} else if (error)	target.classList.add('form-error-input')
		else				target.classList.remove('form-error-input')
	}
}

/**
 * Validation utilities for form fields
 * Each validator returns {fail: string} with error message, or {fail: false} if valid
 */
export const validate = {

	// Email
	email : (variables:Record<string,any>, required = true) => {

		const email	= variables.email as string

		if (required && !email)					return {fail: 'Email is required'}
		if (email && !regEx.email.test(email))	return {fail: 'Email is invalid'}

		return { fail:false }
	},

	// Password
	password : (variables:Record<string,any>, name:string='password') => {

		const password = variables[name] as string
		// const repassword	= variables.repassword	as string

		if		(!password)					return {fail: 'Password is required'}
		// else if	(!regex.test(password))		return {fail: 'Password must be 8-32 chars long and have at least one lower & upper case letter, a number, and a special char (@$!%*?&)'}
		else if	(!regEx.password.test(password))		return {fail: 'Password must be 8-32 chars long'}
		// else if	(password !== repassword)	return {fail: 'Passwords don\'t match'}

		return { fail:false }
	},

	// Phone Number
	phoneNumber : (variables:Record<string,any>, required = true) => {

		const phoneNumber = variables.phoneNumber

		if (required && !phoneNumber)								return {fail: 'Phone Number is required'}
		if (phoneNumber && !regEx.phoneNumber.test(phoneNumber))	return {fail: 'Phone Number is invalid'}

		return { fail:false }
	},

	// Zip Code
	zipCode : (variables:Record<string,any>, required = true) => {

		const zipCode = variables.zipCode

		if (required && !zipCode)						return {fail: 'Zip Code is required'}
		if (zipCode && zipCode.length != 5)				return {fail: 'Zip Code must be 5 digits long'}
		if (zipCode && !regEx.zipCode.test(zipCode))	return {fail: 'Zip Code is invalid'}

		return { fail:false }
	},

	// Address
	address : (variables:Record<string,any>, required = true) => {
	
		const address = variables.address1 ? variables.address1 : variables.address_address1 as string

		if (required && !address)			return {fail: 'Address is required'}
		if (address && regEx.address.test(address))	return {fail: 'PO Boxes are not allowed'}
		
		return { fail:false }
	},
}


/**
 * Input formatters for various field types
 * Each formatter handles real-time formatting, paste events, and validation
 * @param e - The event object (Event, KeyboardEvent, or ClipboardEvent)
 * @param final - Optional callback function executed after formatting
 */
export const format = {

	// Date
	date : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 10,
		mask	: '##/##/####',
		format	: (v:string, crs:number|null) => {
	
			v = v.replaceAll('/', '')
	
			if		(v.length >= 5)	v = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4, v.length)
			else if	(v.length >= 3)	v = v.substring(0, 2) + '/' + v.substring(2, v.length)
			else					v = v.substring(0, v.length)
	
			const l = v.length
			const p = crs !== null ? crs : (l == 2 || l == 5 ? l + 1 : l)
			
			return {v, l, p}
		},
		bSPos	: (s:number) => s == 4 || s == 7 ? s - 2 : s - 1,
		validate: (v:string) => v.length === 10 ? isValidDate(v) : true,
		final,
		indicateInvalid
	}),

	// Email
	email : (e:E, final:Final = null, indicateInvalid:boolean = false) => {

		const target		= e.target as HTMLInputElement
		const type: string	= e.type
	
		if (type == 'click' || type == 'focus') {
	
			target.classList.remove('form-error-input')
			
			target.placeholder = 'example@domain.com'

			// Set inputmode for better mobile keyboard UX
			if (!target.hasAttribute('inputmode')) {
				target.setAttribute('inputmode', 'email')
			}

		} else if (type == 'paste') {

			e.preventDefault()

			// Get pasted text from clipboard
			const pasteEvent = e as ClipboardEvent
			const pastedText = pasteEvent.clipboardData?.getData('text') || ''

			// Strip non-email-compatible characters
			const filtered = pastedText.replace(/[^a-zA-Z0-9@._+-]/g, '')

			if (filtered.length > 0) {

				const selStart		= target.selectionStart || 0
				const selEnd		= target.selectionEnd || 0
				const currentValue	= target.value

				// Insert filtered text at cursor position
				const newValue = currentValue.substring(0, selStart) + filtered + currentValue.substring(selEnd)

				target.value = newValue

				// Set cursor to end
				target.setSelectionRange(newValue.length, newValue.length)

				// Trigger input event for Svelte reactivity
				target.dispatchEvent(new Event('input', { bubbles: true }))
			}

			if (final) {

				const v		= target.value
				const pass	= regEx.email.test(v)

				final(v, target, pass, null)
			}

		} else if (type == 'input') {

			// Catch autofill, drag-drop, and any other input method
			const original = target.value
			const filtered = original.replace(/[^a-zA-Z0-9@._+-]/g, '')

			if (original !== filtered) {

				target.value = filtered
				
				// Set cursor to end
				target.setSelectionRange(filtered.length, filtered.length)
			}

			// Live validation during input
			if (final) {

				const v		= target.value
				const pass	= regEx.email.test(v)

				final(v, target, pass, null)
			}

		} else if (type == 'keydown') {

			const key = e instanceof KeyboardEvent ? e.key : null
			
			// Allow control keys and navigation
			if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey || ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter'].includes(e.key))) return
			
			// Only allow email-compatible characters
			if (key && !key.match(/^[a-zA-Z0-9@._+-]$/)) {

				e.preventDefault()

				return
			}

			// Live validation during input
			if (final) {

				// Use setTimeout to get value after key is processed
				setTimeout(() => {

					const v		= target.value
					const pass	= regEx.email.test(v)

					final(v, target, pass, key)
					
				}, 0)
			}
	
		} else if (type == 'blur') {
	
			target.placeholder = 'Email'
	
			const v		= target.value
			const pass	= regEx.email.test(v)
			const error	= v !== '' && !pass
	
			if (final) {

				if (error && indicateInvalid) target.classList.add('form-error-input')
				
				final(v, target, pass, null)
			
			} else if (error)	target.classList.add('form-error-input')
			else				target.classList.remove('form-error-input')
		}
	},

	// Phone Number
	phoneNumber : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit		: 12,
		mask		: '###-###-####',
		format		: (v:string, crs:number|null) => {
	
			v = v.replaceAll('-', '')
	
			if		(v.length >= 7)	v = v.substring(0, 3) + '-' + v.substring(3, 6) + '-' + v.substring(6, v.length)
			else if	(v.length >= 4)	v = v.substring(0, 3) + '-' + v.substring(3, v.length)
			else					v = v.substring(0, v.length)
	
			const l = v.length
			const p = crs !== null ? crs : (l == 3 || l == 7 ? l + 1 : l)
			
			return {v, l, p}
		},
		bSPos		: (s:number) => s == 5 || s == 9 ? s - 2 : s - 1,
		inputmode	: 'tel',
		final,
		indicateInvalid
	}),

	socialSecurityNumber : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 11,
		mask	: '###-##-####',
		format	: (v:string, crs:number|null) => {
	
			v = v.replaceAll('-', '')
	
			if		(v.length >= 6)	v = v.substring(0, 3) + '-' + v.substring(3, 5) + '-' + v.substring(5, v.length)
			else if	(v.length >= 4)	v = v.substring(0, 3) + '-' + v.substring(3, v.length)
			else					v = v.substring(0, v.length)
	
			const l = v.length
			const p = crs !== null ? crs : (l == 3 || l == 6 ? l + 1 : l)
			
			return {v, l, p}
		},
		bSPos	: (s:number) => s == 5 || s == 8 ? s - 2 : s - 1,
		final,
		indicateInvalid
	}),

	// Stake Percentage
	stakePercentage : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 4,
		mask	: '###%',
		format	: (v:string, crs:number|null) => {
	
			v = v.replaceAll('%', '')
	
			const l = v.length
			const p = crs !== null ? crs : l
			
			return {v, l, p}
		},
		bSPos	: (s:number) => s - 1,
		final,
		indicateInvalid
	}),

	taxId : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 10,
		mask	: '##-#######',
		format	: (v:string, crs:number|null) => {
	
			v = v.replaceAll('-', '')
	
			if	(v.length >= 3) v = v.substring(0, 2) + '-' + v.substring(2, v.length)
			else				v = v.substring(0, v.length)
	
			const l = v.length
			const p = crs !== null ? crs : (l == 2 ? l + 1 : l)
			
			return {v, l, p}
		},
		bSPos	: (s:number) => s == 4 ? s - 2 : s - 1,
		final,
		indicateInvalid
	}),

	// Zip Code
	zipCode : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 5,
		mask	: '#####',
		format	: (v:string, crs:number|null) => {
	
			const l = v.length
			const p = crs !== null ? crs : l
	
			return {v, l, p}
		},
		bSPos	: (s:number) => s - 1,
		final,
		indicateInvalid
	}),

	// Credit Card
	creditCard : (e:E, final:Final = null, indicateInvalid:boolean = false) => {

		const target = e.target as HTMLInputElement
		
		// Use a wrapper that detects card type dynamically during formatting
		// This ensures paste/autofill work correctly
		let currentCardType = detectCardType(target.value)
		
		// For paste/input events, we need to get the new value
		if (e.type === 'paste') {

			const pasteEvent	= e as ClipboardEvent
			const pastedText	= pasteEvent.clipboardData?.getData('text') || ''

			currentCardType = detectCardType(pastedText)
		}
		
		// Limit is the FORMATTED length (digits + spaces)
		// Example: Visa = 16 digits + 3 spaces = 19, Amex = 15 digits + 2 spaces = 17
		const limit = currentCardType.length + (currentCardType.format.length - 1)
		
		// Build mask based on format
		const maskParts	= currentCardType.format.map(len => '#'.repeat(len))
		const mask		= maskParts.join(' ')

		return numberFormatter(e, {
			limit,
			mask,
			format: (v:string, crs:number|null) => {
				
				v = v.replaceAll(' ', '').replaceAll('-', '')
				
				// Re-detect card type based on current value for dynamic formatting
				const cardType = detectCardType(v)
				const fmt = cardType.format
				
				let formatted	= '',
					offset		= 0
				
				for (let i = 0; i < fmt.length; i++) {

					const segmentLength = fmt[i]
					const segment		= v.substring(offset, offset + segmentLength)
					
					if (segment.length > 0) formatted += (i > 0 ? ' ' : '') + segment
					
					offset += segmentLength
				}
				
				const l = formatted.length
				
				// Calculate cursor position accounting for spaces
				let p = l

				if (crs !== null) p = crs
				else {

					// Auto-advance cursor after each segment
					let checkPos = 0
					
					for (let i = 0; i < fmt.length - 1; i++) {

						checkPos += fmt[i] + (i > 0 ? 1 : 0)
						
						if (l === checkPos) {
						
							p = l + 1
						
							break
						}
					}
				}
				
				return {v: formatted, l, p}
			},
			bSPos: (s:number) => {

				// Handle backspace at space positions - re-detect card type
				const cardType	= detectCardType(target.value)
				const fmt		= cardType.format
				
				let checkPos = fmt[0]
				
				for (let i = 1; i < fmt.length; i++) {

					checkPos += 1 + fmt[i]
					
					if (s === checkPos + 1) return s - 2
				}
				
				return s - 1
			},
			validate: (v:string) => {

				// v here is the formatted value with spaces (e.g., "4532 1488 0343 6467")
				// Strip all non-digits for validation
				const digitsOnly = v.replace(/\D/g, '')

				// Re-detect card type for validation
				const cardType = detectCardType(digitsOnly)
				
				// Only validate when we have the full number
				return digitsOnly.length === cardType.length ? luhnCheck(digitsOnly) : true
			},
			final,
			indicateInvalid
		})
	},

	// Expiration
	expiration : (e:E, final:Final = null, indicateInvalid:boolean = false) => numberFormatter(e, {
		limit	: 5,
		mask	: '##/##',
		format	: (v:string, crs:number|null) => {
	
			v = v.replaceAll('/', '')
	
			if	(v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2, v.length)
			else				v = v.substring(0, v.length)
	
			const l = v.length
			const p = crs !== null ? crs : (l == 2 || l == 5 ? l + 1 : l)
			
			return {v, l, p}
		},
		bSPos	: (s:number) => s == 4 || s == 7 ? s - 2 : s - 1,
		validate: (v:string) => {

			// Only validate when we have complete input (MM/YY = 5 chars)
			if (v.length !== 5) return true

			const parts = v.split('/')

			if (parts.length !== 2) return false

			const month	= parseInt(parts[0], 10)
			const year	= parseInt(parts[1], 10)

			// Validate month range
			if (month < 1 || month > 12) return false

			// Get current date
			const now			= new Date()
			const currentMonth	= now.getMonth() + 1 // getMonth() is 0-indexed
			const currentYear	= now.getFullYear() % 100 // Get last 2 digits

			// Check if expired (year is less than current, or same year but month has passed)
			if (year < currentYear) return false
			if (year === currentYear && month < currentMonth) return false

			return true
		},
		final,
		indicateInvalid
	}),
}