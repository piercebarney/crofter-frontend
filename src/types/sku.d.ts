export interface Sku {
	active: boolean
	canDeliver: boolean
	canPickUp: boolean
	code: string
	displayOrder: number|null
	id: string
	keeperId: string
	variantId: string
	variant?: any
}