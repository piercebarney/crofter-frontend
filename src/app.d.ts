// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {

	import { User } from 'src/types/user'
	
	// interface Error {}
	interface Locals {
		debug:			Record<string,any>
		user:			User|{id:null}
		authRedirect?:	string
	}
	// interface PageData {}
	interface Platform {
		env: {
			COUNTER: DurableObjectNamespace
		}
		context: {
			waitUntil(promise: Promise<any>): void
		}
		caches: CacheStorage & { default: Cache }
	}
}

interface FormData extends Iterable<[string, FormDataEntryValue]> {
	entries(): IterableIterator<[string, FormDataEntryValue]>;
}

declare module '$env/static/private' {
	export const ZIFT_GATES_UN: string;
	export const NODE_ENV: string;
}

declare module '$env/dynamic/private' {
	export const env: {
		TAWK_API_KEY: string;
		ZAPIER_KEY: string;
		ZIFT_GATES_PW: string;
	};
}

declare namespace svelteHTML {

	interface HTMLAttributes<_T = HTMLElement> {
		'on:isVisible'?:	any
		'on:outClick'?:		any
		'on:imageLoaded'?:	any
	}
}

declare module 'apollo-absinthe-upload-link';
declare module 'tinymce/themes/silver';
declare module 'tinymce/models/dom/model.js';
declare module 'tinymce/plugins/lists/plugin.js';
declare module 'tinymce/icons/default/icons.js';