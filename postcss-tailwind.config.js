// PostCSS config specifically for scoping Tailwind to .tailwind-scope
export default {
	plugins: {
		'postcss-prefix-selector': {
			prefix: '.tailwind-scope',
			exclude: [':root', '.tailwind-scope'],
			transform: function (prefix, selector, prefixedSelector) {
				// Don't prefix @keyframes, @font-face, etc.
				if (selector.startsWith('@')) {
					return selector;
				}
				return prefixedSelector;
			}
		}
	}
}
