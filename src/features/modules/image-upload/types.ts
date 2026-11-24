export type ImageUpload = {
	form:		HTMLFormElement|null
	input:		HTMLInputElement|null
	inputName:	string|null
	name:		string|null
	src:		string|null
	status:		{
					error:		string|null
					processing:	boolean
					success:	boolean|null
				}
}