import { mutate, query } from 'src/lib/server/client'
import { Address, AddressValidationMatches } from 'src/lib/server/api/address'
import { ProductCardV1 } from 'src/lib/server/api/product'



export const Company:string = `
	addresses {
		${Address}
	}
	bio
	defaultCompany
	email
	emailVerified
	id
	image
	name
	operatingHours
	phoneNumber
	products {
		id
		title
	}
	role
	ziftAccountId`

export const Company_Page:string = `
	addresses {
		${Address}
	}
	bio
	email
	id
	image
	name
	operatingHours
	phoneNumber
	products {
		${ProductCardV1}
	}
	role`

export const Company_Partial:string = `
	id
	image
	name`

export const CompanySaveResponse:string = `
	... on AddressValidationMatches {
		${AddressValidationMatches}
	}
	... on Company {
		id
		name
		role
		ziftAccountId
	}`

export const MerchantApplication:string = `
	application {
		business {
			address {
				${Address}
			}
			businessName
			contactPhone
			description
			descriptorPhone
			directDebitDescriptor
			email
			legalName
			ownershipStructureType
			paymentCardDescriptor
			registrationYear
			taxId
			timeZoneCode
			website
		}
		deposit {
			accountNumber
			accountType
			bankName
			holderName
			routingNumber
		}
		estimates {
			annualCardsVolume
			annualDirectDebitVolume
			avgCardsTransactionAmount
			avgDirectDebitTransactionAmount
			maxTransactionAmount
		}
		officer {
			address {
				${Address}
			}
			birthDate
			email
			firstName
			lastName
			phone
			socialSecurity
			title
		}
		owners {
			address {
				${Address}
			}
			birthDate
			email
			firstName
			lastName
			phone
			socialSecurity
			stakePercentage
		}
	}
`

export const CompanyGetMerchantApplication:string = `
	merchantApplicationDetails {
		${MerchantApplication}
		applicationId
		status
	}`

const CompanyAdmin:string = `
	addresses {
		city
		state
	}
	email
	emailVerified
	id
	insertedAt
	merchantApplicationDetails {
		applicationId
		status
		validation
	}
	name
	orders {
		id
	}
	phoneNumber
	products {
		id
		title
	}
	role
	ziftAccountId
`

const Distributor:string = `
	id
	name
`

const DistributorLocations:string = `
	address1
	address2
	city
	id
	isDefault
	openHours
	state
	zipCode`



