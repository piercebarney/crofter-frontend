import type { Env } from 'src/types/env'
type Setting = {
	value: any
	valueType: string
	conditions: any
	evaluator: string
	message?: any[]
}
type SettingsTree = {
    [key: string]: Setting | SettingsTree
}
type EnvOptions = {allow?:Env[], deny?:Env[]}
interface SystemSettingsStore extends ReturnType<typeof setGet> {
	subscribe:	(run:(value:any) => void, invalidate?:(value?:any) => void) => () => void
	init:		() => void
	val:		(path:string) => any
	if:			(path:string, callback:() => void) => void
	log:		(path:string, ...args:any[]) => void
}

import { PUBLIC_ENV } from '$env/static/public'
import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { setGet } from 'src/stores/helpers'
import settingsConfig from 'src/systemSettings.json'



const initialValues: SettingsTree = {
	log	: {
		environment	: {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.environment,
			evaluator	: 'envCheck',
			message		: ['ENV:', PUBLIC_ENV]
		},
		googleTagManager : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.googleTagManager,
			evaluator	: 'envCheck'
		},
		debug : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.debug,
			evaluator	: 'envCheck'
		},
		info : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.info,
			evaluator	: 'envCheck'
		},
		error : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.error,
			evaluator	: 'envCheck'
		},
		signal : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.log.signal,
			evaluator	: 'envCheck'
		}
	},
	report : {
		debug : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.report.debug,
			evaluator	: 'envCheck'
		},
		info : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.report.info,
			evaluator	: 'envCheck'
		},
		error : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.report.error,
			evaluator	: 'envCheck'
		},
		signal : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.report.signal,
			evaluator	: 'envCheck'
		}		
	},
	tool : {
		dev : {
			value		: false,
			valueType	: 'boolean',
			conditions	: settingsConfig.tool.dev,
			evaluator	: 'envCheck'
		}
	},
	feature : {
		serviceWorker : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.feature.serviceWorker,
			evaluator		: 'envCheck'
		}
	},
	component : {
		footer : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.component.footer,
			evaluator		: 'envCheck'
		},
		footerVideo : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.component.footerVideo,
			evaluator		: 'envCheck'
		},
		hero : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.component.hero,
			evaluator		: 'envCheck'
		},
		subHero : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.component.subHero,
			evaluator		: 'envCheck'
		}
	},
	placeholder : {
		hero : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.placeholder.hero,
			evaluator		: 'envCheck'
		}
	},
	integration : {
		tawkTo : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.tawkTo,
			evaluator		: 'envCheck'
		},
		hotjar : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.hotjar,
			evaluator		: 'envCheck'
		},
		klaviyo : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.klaviyo,
			evaluator		: 'envCheck'
		},
		zapier : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.zapier,
			evaluator		: 'envCheck'
		},
		googleAnalytics : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.googleAnalytics,
			evaluator		: 'envCheck'
		},
		googleTagManager : {
			value			: false,
			valueType		: 'boolean',
			conditions		: settingsConfig.integration.googleTagManager,
			evaluator		: 'envCheck'
		}
	}
}

const { subscribe, update } = writable(initialValues)

