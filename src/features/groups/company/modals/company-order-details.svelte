<script lang="ts">

	import { api } from 'src/lib/api'
	import { page } from '$app/stores'
	import { goto } from '$app/navigation'
	import { search } from 'src/features/groups/search/store'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { orderStatuses } from 'src/lists/order-statuses'
	import Container from 'src/features/modules/modal/container.svelte'
	import Button from 'src/components/elements/button.svelte'



	export let modal: any

	if ($page.url.search) modal.onClose(() => goto('/fulfillment', {replaceState:true}))

	const orderId	= $modal.data.orderId
	const company	= $modal.data.company
	const fetch		= $modal.data.fetch

	let orders: any,
		order:	any

	const cancelOrder = () => {

		modal.alert({

			type	: 'danger',
			message	: "You are about to cancel an order. This cannot be undone."

		}).then( async () => {

			const { result, error } = await company.orderCancel(orderId)

			if (error && error.message.message.includes('Failed to Cancel Order:')) {

				modal.alert({

					type:		'danger',
					title:		'Could Not to Cancel Order',
					message:	error.message.message.replace('Failed to Cancel Order: ', ''),
					buttons:	{ deny: 'OK' }
				})

			} else {

				if (result && result.success) {
					
					fetch()

					modal.alert({

						type:		'success',
						title:		'Order Canceled',
						message:	'Your order was successfully canceled. An email has been sent to notify the customer.',
						buttons:	{ accept: 'OK' }
					
					}).then( () => modal.close() )
				
				} else {

					modal.alert({

						type:		'danger',
						title:		'Error',
						message:	'An unknown error has occurred. Please contact support if the issue persists.',
						buttons:	{ deny: 'OK' }
					})
				}
			}
		})
	}

	const searchPhone = (phone:string) => {
		
		search.setTerm(phone)
		
		modal.close()
	}

	if (orderId) (async () => ({ orders } = await api.orderDetails_company({ variables:{defaultCompany:true, filterBy_id:orderId} })))()

	$: if (orders && orders.length == 1) order = orders[0]

</script>



<Container label="Order Details" {modal} deleteButtonText="Cancel Order" onDelete={cancelOrder}>

	{#if order}
	
		<ul>
			<li>
				<span class="label">ID:</span>
				<span>{order.id}</span>
			</li>
			<li>
				<span class="label">Date Created:</span>
				<span>{new Date(order.createdDate).toLocaleDateString('en-us')}</span>
			</li>
			<li>
				<span class="label">Date Updated:</span>
				<span>{new Date(order.updatedDate).toLocaleDateString('en-us')}</span>
			</li>
			<li>
				<span class="label">Customer:</span>
				<table>
					<tbody>
						<tr>
							<td width="1%"><i>name:</i></td>
							<td>{order.user.firstName} {order.user.lastName}</td>
						</tr>
						<tr>
							<td><i>phone:</i></td>
							<td><Button action={() => searchPhone(order.user.phoneNumber)} role="link" underline>{order.user.phoneNumber}</Button></td>
						</tr>
						<tr>
							<td><i>email:</i></td>
							<td>{order.user.email}</td>
						</tr>

						{#if order.deliveryAddress}

							<tr>
								<td><i>address:</i></td>
								<td>
									{#if order.deliveryAddress.address1}{order.deliveryAddress.address1}<br>{/if}
									{#if order.deliveryAddress.address2}{order.deliveryAddress.address2}<br>{/if}
									{#if order.deliveryAddress.address1}{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}<br>{/if}
								</td>
							</tr>

						{/if}

					</tbody>
				</table>			
			</li>
			<li>
				<span class="label">Totals:</span>
				<table>
					<tbody>
						<tr>
							<td width="1%"><i>Subtotal:</i></td>
							<td>{order.subTotal.asString}</td>
						</tr>
						<tr>
							<td><i>Tax:</i></td>
							<td>{order.salesTax.asString}</td>
						</tr>
						<tr>
							<td><i>Total:</i></td>
							<td>{order.total.asString}</td>
						</tr>
					</tbody>
				</table>
			</li>
			<li>
				<span class="label">Items ({order.orderItems.length}):</span>
				<ol>
					
					{#each order.orderItems as {distributorLocation, fulfillment, priceWhenOrdered, product, quantity, salesTax, status, subTotal, total} (product.id)}

						<li>
							<table>
								<tbody>
									<tr>
										<td width="1%"><i>product:</i></td>
										<td>{product.title}</td>
									</tr>

									{#if distributorLocation}
									
										<tr>
											<td><i>location:</i></td>
											<td>{distributorLocation.city}</td>
										</tr>
										<tr>
											<td><i>company:</i></td>
											<td>{product.company.name}</td>
										</tr>

									{/if}

									<tr>
										<td><i>status:</i></td>
										<td>{orderStatuses.name(status)}</td>
									</tr>
									<tr>
										<td><i>fulfillment:</i></td>
										<td>{f.name(fulfillment)}</td>
									</tr>
									<tr>
										<td><i>quantity:</i></td>
										<td>{quantity}</td>
									</tr>
									<tr>
										<td><i>price:</i></td>
										<td>{priceWhenOrdered.asString}/{product.unit.toLowerCase()}</td>
									</tr>
									<tr>
										<td><i>subtotal:</i></td>
										<td>{subTotal.asString}</td>
									</tr>
									<tr>
										<td><i>tax:</i></td>
										<td>{salesTax?.asString ?? '$0.00'}</td>
									</tr>
									<tr>
										<td><i>total:</i></td>
										<td>{total.asString}</td>
									</tr>
								</tbody>
							</table>
						</li>

					{/each}

				</ol>
			</li>
		</ul>

	{/if}

</Container>



<style lang="sass">

	ul
		margin: 0
		padding: 0

		li
			list-style-type: none
			margin: 0 0 1rem 0
			padding: 0 0 0 .5rem

			.label
				margin: 0 0 .25rem -0.5rem
				font-weight: bold

			ol
				margin: 0

				li
					list-style: decimal
					margin: 0 0 1rem 0
					padding: 0 0 0 .5rem

</style>