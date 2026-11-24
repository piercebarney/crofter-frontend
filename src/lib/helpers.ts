import type { Hours } from 'src/types/common'



export const classes = (...args: (string|Record<string,boolean>|undefined)[]): string|undefined => {

	// console.log(args)
	
	const array: string[] = []

	for (const arg of args) {
		
		if (typeof arg === 'string' && arg !== '') {
			
			const argArray = arg.split(' ')

			for (const a of argArray) array.push(camelToKebabCase(a))
		
		} else if (typeof arg === 'object') {

			const name = Object.keys(arg)[0]

			if (arg[name]) array.push(camelToKebabCase(name))

		} else if (Array.isArray(arg)) {
	
			for (const a of arg) if (typeof a === 'string' && a != '') array.push(camelToKebabCase(a))
		}
	}

	return array.length > 0 ? array.join(' ') : undefined
}

export const snakeCase = (value:string, delim:string = ' ') => {

	if (typeof value != 'string') return value

	return value.replace(/\W+/g, delim)
		.split(/ |\B(?=[A-Z])/)
		.map(word => word.toLowerCase())
		.join('_')
}

export const camelToSnakeCase = (value:string) => {

	if (typeof value != 'string') return value

	return value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()
}

export const kebabCase = (value:string, delim:string = ' ') => {

	if (typeof value != 'string') return value

	return value.replaceAll(delim, '-').toLocaleLowerCase()
}