const createSystemSettingsStore = (): SystemSettingsStore => {

	/**
	 * Gets a setting by path
	 * @param path - Path to the setting
	 * @returns Setting
	 */
	const _get = (path:string): Setting|null => {

		const $systemSettings = get(store)

		// Split path and traverse nested object
		const keys = path.split('.')
		
		let current: any = $systemSettings

		for (const key of keys) {

			if (current && typeof current === 'object' && key in current) {

				current = current[key]

			} else {

				return null // Path doesn't exist
			}
		}

		return current
	}

	/**
	 * Type guard to check if a node is a Setting (leaf) vs SettingsTree (branch)
	 * @param node - Node to check
	 * @returns True if node is a Setting
	 */
	const _isSetting = (node: any): node is Setting => {

		return node && 
			typeof node === 'object' &&
			'value' in node && 
			'valueType' in node && 
			'conditions' in node && 
			'evaluator' in node
	}

	/**
	 * Checks if the current environment is allowed based on the provided allow and deny arrays.
	 * 
	 * Behavior:
	 * - If only `deny` is provided: Allow all environments EXCEPT those in deny list
	 * - If only `allow` is provided: Allow ONLY environments in allow list (deny all others)
	 * - If both provided: Deny takes precedence, then check allow list
	 * - If neither provided: Only allow 'prod' by default
	 * 
	 * @param envOptions.allow - Environment names to allow. 'all' allows everything.
	 * @param envOptions.deny - Environment names to deny. 'all' denies everything.
	 * @returns true if current environment is allowed, false otherwise
	 */
	const _envCheck = (envOptions:EnvOptions = {}) => {

		const ENV	= PUBLIC_ENV as Env
		const allow	= envOptions.allow
		const deny	= envOptions.deny

		const hasAllow	= allow && allow.length > 0
		const hasDeny	= deny && deny.length > 0

		// Explicit deny always takes precedence
		if (hasDeny && (deny.includes(ENV) || deny.includes('all'))) return false

		// Prod is always allowed unless explicitly denied above
		if (ENV === 'prod') return true

		// If only deny was provided (no allow), allow everything not denied
		if (hasDeny && !hasAllow) return true

		// If allow was provided, check if ENV is in allow list
		if (hasAllow) {
			return allow.includes(ENV) || allow.includes('all')
		}

		// Default: deny if not explicitly allowed
		return false
	}

	/**
	 * Evaluates a setting's conditions and returns the result
	 * @param setting - Setting to evaluate
	 * @returns Evaluation result
	 */
	const _evaluate = (setting:Setting): boolean => {

		const evaluator = setting.evaluator

		if (!evaluator) return false

		if (evaluator === 'envCheck') {

			const conditions = setting.conditions

			if (!conditions) return false

			return _envCheck(conditions)
		}

		return false
	}

	/**
	 * Recursively processes the settings tree and evaluates all settings
	 * @param tree - Settings tree or subtree to process
	 * @returns Processed tree with evaluated values
	 */
	const _processTree = (tree: SettingsTree): SettingsTree => {

		const processed: SettingsTree = {}

		for (const key of Object.keys(tree)) {

			const node = tree[key]

			if (_isSetting(node)) {

				// It's a Setting - evaluate it
				processed[key] = {
					...node,
					value: _evaluate(node)
				}

			} else {

				// It's a nested SettingsTree - recurse
				processed[key] = _processTree(node as SettingsTree)
			}
		}

		return processed
	}

	const store: SystemSettingsStore = {subscribe, ...setGet(subscribe, update),

		/**
		 * Initialize all settings by evaluating their conditions
		 */
		init : () => update(v => _processTree(v)),

		/**
		 * Gets the value of a setting by path
		 * @param path - Path to the setting
		 * @returns Setting value
		 */
		val : (path:string) => _get(path)?.value,

		/**
		 * Executes a callback if the setting is enabled
		 * @param path - Path to the setting
		 * @param callback - Callback to execute
		 */
		if : (path:string, callback:() => void) => {

			// if path starts with a dot, prepend if.
			if (path.startsWith('.')) path = `if${path}`
			
			if (_get(path)?.value) callback()
		},

		/**
		 * Logs a message if the setting is enabled
		 * @param path - Path to the setting
		 * @param args - Arguments to pass to console.log
		 */
		log : (path:string, ...args:any[]) => {

			// if path starts with a dot, prepend log.
			if (path.startsWith('.')) path = `log${path}`

			const setting = _get(path)
		
			if (setting?.value) {
				
				if		(args.length > 0)	console.log(...args)
				else if (setting?.message)	console.log(...setting.message)
			}
		}
	}

	return store
}

export const systemSettings = createSystemSettingsStore()
