import { listFuncs } from 'src/lists/listHelpers'

// Error code format is [domain]-[category]-[number]. All front-end errors are in the WEB domain. This includes server-side errors.
const list: Record<string,any>[] = [
	// Account errors (ACT)
	{id:'ACT-USR-1',	title:null,						detail:null,													message:'Incorrect email or password. Please try again.'},													// Incorrect email or password
	{id:'ACT-IMP-1',	title:null,						detail:null,													message:'Unable to impersonate user. Please check your permissions.'},										// Failed impersonation
	
	// Order creation errors (ORD-CRT)
	{id:'ORD-CRT-0',	title:null,						detail:null,													message:'Your cart is empty. Please add items to your order.'},												// Missing order items
	{id:'ORD-CRT-1',	title:null,						detail:null,													message:'Please provide a delivery address for your order.'},												// Missing delivery address for delivery fulfillment
	{id:'ORD-CRT-2',	title:null,						detail:null,													message:'Please select a pick-up location for your order.'},												// Missing pick-up location for pick-up fulfillment
	{id:'ORD-CRT-3',	title:null,						detail:null,													message:'Unable to calculate order total. Please contact support.'},										// Missing sales_tax on order_item
	{id:'ORD-CRT-4',	title:null,						detail:null,													message:'Cannot combine different promotions in one order. Please use one promotion at a time.'},			// Mixed promotion_ids
	{id:'ORD-CRT-5',	title:null,						detail:null,													message:'Some items are no longer available. Please refresh the page and try placing your order again.'},	// Inactive order items present
	
	// Order ready errors (ORD-RDY)
	{id:'ORD-RDY-1',	title:null,						detail:null,													message:'Mixed order statuses. Contact dev team.'},															// Not all items :ordered status
	{id:'ORD-RDY-2',	title:null,						detail:null,													message:'Some order items already have transactions. Contact dev team.'},									// Item(s) have existing transaction(s)
	{id:'ORD-RDY-3',	title:null,						detail:null,													message:'Order pricing information is incomplete. Contact dev team.'},										// Item(s) missing price_when_ordered and/or sales_tax
	{id:'ORD-RDY-4',	title:null,						detail:null,													message:'User missing payment token. Contact dev team.'},													// User missing payment token
	
	// Payment errors (PMT-CHG)
	{id:'PMT-CHG-1',	title:null,						detail:null,													message:'Payment declined due to insufficient funds.'},														// "Insufficient Funds" from payment processor
	{id:'PMT-CHG-2',	title:null,						detail:null,													message:'Payment method is no longer valid.'},																// "Account Closed" from payment processor
	
	// Frontend network errors (WEB-NET)
	{id:'WEB-NET-1',	title:'Connection Lost',		detail:'Network offline or connection lost',					message:'Something went wrong. Please check your internet connection and try again.'},
	{id:'WEB-NET-2',	title:'Request Timeout',		detail:'Request exceeded 30s timeout (client-side)',			message:'Something went wrong with our connection. Please try again.'},
	{id:'WEB-NET-3',	title:'Too Many Requests',		detail:'Rate limiting (429) or too many parallel requests',		message:'Something went wrong with our connection. Please try again.'},
	{id:'WEB-NET-4',	title:'Connection Failed',		detail:'Fetch failed, DNS error, or CORS issue',				message:'Something went wrong with our connection. Please try again.'},
	{id:'WEB-NET-5',	title:'Service Unavailable',	detail:'Circuit breaker open or 503 response',					message:'Service temporarily unavailable. Please try again in a few moments.'},
	
	// Frontend validation errors (WEB-VAL)
	// {id:'WEB-VAL-1',	title:'Validation Failed',			detail:'Form validation failed',								message:'Please check your input and try again.'},
	// {id:'WEB-VAL-2',	title:'Required Fields Missing',		detail:'Required field validation',								message:'Required fields are missing. Please complete all required fields.'},
	// {id:'WEB-VAL-3',	title:'Invalid Format',				detail:'Format validation (email, phone, etc.)',				message:'Invalid format. Please check your input.'},
	// {id:'WEB-VAL-4',	title:'Value Out of Range',			detail:'Range validation (min/max)',							message:'Value is out of range. Please enter a valid value.'},
	
	// Frontend storage errors (WEB-STR)
	// {id:'WEB-STR-1',	title:'Storage Full',				detail:'localStorage full or unavailable',						message:'Unable to save data locally. Please clear browser storage and try again.'},
	// {id:'WEB-STR-2',	title:'Session Expired',				detail:'Session expired or invalid',							message:'Your session has expired. Please sign in again.'},
	// {id:'WEB-STR-3',	title:'Cache Read Error',			detail:'Cache read error',										message:'Unable to load cached data. Please refresh the page.'},
	
	// Frontend API errors (WEB-API)
	{id:'WEB-API-1',	title:'API Error',				detail:'Generic API error',										message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-API-2',	title:'Invalid Request',		detail:'Malformed request or invalid parameters',				message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-API-3',	title:'Permission Denied',		detail:'Authorization error (403)',								message:'You do not have permission to perform this action.'},
	{id:'WEB-API-4',	title:'Not Found',				detail:'Not found error (404)',									message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-API-5',	title:'Request Cancelled',		detail:'AbortController cancelled request',						message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	
	// Server-side API proxy errors (WEB-SRV)
	{id:'WEB-SRV-1',	title:'Server Error',			detail:'Generic server API error (default)',					message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-2',	title:'Partial Load Failure',	detail:'Partial data load failure',								message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-3',	title:'Service Unavailable',	detail:'Backend service unavailable (500, 502, 503)',			message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-4',	title:'Connection Failed',		detail:'Backend connection failed (fetch error)',				message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-5',	title:'Data Format Error',		detail:'JSON parse error or invalid response format',			message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-6',	title:'Method Not Found',		detail:'Method doesn\'t exist on apiV2',						message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-7',	title:'Server Timeout',			detail:'Server-side timeout (AbortController)',					message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-8',	title:'Invalid Response',		detail:'Response missing expected fields',						message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-9',	title:'External API Error',		detail:'External API error (non-2xx with error in response)',	message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'},
	{id:'WEB-SRV-10',	title:'Processing Error',		detail:'Response processing error',								message:'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'}
]

export const errorCodeList = list

export const errorCodes = { ...listFuncs(list),

	message : (id:string) => `${list.find((type:Record<string,any>) => type.id == id)?.message} (${id})`,
	title   : (id:string) => list.find((type:Record<string,any>) => type.id == id)?.title,
	detail  : (id:string) => list.find((type:Record<string,any>) => type.id == id)?.detail,
	object  : (id:string) => {
		
		const errorListItem = list.find((type:Record<string,any>) => type.id == id)

		return {
			code	: id,
			title	: errorListItem?.title || null,
			detail	: errorListItem?.detail || null,
			message	: `${errorListItem?.message || 'Something went wrong and we want to make it right: please click the Chat button or email us at support@crofter.com'} (${id})`
		}
	}
 }