export const camelToKebabCase = (value:string) => {

	if (typeof value != 'string') return value

	return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

// camel case requires the first letter of each additional word to be uppercase
export const snakeToCamelCase = (value:string) => {

	if (typeof value != 'string') return value

	return value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

export const textToHtml = (value:string) => {

	if (typeof value != 'string') return value

	return value
		.split('\n')
		.map((paragraph:string) => {
		
			paragraph = paragraph.replaceAll('\r', '').trim()

			if		(paragraph == '')					return ''
			else if	(
						paragraph.includes('<p>') ||
						paragraph.includes('</p>') ||
						paragraph.includes('<br>') ||
						paragraph.includes('<ul>') ||
						paragraph.includes('</ul>') ||
						paragraph.includes('<ol>') ||
						paragraph.includes('</ol>') ||
						paragraph.includes('<li>') ||
						paragraph.includes('</li>')
													)	return paragraph
			else										return `<p>${paragraph}</p>`

		})
		.join('')
}

export const poliSort = (data:any[], options:Record<string,any>={}) => {

	if (!Array.isArray(data) || data.length < 2) return data

	const type: 	string|null = options?.type ? options.type : null
	const prop:		string		= options?.prop ? options.prop : data[0][Object.keys(data[0])[0]]
	const order:	string		= options?.order ? options.order.toUpperCase() : 'ASC'

	switch (type) {

		case 'alpha':

			return data.sort((a, b) => {
				
				const A = a[prop].toUpperCase()
				const B = b[prop].toUpperCase()

				if	(order == 'DESC')	return (B < A) ? -1 : (B > A) ? 1 : 0
				else					return (A < B) ? -1 : (A > B) ? 1 : 0
			})

		case 'cron':

			return data.sort((a, b) => {

				const A = Date.parse(a[prop])
				const B = Date.parse(b[prop])

				if	(order == 'DESC')	return B - A
				else					return A - B
			})
	
		default:

			return data.sort()
	}
}

export const capitalize = (val:string, delim:string = ' ') => {

	const vals: string[] = val.split(delim)

	vals.forEach((v:string, index:number) => {

		vals[index] = v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
	})

	return vals.join(' ')
}

export const formatPhone = (phone:string|null) => {

	if (phone) {

		phone = phone.replace('+1', '')

		if		(phone.length == 10) return `${phone.slice(0,3)}-${phone.slice(3,6)}-${phone.slice(6,10)}`
		else if (phone.length == 11) return `${phone.slice(1,4)}-${phone.slice(4,7)}-${phone.slice(7,11)}`
	}

	return phone
}

export const getScroll = (e:UIEvent) => {

	const scrollElement	= e.target as HTMLElement
	const scrollTop		= scrollElement.scrollTop
	
	return scrollTop
}

const blurRadius	= 16
const blurRate		= 8

export const scrollShadow = (scroll:number, element:HTMLElement, start:number = 0) => {

	if (element) {

		if (scroll === undefined) scroll = 0

		let value = 0

		if (scroll > start) {

			const adjustedScroll = scroll - start

			if	(adjustedScroll <= (blurRadius * blurRate))	value = adjustedScroll / blurRate
			else										value = blurRadius
		}

		element.style.boxShadow = `0px 0px ${value}px 0px rgba(0,0,0,0.75)`
	}
}

const alphaRate	= 16

export const scrollBorderBottom = (scroll:number, element:HTMLElement, options:{start?:number, dark?:boolean, on?:boolean}={}) => {

	if (!element) return

	if (scroll === undefined) scroll = 0

	const start				= options.start || 0
	const dark				= options.dark || false
	const on				= options.on !== undefined ? options.on : true
	const adjustedScroll	= scroll - start
	const color				= dark ? '10,51,41' : '240,240,240'

	let alpha = 0

	if (on) {

		if		(adjustedScroll <= 0)			alpha = 0
		else if	(adjustedScroll <= alphaRate)	alpha = adjustedScroll / alphaRate
		else									alpha = 1
	}

	element.style.borderBottom = `1px solid rgba(${color},${alpha})`
}

const timeZoneAbbreviations: { [key: string]: string } = {
	'America/New_York': 'EST', // Eastern Standard Time
	'America/Chicago': 'CST', // Central Standard Time
	'America/Denver': 'MST', // Mountain Standard Time
	'America/Los_Angeles': 'PST', // Pacific Standard Time
	'America/Detroit': 'EST', // Eastern Daylight Time
	'America/Indiana/Indianapolis': 'EST', // Eastern Daylight Time
	'America/Indiana/Marengo': 'EST', // Eastern Daylight Time
	'America/Indiana/Petersburg': 'EST', // Eastern Daylight Time
	'America/Indiana/Vincennes': 'EST', // Eastern Daylight Time
	'America/Kentucky/Louisville': 'EST', // Eastern Daylight Time
	'America/Kentucky/Monticello': 'EST', // Eastern Daylight Time
	'America/Anchorage': 'AKST', // Alaska Standard Time
	'America/Honolulu': 'HST', // Hawaii-Aleutian Standard Time
	'America/Phoenix': 'MST', // Arizona (no DST)
	// Add more mappings as needed
}

export const formatDateTime = (timestamp:string, {timeZone = 'America/Denver', date = true, year = true, month = true, day = true, time = true, hour = true, minute = true, second = true, showTimeZone = true}:{timeZone?:string, date?:boolean, year?:boolean, month?:boolean, day?:boolean, time?:boolean, hour?:boolean, minute?:boolean, second?:boolean, showTimeZone?:boolean} = {}) => {

	const options: Record<string,string> = {timeZone}

	if (date) {

		if (year) options.year = 'numeric'
		if (month) options.month = '2-digit'
		if (day) options.day = '2-digit'
	}

	if (time) {

		if (hour) options.hour = '2-digit'
		if (minute) options.minute = '2-digit'
		if (second) options.second = '2-digit'
	}

	const formattedDate = new Date(timestamp).toLocaleString('en-US', options)

	const timeZoneCode = timeZoneAbbreviations[timeZone] || timeZone // Fallback to timeZone if not found

	return `${formattedDate}${time && showTimeZone ? ` (${timeZoneCode})` : ''}`
}

export const formatDateShortHand = (timestamp:string, timeZone:string = 'America/Denver') => {

	const options: Record<string,string> = {timeZone, month:'short', day:'numeric'}

	return new Date(timestamp).toLocaleString('un-US', options)
}

export const stringifyAny = (value:any) => {

	if (typeof value === 'string') return value

	if (typeof value === 'undefined') return 'undefined'

	if (value === null) return 'null'

	if (typeof value === 'function') return value.toString()
	
	try {

		return JSON.stringify(value)

	} catch {
		
		// Handle circular references or non-serializable types
		return String(value)
	}
}

const days = [
	{i:'mon', l: 'Monday',		m:'Mon',	s:'M'},
	{i:'tue', l: 'Tuesday',		m:'Tue',	s:'Tu'},
	{i:'wed', l: 'Wednesday',	m:'Wed',	s:'W'},
	{i:'thu', l: 'Thursday',	m:'Thu',	s:'Th'},
	{i:'fri', l: 'Friday',		m:'Fri',	s:'F'},
	{i:'sat', l: 'Saturday',	m:'Sat',	s:'Sa'},
	{i:'sun', l: 'Sunday',		m:'Sun',	s:'Su'}
]

const _formatTime = (time: string) => {

	const [hours, minutes] = time.split(':')
	const hoursInt = parseInt(hours, 10)

	return `${hoursInt > 12 ? hoursInt - 12 : hoursInt}${minutes != '00' ? `:${minutes}` : ''}${hoursInt > 12 ? 'pm' : 'am'}`
}

export const formatOpenHours = (openHoursStr:string|undefined) : Hours => {

	if (typeof openHoursStr != 'string' || openHoursStr.trim() == '') return {array: [], string: ''}

	const openHours = JSON.parse(openHoursStr)

	if (Object.keys(openHours).length == 0) return {array: [], string: ''}

	const array: {day:string,time:string}[]	= []
	const stringParts: any					= []

	days.forEach(day => {
		
		const dayIndex = day.i

		if (openHours[dayIndex].start == '00:00' && openHours[dayIndex].end == '00:00') return

		const dayMidName	= day.m
		const dayShortName	= day.s
		const startTime		= _formatTime(openHours[dayIndex].start)
		const endTime		= _formatTime(openHours[dayIndex].end)
		const time			= `${startTime} - ${endTime}`

		array.push({day: dayMidName, time})

		if (stringParts.length == 0) stringParts.push({days:[dayShortName], time})
		else {
			
			stringParts.forEach((s:any) => {

				if	(s.time == time)	s.days.push(dayShortName)
				else					stringParts.push({days:[dayShortName], time})
			})
		}
	})

	const string = stringParts.map((s:any) => `<div style="display:flex;gap:.4rem;flex-wrap:wrap"><span style="font-weight:600">${s.days.join(',')}</span><span>${s.time.replaceAll(' ', '')}</span></div>`).join(', ')

	return {array, string}
}

export const sortFulfillments = (order:any, pL:any, f:any) => {

	const fulfillments: any[] = []

	for (const orderItem of order.orderItems) {

		if (f.is('pickup', orderItem.fulfillment) || f.is('distribution', orderItem.fulfillment)) {
			
			const pickUpLocation = pL.get(orderItem.pickUpLocationId)

			if (!pickUpLocation) {

				if (!fulfillments.find((fulfillment: any) => fulfillment.id == 'other pickup')) fulfillments.push({ id:'other pickup', orderItemIds:[orderItem.id], sort:1, fulfillment:'pickup' })
				else fulfillments.find((fulfillment: any) => fulfillment.id == 'other pickup').orderItemIds.push(orderItem.id)

			} else {

				const id = pickUpLocation.id
				
				if (!fulfillments.find((fulfillment: any) => fulfillment.id == id)) fulfillments.push({ id, orderItemIds:[orderItem.id], sort:0, fulfillment:'pickup' })
				else fulfillments.find((fulfillment: any) => fulfillment.id == id).orderItemIds.push(orderItem.id)
			}

		} else if (f.is('delivery', orderItem.fulfillment)) {

			const id = orderItem.deliveryAddressId

			if (!id) {

				if (!fulfillments.find((fulfillment: any) => fulfillment.id == 'other delivery')) fulfillments.push({ id:'other delivery', orderItemIds:[orderItem.id], sort:3, fulfillment:'delivery' })
				else fulfillments.find((fulfillment: any) => fulfillment.id == 'other delivery').orderItemIds.push(orderItem.id)

			} else {

				if (!fulfillments.find((fulfillment: any) => fulfillment.id == id)) fulfillments.push({ id, orderItemIds:[orderItem.id], sort:2, fulfillment:'delivery' })
				else fulfillments.find((fulfillment: any) => fulfillment.id == id).orderItemIds.push(orderItem.id)
			}

		} else {

			if (!fulfillments.find((fulfillment: any) => fulfillment.id == 'other')) fulfillments.push({ id:'other', orderItemIds:[orderItem.id], sort:4, fulfillment:'other' })
			else fulfillments.find((fulfillment: any) => fulfillment.id == 'other').orderItemIds.push(orderItem.id)

		}
	}

	fulfillments.sort((a: any, b: any) => a.sort - b.sort)

	return fulfillments
}