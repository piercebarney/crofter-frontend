<script lang="ts">

	import type { OrderByProduct_Company } from 'src/types/order'

	import { search } from 'src/features/groups/search/store'
	import { layout } from 'src/stores/layout'
	import { fulfillments as f } from 'src/lists/fulfillments'
	import { orderStatuses as s } from 'src/lists/order-statuses'
	import Button from 'src/components/elements/button.svelte'



	export let products: 	OrderByProduct_Company[]|null
	export let company:		any

	$: isMobile	= $layout.isMobile
	$: isTablet	= $layout.isTablet

</script>



<div class="orders-by-product-wrapper">

	{#if products && products.length > 0 && $search.searching == false}

		{#if isMobile}

			<table class="mobile">
				<tbody>

					{#each products as {id, newCount, newQuantity, orders, quantity, title} (id)}

						<tr class="product">
							<td>
								<span class="title">{title}</span>
							</td>
						</tr>
						<tr class="details">
							<td>

								<span class="total">{quantity} Ordered</span>


								{#if newQuantity > 0}
									
									<span class="divide">|</span>
									<span class="needed">{newQuantity} Needed</span>

								{/if}

							</td>
						</tr>

						{#each orders as {createdDate, distributorLocation, fulfillment, orderId, orderItemId, status:statusId, user, quantity:orderQuantity} (orderId)}

							{@const status = s.name(statusId)}

							<tr class="order">
								<td>
									<div>
										<div>

											{#if distributorLocation}

												<span class="location">{distributorLocation.city}</span>

											{/if}

										</div>
										<div>
											<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
											<span class="customer">{user.firstName} {user.lastName}</span>
										</div>
										<div>
											<span class="ordered">x {orderQuantity}</span>
											<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
											<span class="item-status">{s.titleById(statusId)}</span>
										</div>
										<div>

											<div class="details-button">

												<Button modal="company-order-details" data={{orderId}} outline text pill mini>Details</Button>
		
											</div>

											{#if status == 'new'}

												<div class="order-buttons">
		
													<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('ready'))} pill mini>Mark as Ready</Button>
		
												</div>
<!-- 						
											{:else if status == 'ready'}
		
												<div class="order-buttons">
						
													<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('new'))} outline pill mini>Mark as Not Ready</Button>
		
												</div> -->
						
											{/if}

										</div>
									</div>
								</td>
							</tr>

						{/each}

						<tr class="buttons">
							<td>

								{#if orders.length > 1 && newCount > 1}

									<div class="product-buttons">
										
										<Button action={() => company.ordersUpdateProductOrderStatus(id, s.id('ready'))} outline text pill mini>Mark All as Ready</Button>
					
									</div>
					
								{/if}

							</td>
						</tr>

					{/each}

				</tbody>

			</table>

		{:else if isTablet}

			<table class="tablet">
				<tbody>

					{#each products as {id, newCount, newQuantity, orders, quantity, title} (id)}

						<tr class="product">
							<td colspan="4">
								<span class="title">{title}</span>
							</td>
							<td>
								<div>

									<span class="total">{quantity} Ordered</span>

									{#if newQuantity > 0}
										
										<span class="divide">|</span>
										<span class="needed">{newQuantity} Needed</span>

									{/if}

								</div>
							</td>
						</tr>

						{#each orders as {createdDate, distributorLocation, fulfillment, orderId, orderItemId, status:statusId, user, quantity:orderQuantity} (orderItemId)}

							{@const status = s.name(statusId)}

							<tr class="order">
								<td>
									<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
								</td>
								<td>

									{#if distributorLocation}

										<span class="location">{distributorLocation.city}</span>

									{/if}

									<span class="customer">{user.firstName} {user.lastName}</span>
								</td>
								<td>
									<div class="details-button">

										<Button modal="company-order-details" data={{orderId}} outline text pill mini>View Details</Button>

									</div>
								</td>
								<td>
									<div>
										<span class="ordered">x {orderQuantity}</span>
										<span class="divide">|</span>
										<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
										<span class="divide">|</span>
										<span class="item-status">{s.titleById(statusId)}</span>
									</div>
								</td>
								<td>
									
									{#if status == 'new'}

										<div class="order-buttons">

											<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('ready'))} pill mini>Mark as Ready</Button>

										</div>
				
									<!-- {:else if status == 'ready'}

										<div class="order-buttons">
				
											<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('new'))} outline pill mini>Mark as Not Ready</Button>

										</div> -->
				
									{/if}

								</td>
							</tr>

						{/each}

						<tr class="buttons">
							<td colspan="5">

								{#if orders.length > 1 && newCount > 1}

									<div class="product-buttons">
										
										<Button action={() => company.ordersUpdateProductOrderStatus(id, s.id('ready'))} outline text pill mini>Mark All as Ready</Button>
					
									</div>
					
								{/if}

							</td>
						</tr>

					{/each}

				</tbody>

			</table>

		{:else}

			<table class="desktop">
				<tbody>

					{#each products as {id, newCount, newQuantity, orders, quantity, title} (id)}

						<tr class="product">
							<td colspan="4">
								<span class="title">{title}</span>
							</td>
							<td>
								<div>

									<span class="total">{quantity} Ordered</span>

									{#if newQuantity > 0}
										
										<span class="divide">|</span>
										<span class="needed">{newQuantity} Needed</span>

									{/if}

								</div>
							</td>
						</tr>

						{#each orders as {createdDate, distributorLocation, fulfillment, orderId, orderItemId, status:statusId, user, quantity:orderQuantity} (orderItemId)}

							{@const status = s.name(statusId)}

							<tr class="order">
								<td>
									<span class="date">{new Date(createdDate).toLocaleDateString('en-us', {month:'short', day:'numeric'})}</span>
								</td>
								<td>


									{#if distributorLocation}

										<span class="location">{distributorLocation.city}</span>

									{/if}

									<span class="customer">{user.firstName} {user.lastName}</span>
								</td>
								<td>
									<div class="details-button">

										<Button modal="company-order-details" data={{orderId}} outline text pill mini>View Details</Button>

									</div>
								</td>
								<td>
									<div>
										<span class="ordered">x {orderQuantity}</span>
										<span class="divide">|</span>
										<span class="fulfillment">{f.get('id', fulfillment)?.description}</span>
										<span class="divide">|</span>
										<span class="item-status">{s.titleById(statusId)}</span>
									</div>
								</td>
								<td>
									
									{#if status == 'new'}

										<div class="order-buttons">

											<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('ready'))} pill mini>Mark as Ready</Button>

										</div>
				
									<!-- {:else if status == 'ready'}

										<div class="order-buttons">
				
											<Button action={() => company.ordersUpdateOrderItemStatus(orderId, orderItemId, s.id('new'))} outline pill mini>Mark as Not Ready</Button>

										</div> -->
				
									{/if}

								</td>
							</tr>

						{/each}

						<tr class="buttons">
							<td colspan="5">

								{#if orders.length > 1 && newCount > 1}

									<div class="product-buttons">
										
										<Button action={() => company.ordersUpdateProductOrderStatus(id, s.id('ready'))} outline text pill mini>Mark All as Ready</Button>
					
									</div>
					
								{/if}

							</td>
						</tr>

					{/each}

				</tbody>
			</table>

		{/if}

	{:else if products && products.length == 0 && $search.active == false}

		<div class="empty">You have no open orders.</div>

	{:else if products && products.length == 0 && $search.active == true}

		<div class="empty">Your search returned no restuls.</div>

	{:else}

		<div class="empty">Loading...</div>

	{/if}

</div>



<style lang="sass">

	.orders-by-product-wrapper
		
		.empty
			padding-top: 2rem
			font-size: 1.5rem
			text-align: center

		table

			div,
			span
				display: inline-block
				width: max-content
				line-height: normal

			tr

				&.order:hover

					td
						background-color: var(--cm-utility-highlight)

			&.mobile
				table-layout: fixed

				tr
					
					&.product

						td
							padding-left: 0
							padding-right: 0
							border-color: var(--cm-text-secondary-dark)

							span
								width: 100%

					&.product:not(:first-child)

						td
							padding-top: 4rem

					&.order

						td

							> div								
								width: 100%
								@include flex-col(.5rem)

								> div:nth-child(2)									
									width: 100%
									@include flex-row-middle-left(.5rem)

								> div:nth-child(3)									
									width: 100%
									@include flex-row-middle-between(.5rem)

									.ordered
										min-width: 40px

									.fulfillment
										min-width: 60px
										text-align: center

									.item-status
										min-width: 46px
										text-align: right

								> div:last-child									
									margin-left: -.5rem
									width: calc(100% + .5rem)
									@include flex-row-middle-between(.5rem)

					&.details

						td
							text-align: center

					&.buttons

						td
							height: 43px
							min-height: 43px
							text-align: right
							border-color: transparent

			&.tablet

				tr

					&.product

						td
							border-color: var(--cm-text-secondary-dark)

						td:first-child
							padding-left: 0

						td:last-child
							text-align: right

					&.product:not(:first-child)

						td
							padding-top: 2.5rem

					&.order

						td:nth-child(2)
							width: 100%
							padding-left: 0
							padding-right: 0

						td:nth-child(4)
							min-width: 116px
							padding-left: 0
							padding-right: 0

					&.buttons

						td
							height: 39px
							min-height: 39px
							text-align: right
							border-color: transparent

			&.desktop

				tr

					&.product

						td
							border-color: var(--cm-text-secondary-dark)

						td:first-child
							padding-left: 0

						td:last-child
							text-align: right

					&.product:not(:first-child)

						td
							padding-top: 3rem

					&.order

						td:nth-child(2)
							width: 100%
							padding-left: 0
							padding-right: 0

						td:nth-child(4)
							min-width: 148px
							padding-left: 0
							padding-right: 0

					&.buttons

						td
							height: 43px
							min-height: 43px
							text-align: right
							border-color: transparent

			.location
				color: var(--cm-primary)

			.title
				white-space: nowrap
				overflow: hidden
				text-overflow: ellipsis
				font-size: 1.25rem

			.product-buttons
				width: 180px

			.date
				width: max-content
				min-width: max-content
				font-weight: 600

			.customer
				white-space: nowrap
				overflow: hidden
				text-overflow: ellipsis

			.order-buttons
				width: 180px

	@media (min-width: #{breakpoint('md')})

		.orders-by-product-wrapper

			table

				.total
					font-weight: 600

				.needed
					font-weight: 600

				.product-buttons
					width: 145px

				.title
					width: 330px
					font-weight: 600

				.order-buttons
					width: 145px

				.customer
					width: 165px


	@media (min-width: #{breakpoint('lg')})

		.orders-by-product-wrapper

			table

				.product-buttons
					width: 180px

				.title
					width: 525px

				.order-buttons
					width: 180px
				
				.customer
					width: 315px

	@media (min-width: #{breakpoint('xl')})

		.orders-by-product-wrapper

			table

				.title
					width: 775px
				
				.customer
					width: 565px

	@media (min-width: #{breakpoint('xxl')})

		.orders-by-product-wrapper

			table

				.title
					width: 1025px
				
				.customer
					width: 815px

</style>