export const company = {
	
	company : async (options:Record<string,any> = {}) => await query('company', {
		
		variables	: {companyId:'String!'},
		fields		: Company
	
	}, {...options}),

	companyPage : async (options:Record<string,any> = {}) => await query('company', {
		
		variables	: {companyId:'String!'},
		fields		: Company_Page
	
	}, {...options}),

	companyCreate : async (options:Record<string,any> = {}) => await mutate('companyCreate', {

		variables	: {
						addressForce	: 'Boolean',
						input			: {
								address		: {
										address1	: 'String!',
										address2	: 'String',
										city		: 'String!',
										state		: 'String!',
										zipCode		: 'String!',
									},
								email		: 'String!',
								name		: 'String!',
								phoneNumber	: 'String!',
							},
					},
		fields		: CompanySaveResponse

	}, {key:'company', ...options}),

	companyUpdate : async (options:Record<string,any> = {}) => await mutate('companyUpdate', {

		variables	: {
						companyId	: 'String!',
						input		: {
								bio				: 'String',
								email			: 'String',
								emailVerified	: 'Boolean',
								name			: 'String',
								operatingHours	: 'String',
								phoneNumber		: 'String',
								role			: 'String',
							},
					},
		fields		: `
						bio
						email
						id
						image
						phoneNumber
						name
						operatingHours
					`
	
	}, {key:'company', ...options}),

	companyUpdateZiftAccountId : async (options:Record<string,any> = {}) => await mutate('companyUpdate', {

		variables	: {
						companyId	: 'String!',
						input		: {
								ziftAccountId : 'String',
							},
					},
		fields		: `
						id
						ziftAccountId
					`
	
	}, {key:'company', ...options}),

	companyAddImage : async (options:Record<string,any> = {}) => await mutate('companyAddImage', {
	
		variables	: {
						companyId	: 'String!',
						input		: 'Upload!',
					},
		fields		: 'image',
		
	}, {cacheQuery:false, ...options}),

	companyResendEmailVerification : async (options:Record<string,any> = {}) => await mutate('resendEmailVerification', {

		variables	: {companyId: 'String!'},
		fields		: 'success'

	}, {...options}),

	companyMerchantApplicationSave : async (options:Record<string,any> = {}) => await mutate('merchantApplicationSave', {

		variables	: {
						companyId	: 'String!',
						input		: {
								business	: {
										address					: {
												address1	: 'String',
												address2	: 'String',
												city		: 'String',
												country		: 'String',
												isDefault	: 'Boolean',
												state		: 'String',
												zipCode		: 'String!',
											},
										businessName			: 'String',
										contactPhone			: 'String',
										description				: 'String',
										descriptorPhone			: 'String',
										directDebitDescriptor	: 'String',
										email					: 'String',
										legalName				: 'String',
										ownershipStructureType	: 'OwnershipStructureType',
										paymentCardDescriptor	: 'String',
										registrationYear		: 'String',
										taxId					: 'String',
										timeZoneCode			: 'String',
										website					: 'String',
									},
								estimates	: {
										annualCardsVolume				: 'Int',
										annualDirectDebitVolume			: 'Int',
										avgCardsTransactionAmount		: 'Int',
										avgDirectDebitTransactionAmount	: 'Int',
										maxTransactionAmount			: 'Int',
									},
								officer		: {
										address		: {
												address1	: 'String',
												address2	: 'String',
												city		: 'String',
												country		: 'String',
												isDefault	: 'Boolean',
												state		: 'String',
												zipCode		: 'String!',
											},
										birthDate	: 'String',
										email		: 'String',
										firstName	: 'String',
										lastName	: 'String',
										phone		: 'String',
										socialSecurity	: 'String',
										title			: 'Title',
									},
								owners		: ['OwnerPartialInput', {
										address			: {
												address1	: 'String',
												address2	: 'String',
												city		: 'String',
												country		: 'String',
												isDefault	: 'Boolean',
												state		: 'String',
												zipCode		: 'String!',
											},
										birthDate		: 'String',
										email			: 'String',
										firstName		: 'String',
										lastName		: 'String',
										phone			: 'String',
										socialSecurity	: 'String',
										stakePercentage	: 'Int',
									}]
							},
					},
		fields		: MerchantApplication

	}, {key:'application', ...options}),

	companyMerchantApplicationSubmit : async (options:Record<string,any> = {}) => await mutate('merchantApplicationSubmit', {

		variables	: {
						companyId	: 'String!',
						input		: {
								accountNumber	: 'String!',
								accountType		: 'AccountTypeInput!',
								bankName		: 'String!',
								holderName		: 'String!',
								routingNumber	: 'String!',
							}
					},
		fields		: 'status'

	}, {key:'application', ...options}),

	companyMerchantApplication : async (options:Record<string,any> = {}) => await query('company', {
		
		variables	: {companyId:'String!'},
		fields		: CompanyGetMerchantApplication
	
	}, {field:'merchantApplicationDetails', ...options}),

	// admin

	companiesAdmin : async (options:Record<string,any> = {}) => await query('companies', {
	
		variables : {
			_sub : {
					orders : {
							args : {
									filterBy : {
											status : 'String'
										}
								}
						}
				}
		},
		fields:CompanyAdmin
	
	}, {...options}),

	companyAdmin : async (options:Record<string,any> = {}) => await query('companyAdmin', {
	
		variables	: {
						getBy	: {
								email		:'String',
								id			:'String',
								phoneNumber	:'String',
							},
						_sub	: {
								orders : {
										args : {
												filterBy : {
														status : 'StatusValues'
													}
											}
									}
							}
					},
		fields		: CompanyAdmin
	
	}, {key:'company', ...options}),

	ziftIdAdmin : async (options:Record<string,any> = {}) => await mutate('merchantApplicationApprove', {

		variables	: {
						companyId	:'String!',
						input		: {
							ziftAccountId :'String!',
						},
					},
		fields		: 'status'

	}, {...options}),

	distributors : async (options:Record<string,any> = {}) => await query('companies', {
		
		variables	: {
						filterBy : {
							role : 'Role'
						}
					},
		fields		: Distributor
	
	}, {key:'distributors', ...{...options, variables:{filterBy_role:'DISTRIBUTOR'}}}),

	distributorLocations : async (options:Record<string,any> = {}) => await query('distributorLocations', {fields:DistributorLocations}, {...options}),

}