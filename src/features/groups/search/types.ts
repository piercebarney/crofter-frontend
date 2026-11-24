export type Search = {
	account: {id:string, type:string}|null
	active: boolean
	api: string
	ariaLabel: string
	defaultZipCode: string|null
	enteredZipCode: string|null
	fulfillment: string|null
	function: any
	input: boolean
	localZipCode: string|null
	locationName: string|null
	placeholder: string
	progTerm: string
	proximity: number|null
	results: any
	searching: boolean
	sort: {
		type: string|null
		locationId: string|null
	}
	storedZipCode: string|null
	term: string
	zipCode: string|null
	zipCodeChecked: boolean
}