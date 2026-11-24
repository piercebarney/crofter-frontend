export interface Money {
	amount:		string
	asString:	string
	currency?:	string
}

export type Fulfillment = 'delivery' | 'pick_up'

export type Hours = {
	array: {day:string,time:string}[]
	string: string
}