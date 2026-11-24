export interface Alert {
	actions?:		{
						text:	string
						action:	()=>{}
					}[]
	buttons?:		boolean|{
		accept?:	string
		deny?:		string
	}
	dismissAble?:	boolean
	dismissWait?:	number
	exception?:		string[]|null
	links?:			{
						text:	string
						url:	string
					}[]
	loggedIn?:		boolean
	message?:		string
	pages?:			string[]
	resolve?:		any
	sections?:		string[]
	title?:			string
	type?:			string
}