<script lang="ts">

	import { browser } from '$app/environment'
	import { company as c } from 'src/stores/company/store'
	import { user } from 'src/stores/user'
	import { format } from 'src/lib/validate'
	import Form from 'src/components/elements/form.svelte'
	import Textarea from 'src/components/elements/textarea.svelte'
	import Select from 'src/components/elements/select.svelte'


	const companyId = $user.companies[0]?.id

	console.log({companyId})

	let company: 		any		= null,
		application:	any		= {},
		owners:			number	= 0,
		loaded:			boolean	= false

	$: if (browser && $c && companyId) c.load(companyId)

	const onSuccess	= () => console.log('Success')
	const onFailure	= () => console.log('Failure')
	const onFinal	= () => console.log('Final')

	const totalStakePercentage = (v:string, t:HTMLInputElement|null) => {

		if (t && v) {

			if (v.length == 1) t.value = `${v}0%`

			const elements = document.querySelectorAll('input[placeholder="Stake Percentage"]') as NodeListOf<HTMLInputElement>

			let total = 0

			elements.forEach(el => total += parseInt(el.value.replace('%', ''), 10))

			if	(total != 100)	elements.forEach(el => el.classList.add('form-error-input'))
			else				elements.forEach(el => el.classList.remove('form-error-input'))
		}
	}

	$: if ($c.companies.length > 0) company = c.get(companyId)

	$: if ($company && !$company.merchantApplicationDetails) company.merchantApplicatoinFetch()

	$: if ($company && $company.merchantApplicationDetails && !loaded) {

		console.log($company.merchantApplicationDetails.application)
		
		application = $company.merchantApplicationDetails.application
		owners		= application.owners.length
		loaded		= true
	}

</script>



<div>

	<Form action="/account?/companyMerchantApplicationSave" {onSuccess} {onFailure} {onFinal}>

		<input type="hidden" name="companyId" value={companyId} />

		<h1>BUSINESS</h1>
		<label for="html">
			<span>Legal Name</span>
			<input type="text" name="business_legalName" placeholder="Legal Name" value={application?.business?.legalName ?? ''} maxlength="50" />
			<span class="sub">business.legalName (Business Legal Name)</span>
			<pre>
My Business Legal Name LLC
Required string-50
This is the merchants legal business name. It needs to be exactly how the merchant has their legal name registered with the IRS (what they use to file their taxes) and needs to match with the Tax ID value provided in the business.taxId field.
This field does not support apostrophe's
			</pre>
		</label>
		<label for="html">
			<span>Business Name</span>
			<input type="text" name="business_businessName" placeholder="Business Name" maxlength="50" />
			<span class="sub">business.businessName (Business DBA Name)</span>
			<pre>
My Business DBA Name
Required string-50
The trade name or DBA name of the merchant. Minimum of three characters in this field.
			</pre>
		</label>

		<br />
		<br />
		<br />

		<label for="html">
			<span>Address 1</span>
			<input type="text" name="business_address_address1" placeholder="Address 1" maxlength="128" />
			<span class="sub">business.street1 (Business Legal Address)</span>
			<pre>
