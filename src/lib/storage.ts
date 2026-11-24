export type LSResponse = {
	active:		Record<string,any>|null
	data:		Record<string,any>|string|null
	error:		string|null
	message:	string|null
}

interface Storage {
	init	: (userId:string|null) => LSResponse
	clear	: () => LSResponse
	set		: (name:string, data:any, userId?:string|null) => LSResponse
	get		: (name:string, userId?:string|null) => LSResponse
	remove	: (name:string, userId?:string|null) => LSResponse
}

import { browser } from '$app/environment'


/**
 * storage
 * 
 * storage is a simple wrapper around the browser's localStorage
 * it provides a simple interface for storing and retrieving data
 * 
 * storage also handles the concept of an "active" user, which is
 * stored in localStorage under the key "_active_". This allows
 * for easy switching between user modes and accessing session data.
 */
export const storage: Storage = {

	init : (userId:string|null) => returnResponse(setActive(userId)),

	clear : () => returnResponse(setActive(null)),

	set : (name:string, data:any, userId:string|null = null) => returnResponse(setData(name, data, false, userId)),

	get : (name:string, userId:string|null = null) => returnResponse(getData(name, userId)),

	remove : (name:string, userId:string|null = null) => returnResponse(removeData(name, userId))
}

const returnResponse = (response:LSResponse) => {

	if (response.error && response.message != 'not in browser') console.error('LS ERROR', response)

	return response
}

// set which user is logged in
const setActive = (userId:string|null) => {

	const response : LSResponse = {
		active	: null,
		data	: null,
		error	: null,
		message	: null,
	}

	const activeData = {id: userId}

	if (browser) {
		
		try {
		
			localStorage.setItem('_active_', JSON.stringify(activeData))

			response.active		= activeData
			response.message	= 'active set'
		
		} catch (e:any) {

			response.error = 'setActive: ' + e.message
		}

	} else response.message = 'not in browser'

	return response
}

// get which user is logged in
const getActive = () => {

	const response : LSResponse = {
		active	: null,
		data	: null,
		error	: null,
		message	: null,
	}

	const activeData = {id: null}

	if (browser) {

		let active: Record<string,any>|string|null = null

		// get active data
		try {
	
			active = localStorage.getItem('_active_')

		} catch (e:any) {

			response.error = 'getActive: ' + e.message

			return response
		}

		// active data exists
		if (typeof active == 'string') {
			
			try {

				// parse active data
				active = JSON.parse(active) as Record<string,any>

				// if active data is valid
				if (active && Object.hasOwn(active, 'id')) {
					
					response.active		= active
					response.message	= 'active read'

				// if active data is invalid
				} else {
					
					// reset active data
					localStorage.setItem('_active_', JSON.stringify(activeData))

					response.active		= activeData
					response.message	= 'active reset'
				}

			} catch(e:any) {

				response.error = 'getActive: ' + e.message
			}

		// unexpected data type
		} else {
			
			// reset active user data
			localStorage.setItem('_active_', JSON.stringify(activeData))

			response.active		= activeData
			response.error		= 'getActive: unexpected data type'
		}
	
	} else response.message = 'not in browser'

	return response
}

// remove stored data
const removeData = (name:string, specificUserId:string|null = null) => setData(name, {}, true, specificUserId)

// get stored data
const getData = (name:string|null = null, specificUserId:string|null = null) => {

	const response: LSResponse = getActive()

	if (response.error) return response

	const userId = specificUserId || response?.active?.id || 'guest'

	// get all userdata
	let data: Record<string,any>|string|null
	
	try {
	
		data = localStorage.getItem(userId)

	} catch (e:any) {

		response.error = 'getData: ' + e.message

		return response
	}

	// if data exists
	if (typeof data == 'string') {

		try {
		
			// parse data
			data = JSON.parse(data) as Record<string,any>

			// if data is valid
			if (data && typeof data === 'object') {

				// name exists
				if (name) {
					
					// if data for specific name exists
					if	(Object.hasOwn(data, name))	{
						
						response.data		= data[name]
						response.message	= 'data read'
					}

				// get all data
				} else {
					
					response.data		= data
					response.message	= 'data read'
				}

			// if data is not valid
			} else {
				
				// reset user data
				localStorage.setItem(userId, JSON.stringify(null))

				response.data		= null
				response.message	= 'no data'
			}

		} catch(e:any) {

			response.error = 'getData: ' + e.message
		}

	// if data does not exist
	} else if (data == null) {

		// set user data
		localStorage.setItem(userId, JSON.stringify(null))

		response.data		= null
		response.message	= 'no data'
	
	// if exists but is not a string
	} else {

		// clear user data
		localStorage.setItem(userId, JSON.stringify(null))

		response.data	= null
		response.error	= 'getData: unexpected data type'
	}

	return response
}

// set stored data
const setData = (name:string, data:Record<string,any>, remove?:boolean, specificUserId:string|null = null) => {

	const response = getData(null, specificUserId)

	if (response.error) return response

	const userId = specificUserId || response?.active?.id || 'guest'

	let userData = response.data as Record<string,any>|null

	// update user data
	if (!userData) userData = {}

	if (remove) delete userData[name]
	else		userData[name] = data

	try {

		// save updated user data
		localStorage.setItem(userId, JSON.stringify(userData))

		response.data		= data
		response.message	= `data ${remove ? 'removed' : 'set'}`

	} catch(e:any) {

		response.error = 'setData: ' + e.message
	}

	return response
}