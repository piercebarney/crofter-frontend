/* Sections */

export type Keys = 'company'|'product'|'user'

export type TabKeys = CompanyTabKeys|ProductTabKeys|UserTabKeys

export type Sections = Record<Keys, HTMLSectionElement|null>

export type Objects = {
	company:	CompanyObject|null
	product:	ProductObject|null
	user:		UserObject|null

}

export type MessageOptions = {message?:string, type?:'none'|'info'|'error', display?:boolean}



/* Company Section */

// Tabs
export type CompanyTabKeys = 'all'|'lookup'

export type CompanyTabs = Record<Keys, CompanyTabKeys>

// Object
export type CompanyFetchVariables = {
	email?:				string
	id?:				string
	phoneNumber?:		string
	filterBy_status?:	string
}

export type CompanyFetch = (variables:CompanyFetchVariables) => {}

export type CompanyObject = {
	filteredCount:			number
	filterByZift:			boolean
	filterByProducts:		boolean
	searchTerm:				string
	updateRoleChanged:		boolean
	updateZiftIdChanged:	boolean
	updateProductChanged:	boolean
	updateRoleValue:		string
	updateProductValue:		string
	tabs:					(tabName:CompanyTabKeys) => void
	filter:					(type:string) => void
	search:					(type:string) => void
	update:					(key:string, data?:Record<string,any>) => void
	fetchAll:				() => void
	fetch:					CompanyFetch
}

// Filter
export type Filter = {
	showing:	number
	vars:		Record<string,boolean>
	function:	(company:CompanyData) => boolean
}

// Data
export type Address = {
	city:	string
	state:	string
}

export type Product = {
	id:		string
	title:	string
}

export type CompanyData = {
	addresses:					Address[]
	email:						string
	emailVerified:				boolean
	id:							string
	insertedAt:					string
	merchantApplicationDetails:	{
			applicationId:	string|null
			status:			string
			validation:		string|null
		}|null
	name:						string
	phoneNumber:				string|null
	products:					Product[]
	role:						string
	ziftAccountId:				string|null
}



/* Product Section */

// Tabs
export type ProductTabKeys = 'all'|'lookup'

export type ProductTabs = Record<Keys, ProductTabKeys>

// Object
export type ProductFetchVariables = {
	productId?: string
}

export type ProductFetchAll = (type:string, companyId?:string) => {}

export type ProductFetch = (variables:ProductFetchVariables) => {}

export type Distributor = {
	id:		string
	name:	string
}

export type DistributorLocation = {
	address1:	string
	address2:	string
	city:		string
	id:			string
	state:		string
	zipCode:	string
}

export type Money = {
	amount: 	string
	asString:	string
	currency:	string
}

export type ProductObject = {
	filteredCount:					number
	fetchAllTerm:					string
	searchTerm:						string
	distributors:					Distributor[]|null
	distributorLocations:			DistributorLocation[]|null
	tabs:							(tabName:ProductTabKeys) => void
	search:							(type:string) => void
	update:							(key:string, data?:Record<string,any>) => void
	fetchAll:						ProductFetchAll
	fetch:							ProductFetch
}

// Data
export type ProductData = {
	active: 				boolean
	availability: 			string
	distributorLocations:	DistributorLocation[]
	distributors: 			Distributor[]
	id:						string
	// insertedAt:	string
	forDelivery:			boolean
	forDistribution:		boolean
	forPickUp:				boolean
	price: 					Money
	unit: 					string
	title: 					string
}



/* User Section */

// Tabs
export type UserTabKeys = 'lookup'

export type UserTabs = Record<Keys, UserTabKeys>

// Object
export type UserFetchVariables = {
	email?:			string
	id?:			string
	phoneNumber?:	string
}

export type UserFetch = (variables:UserFetchVariables) => {}

export type UserObject = {
	searchTerm:			string
	updateRoleValue:	string
	updateRoleChanged:	boolean
	tabs:				(tabName:UserTabKeys) => void
	search:				(type:string) => void
	update:				(key:string) => void
	fetch:				UserFetch
}

// Filter
export type UserFilter = {
	showing:	number
	vars:		Record<string, boolean>
	function:	(user: UserData) => boolean
}

// Data
export type UserData = {
	companies: {
		id:		string
		name:	string
	}[]
	defaultAddress: {
		city:	string
		state:	string
	}
	email:		 	string
	emailVerified:	boolean
	firstName:		string
	id:				string
	insertedAt: 	string
	lastName:		string
	role:			string
	phoneNumber:	string
	zipCode:		string
}