135 West 50th Street
Required string-128
Physical street address of the merchants business location. No PO Boxes
			</pre>
		</label>
		<label for="html">
			<span>Address 2</span>
			<input type="text" name="business_address_address2" placeholder="Address 2" maxlength="128" />
			<span class="sub">business.street2 (Apt. #, Unit # etc. (optional))</span>
			<pre>
Seventh Floor
Optional string-128
Unit number, suite number etc. of the merchants business.
			</pre>
		</label>
		<label for="html">
			<span>City</span>
			<input type="text" name="business_address_city" placeholder="City" maxlength="50" />
			<span class="sub">business.city (City)</span>
			<pre>
New York
Required string-50
City of the merchant's business location.
			</pre>
		</label>
		<label for="html">
			<span>State</span>

			<Select list="states" name="business_address_state" placeholder="State" />

			<span class="sub">business.state (State)</span>
			<pre>
NY
Required string-3
State of the merchant's business location.
			</pre>
		</label>
		<label for="html">
			<span>Zip Code</span>
			<input type="text" name="business_address_zipCode" placeholder="Zip Code" on:click={format.zipCode} on:keydown={format.zipCode} on:blur={format.zipCode} />
			<span class="sub">business.zipCode (Zip Code)</span>
			<pre>
10020
Required string-15
Zip/Postal code of the merchant's business location.
			</pre>
		</label>
		<label for="html">
			<span>Descriptor Phone</span>
			<input type="text" name="business_descriptorPhone" placeholder="Descriptor Phone" on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:blur={format.phoneNumber} />
			<span class="sub">business.descriptorPhone (Customer Service Phone Number)</span>
			<pre>
8774561382
Required string-10
Customer service phone number of the merchant's business that is shown on card/account holder statements.
This field only supports a 10 digit phone number. ex: 5449009876
			</pre>
		</label>

		<br />
		<br />
		<br />

		<label for="html">
			<span>Business Description</span>

			<Textarea name="business_description" placeholder="What products do you sell?" maxlength={255} rows={2} />

			<span class="sub">business.description (Business Description)</span>
			<pre>
Description of the stuff I sell
Required string-255
Description of the merchant's business; e.g. the products and/or services they sell.
			</pre>
		</label>
		<label for="html">
			<span>Time Zone Code</span>

			<Select list="time-zones" name="business_timeZoneCode" placeholder="Time Zone Code" />

			<span class="sub">business.timeZoneCode (Business Time Zone)</span>
			<pre>
MST
Required string-20
Time zone the merchant's business operates in. The field supports the following time zone values:
•	EST
•	CST
•	MST
•	PST
			</pre>
		</label>

		<br />
		<br />
		<br />

		<label for="html">
			<span>Ownership Structure Type</span>

			<Select list="business-types" name="business_ownershipStructureType" placeholder="Ownership Structure Type" />

			<span class="sub">business.ownershipStructureType (Business Type)</span>
			<pre>
LLC
Required enum
Ownership structure type of the merchant's company.
Value	Description
C		Public Corporation
GA		Government Agency
GP		General Partnership
LLC		Limited Liability Company
NP		Nonprofit Corporation
PC		Private Corporation
SP		Sole Proprietorship
			</pre>
		</label>
		<label for="html">
			<span>Registration Year</span>
			<input type="text" name="business_registrationYear" placeholder="Registration Year" maxlength="4" />
			<span class="sub">business.registrationYear (Business Start Date)</span>
			<pre>
2015
Required string-4
The year the merchant's business was registered. format: yyyy
			</pre>
		</label>
		<label for="html">
			<span>Tax ID</span>
			<input type="text" name="business_taxId" placeholder="Tax ID" on:click={format.taxId} on:keydown={format.taxId} on:blur={format.taxId} />
			<span class="sub">business.taxId (Tax ID (SSN for Sole Proprietor))</span>
			<pre>
451165801
Required string-9
This is the merchant's 9 digit IRS issued TAX ID number. This value must match with the legal name provided and match the IRS records.
			</pre>
		</label>



		<!-- <label for="html">
			<span>Country (HARD CODED)</span>
			<input type="text" name="business_address_country" placeholder="Country" value="US" disabled />
			<span class="sub">business.countryCode (???)</span>
			<pre>
US
Required string-2
Country of the merchant's business location.
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Merchant Category Code (HARD CODED)</span>
			<input type="text" name="business_merchantCategoryCode" placeholder="Merchant Category Code" value="5499" disabled />
			<span class="sub">business.merchantCategoryCode (???)</span>
			<pre>
7399
Required string-4
Please work with us to determine this value in production. It is an industry defined category code. While working in sandbox you can use 7399.
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Contact Phone</span>
			<input type="text" name="business_contactPhone" placeholder="Contact Phone" disabled />
			<span class="sub">business.contactPhone (N/A)</span>
			<pre>
8014850524
Optional string-15
Contact phone number for the business.
This field only supports a 10 digit phone number. ex: 5449009876
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Email (N/A)</span>
			<input type="text" name="business_email" placeholder="Email" value="N/A" disabled />
			<span class="sub">business.email (???)</span>
			<pre>
business.email@zift.io
Required string-100
Contact email for the business.
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Direct Debit Descriptor (N/A)</span>
			<input type="text" name="business_directDebitDescriptor" placeholder="Direct Debit Descriptor" value="N/A" disabled />
			<span class="sub">business.directDebitDescriptor (N/A)</span>
			<pre>
Optional string-21
Use this field to specify the description on the bank account holder's statements. The field format is 10 characters : and then 10 more charcters. Supported characters are letters, numbers, commas, apostrophe's, period's, and dash's. Does not support any other characters. If a value isn't specified in this field the descriptor will be pulled from the merchant's DBA name which is the business.businessName field and will be combined with the customer service phone number from the business.descriptorPhone field.
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Website (N/A)</span>
			<input type="text" name="business_website" placeholder="Website" value="N/A" disabled />
			<span class="sub">business.website (???)</span>
			<pre>
zift.io
Required string-255
Merchant's website. This field doesn't support https:// in the address. For example, please submit as www.zift.io or zift.io, do not submit https://zift.io.
			</pre>
		</label> -->
		<!-- <label for="html">
			<span>Payment Card Descriptor (N/A)</span>
			<input type="text" name="business_paymentCardDescriptor" placeholder="Payment Card Descriptor" value="N/A" disabled />
			<span class="sub">business.paymentCardDescriptor (N/A)</span>
			<pre>
Optional string-21
Use this field to specify the description on the cardholders statements. The field has a 21 character limit, supports letters, numbers, commas, apostrophe's, period's, and dash's. Does not support any other characters. If a value isn't specified in this field the cardholder descriptor will be pulled from the merchants DBA name which is the business.businessName field and will be combined with the customer service phone number from the business.descriptorPhone field.
			</pre>
		</label> -->

		<br />
		<br />
		<br />

		<h1>ESTIMATES</h1>
		<label for="html">
			<span>Annual Cards Volume</span>

			<Select list="transaction-volumes" name="estimates_annualCardsVolume" placeholder="Annual Cards Volume" />

			<span class="sub">estimates.annualCardsVolume (Annual Credit Card Volume)</span>
			<pre>
900000
Required integer
Estimated annual credit card volume of the merchant's business.
			</pre>
		</label>
		<label for="html">
			<span>Annual Direct Debit Volume</span>

			<Select list="transaction-volumes" name="estimates_annualDirectDebitVolume" placeholder="Annual Direct Debit Volume" />
			
			<span class="sub">estimates.annualDirectDebitVolume (Annual ACH Volume)</span>
			<pre>
900000
Required integer
Estimated annual ACH volume of the merchant's business.
			</pre>
		</label>
		<label for="html">
			<span>Average Cards Transaction Amount</span>

			<Select list="transaction-amounts" name="estimates_avgCardsTransactionAmount" placeholder="Average Cards Transaction Amount" />

			<span class="sub">estimates.avgCardsTransactionAmount (Average Transaction)</span>
			<pre>
250
Required integer
The merchant's average credit card transaction size.
			</pre>
		</label>
		<label for="html">
			<span>Average Direct Debit Transaction Amount</span>

			<Select list="transaction-amounts" name="estimates_avgDirectDebitTransactionAmount" placeholder="Average Direct Debit Transaction Amount" />

			<span class="sub">estimates.avgDirectDebitTransactionAmount (???)</span>
			<pre>
250
Required integer
The merchant's average ACH transaction size
			</pre>
		</label>
		<label for="html">
			<span>Max Transaction Amount</span>

			<Select list="transaction-amounts" name="estimates_maxTransactionAmount" placeholder="Max Transaction Amount" />

			<span class="sub">estimates.maxTransactionAmount (Largest Transaction)</span>
			<pre>
3000
Required integer
The merchant's highest potential single transaction size.
			</pre>
		</label>

		<br />
		<br />
		<br />

		<h1>OFFICER</h1>
		<label for="html">
			<span>Address 1</span>
			<input type="text" name="officer_address_address1" placeholder="Address 1" maxlength="128" />
			<span class="sub">officer.street1 (Home Address (no P.O. box))</span>
			<pre>
251 North Bristol Avenue
Required string-128
Physical street address of the merchants business location. No PO Boxes
			</pre>
		</label>
		<label for="html">
			<span>Address 2</span>
			<input type="text" name="officer_address_address2" placeholder="Address 2" maxlength="128" />
			<span class="sub">officer.street2 (Apt. #, Unit # etc. (optional))</span>
			<pre>
Optional string-128
Apt. #, Unit # etc.
			</pre>
		</label>
		<label for="html">
			<span>City</span>
			<input type="text" name="officer_address_city" placeholder="City" maxlength="50" />
			<span class="sub">officer.city (City)</span>
			<pre>
Los Angeles
Required string-50
City of the Officer's personal residence.
			</pre>
		</label>
		<label for="html">
			<span>State</span>

			<Select list="states" name="officer_address_state" placeholder="State" />

			<span class="sub">officer.state (State)</span>
			<pre>
CA
Required string-3
2 character State code. Ex: UT
			</pre>
		</label>
		<label for="html">
			<span>Zip Code</span>
			<input type="text" name="officer_address_zipCode" placeholder="Zip Code" on:click={format.zipCode} on:keydown={format.zipCode} on:blur={format.zipCode} />
			<span class="sub">officer.zipCode (Zip Code)</span>
			<pre>
90001
Required string-15
5 digit zip code, no spaces. Ex: 90001
			</pre>
		</label>
		<label for="html">
			<span>Birth Date</span>
			<input type="text" name="officer_birthDate" placeholder="Birth Date" on:click={format.date} on:keydown={format.date} on:blur={format.date} />
			<span class="sub">officer.birthDate (Date of Birth)</span>
			<pre>
19640906
Required date yyyyMMdd
Birthdate of a company's controlling officer. ex: yyyyMMdd
			</pre>
		</label>
		<label for="html">
			<span>Email</span>
			<input type="text" name="officer_email" placeholder="Email" maxlength="100" on:focus={format.email} on:blur={format.email} />
			<span class="sub">officer.email (Email)</span>
			<pre>
maria@avengers.com
Required string-100
Personal contact or business email address of the officer.
			</pre>
		</label>
		<label for="html">
			<span>First Name</span>
			<input type="text" name="officer_firstName" placeholder="First Name" maxlength="50" />
			<span class="sub">officer.firstName (First Name)</span>
			<pre>
Maria
Required string-50
First name of a company's controlling officer.
			</pre>
		</label>
		<label for="html">
			<span>Last Name</span>
			<input type="text" name="officer_lastName" placeholder="Last Name" maxlength="50" />
			<span class="sub">officer.lastName (Last Name)</span>
			<pre>
Hill
Required string-50
Last name of a company's controlling officer.
			</pre>
		</label>
		<label for="html">
			<span>Phone</span>
			<input type="text" name="officer_phone" placeholder="Phone" on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:blur={format.phoneNumber} />
			<span class="sub">officer.phone (Contact Phone Number)</span>
			<pre>
8774561382
Required string-15
Direct phone number for the officer, preferrably not the customer service number. The field only supports a 10 digit phone number. ex: 8774561382
			</pre>
		</label>
		<label for="html">
			<span>Social Security</span>
			<input type="text" name="officer_socialSecurity" placeholder="Social Security" on:click={format.socialSecurityNumber} on:keydown={format.socialSecurityNumber} on:blur={format.socialSecurityNumber} />
			<span class="sub">officer.socialSecurity (Social Security Number)</span>
			<pre>
554698877
Required string-9
Officer's 9 digit Social Security Number.
			</pre>
		</label>
		<label for="html">
			<span>Title</span>

			<Select list="professional-titles" name="officer_title" placeholder="Title" />

			<span class="sub">officer.title (Title)</span>
			<pre>
General Manager
Required enum
The following values are the only allowed values:
•	Owner
•	Partner
•	Director
•	President
•	CEO
•	CFO
•	Chairman
•	Comptroller
•	General Manager
•	Office Manager
•	Treasurer
•	Vice President
			</pre>
		</label>

		<br />
		<br />
		<br />

		<h1>OWNERS</h1>
		<label for="html">
			<span>How many people own 25% or more of the equity interests of your business?</span>
			<select bind:value={owners}>
				<option value={0} selected>0</option>
				<option value={1}>1</option>
				<option value={2}>2</option>
				<option value={3}>3</option>
				<option value={4}>4</option>
			</select>
		</label>

		{#if owners > 0}
		
			{#each Array(owners) as _, index (index)}
				
				<h2>Owner {index + 1}</h2>
				<label for="html">
					<span>Address 1</span>
					<input type="text" name={`owners_address_address1_${index}`} placeholder="Address 1" maxlength="128" />
					<span class="sub">owner.street1 (Home Address (no P.O. box))</span>
					<pre>
251 North Bristol Avenue
Required string-128
Physical street address of the merchants business location. No PO Boxes
					</pre>
				</label>
				<label for="html">
					<span>Address 2</span>
					<input type="text" name={`owners_address_address2_${index}`} placeholder="Address 2" maxlength="128" />
					<span class="sub">owner.street2 (Apt. #, Unit # etc. (optional))</span>
					<pre>
Optional string-128
Apt. #, Unit # etc.
					</pre>
				</label>
				<label for="html">
					<span>City</span>
					<input type="text" name={`owners_address_city_${index}`} placeholder="City" maxlength="50" />
					<span class="sub">owner.city (City)</span>
					<pre>
Los Angeles
Required string-50
City of the Officer's personal residence.
					</pre>
				</label>
				<label for="html">
					<span>State</span>
		
					<Select list="states" name={`owners_address_state_${index}`} placeholder="State" />
		
					<span class="sub">owner.state (State)</span>
					<pre>
CA
Required string-3
2 character State code. Ex: UT
					</pre>
				</label>
				<label for="html">
					<span>Zip Code</span>
					<input type="text" name={`owners_address_zipCode_${index}`} placeholder="Zip Code" on:click={format.zipCode} on:keydown={format.zipCode} on:blur={format.zipCode} />
					<span class="sub">owner.zipCode (Zip Code)</span>
					<pre>
90001
Required string-15
5 digit zip code, no spaces. Ex: 90001
					</pre>
				</label>
				<label for="html">
					<span>Birth Date</span>
					<input type="text" name={`owners_birthDate_${index}`} placeholder="Birth Date" on:click={format.date} on:keydown={format.date} on:blur={format.date} />
					<span class="sub">owner.birthDate (Date of Birth)</span>
					<pre>
19640906
Required date yyyyMMdd
Birthdate of a company's controlling officer. ex: yyyyMMdd
					</pre>
				</label>
				<label for="html">
					<span>Email</span>
					<input type="text" name={`owners_email_${index}`} placeholder="Email" maxlength="100" on:focus={format.email} on:blur={format.email} />
					<span class="sub">owner.email (Email)</span>
					<pre>
maria@avengers.com
Required string-100
Personal contact or business email address of the officer.
					</pre>
				</label>
				<label for="html">
					<span>First Name</span>
					<input type="text" name={`owners_firstName_${index}`} placeholder="First Name" value={application?.owners[index]?.firstName ?? ''} maxlength="50" />
					<span class="sub">owner.firstName (First Name)</span>
					<pre>
Maria
Required string-50
First name of a company's controlling officer.
					</pre>
				</label>
				<label for="html">
					<span>Last Name</span>
					<input type="text" name={`owners_lastName_${index}`} placeholder="Last Name" maxlength="50" />
					<span class="sub">owner.lastName (Last Name)</span>
					<pre>
Hill
Required string-50
Last name of a company's controlling officer.
					</pre>
				</label>
				<label for="html">
					<span>Phone</span>
					<input type="text" name={`owners_phone_${index}`} placeholder="Phone" on:click={format.phoneNumber} on:keydown={format.phoneNumber} on:blur={format.phoneNumber} />
					<span class="sub">owner.phone (Contact Phone Number)</span>
					<pre>
8774561382
Required string-15
Direct phone number for the officer, preferrably not the customer service number. The field only supports a 10 digit phone number. ex: 8774561382
					</pre>
				</label>
				<label for="html">
					<span>Social Security</span>
					<input type="text" name={`owners_socialSecurity_${index}`} placeholder="Social Security" on:click={format.socialSecurityNumber} on:keydown={format.socialSecurityNumber} on:blur={format.socialSecurityNumber} />
					<span class="sub">owner.socialSecurity (Social Security Number)</span>
					<pre>
554698877
Required string-9
Officer's 9 digit Social Security Number.
					</pre>
				</label>
				<label for="html">
					<span>Stake Percentage</span>
					<input type="text" name={`owners_stakePercentage_${index}`} placeholder="Stake Percentage" on:click={(e) => format.stakePercentage(e, totalStakePercentage)} on:keydown={(e) => format.stakePercentage(e, totalStakePercentage)} on:blur={(e) => format.stakePercentage(e, totalStakePercentage)} />
					<span class="sub">owner.stakePercentage (Ownership Percentage)</span>
					<pre>
56
Conditional integer
Percentage ownership of the legal entity.
					</pre>
				</label>
			{/each}
		
		{/if}

		<button type="submit">Submit</button>

	</Form>

	<br />
	<br />
	<br />

	<Form action="/account?/companyMerchantApplicationSubmit" {onSuccess} {onFailure} {onFinal}>

		<h1>DEPOSIT ACCOUNT</h1>
		<label for="html">
			<span>Account Number</span>
			<input type="text" name="depositAccount_accountNumber" placeholder="Account Number" />
			<span class="sub">deposit.accountNumber (Bank Account Number)</span>
			<pre>
498568875
Required string-50
Bank account number for the merchant's business.
			</pre>
		</label>
		<label for="html">
			<span>Account Type</span>

			<Select list="bank-account-types" name="depositAccount_accountType" placeholder="Account Type" />

			<span class="sub">deposit.accountType (Account Type)</span>
			<pre>
C
Required enum
Bank account type of the merchant's business. Can be C for checking or S for savings.
			</pre>
		</label>
		<label for="html">
			<span>Bank Name</span>
			<input type="text" name="depositAccount_bankName" placeholder="Bank Name" />
			<span class="sub">deposit.bankName (Bank Name)</span>
			<pre>
WELLS FARGO BANK
Required string-80
Name of the merchant's bank where they want us to send deposits.

Allowed Characters:
Description		Character
Alpha			Aa-Zz
Numeric			0-9
Space			 
Comma			,
Period			.
Fwd Slash		/
Dash/Hyphen		-
At Symbol		@
Asterisk		*
L/R Parentheses	( )
Apostrophe		'
Carrot			^
Underscore		_
Equals Sign		=
Acute/Backtic	`
			</pre>
		</label>
		<label for="html">
			<span>Holder Name</span>
			<input type="text" name="depositAccount_holderName" placeholder="Holder Name" />
			<span class="sub">deposit.holderName (Name on Account)</span>
			<pre>
My Business Name
Required string-25
Name on the bank account - typically the name of the business.

This field does not support the following characters , & ' (comma, ampersand, apostrophe).
			</pre>
		</label>
		<label for="html">
			<span>Routing Number</span>
			<input type="text" name="depositAccount_routingNumber" placeholder="Routing Number" />
			<span class="sub">deposit.routingNumber (Bank Routing Number)</span>
			<pre>
124300327
Required string-35
Routing number of the merchant's business. Must be a valid 9 digit routing number to test in sandbox.

Note: If an invalid routing number is provided the merchant may not receive their funds and may nincur additional ACH return charges.
			</pre>
		</label>

		<!-- <label for="html">
			<span>NAME</span>
			<input type="text" name="depositAccount_OBJECT" placeholder="NAME" />
			<span class="sub">deposit.OBJECT (???)</span>
			<pre>
INFO
			</pre>
		</label> -->

	</Form>

</div>



<style lang="sass">
	div
		margin: 2rem auto
		max-width: 900px
		min-width: 500px
		padding-bottom: 2rem

	h1
		font-size: 2rem
		text-decoration: underline

	h2
		font-size: 1.5rem

	label
		width: 100%

		> span
			display: inline-block
			margin-bottom: .75rem
			min-height: 20px
			@include flex-row-middle-left(.25rem)

			&.sub
				margin-bottom: 2px
				font-size: .9rem
				color: #777

		> pre
			font-size: .75rem
			line-height: normal
			white-space: break-spaces
			color: #999

</style>