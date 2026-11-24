import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser,
      },
    },
    rules: {
      'prefer-const': 'off', // Disable base rule for Svelte files
      'svelte/prefer-const': 'warn', // Use Svelte-aware version (handles $props/$derived)
    },
  },
  {
    ignores: [
      '.svelte-kit/',
      '.cloudflare/',
      'node_modules/',
      'build/',
      'static/',
    ],
  },
  {
    rules: {
      // Svelte
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/a11y-no-noninteractive-element-interactions': 'off',
      'svelte/no-at-html-tags': 'warn',
      'svelte/valid-compile': ['error', { ignoreWarnings: true }],
      // TypeScript - relax strict rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      // JS
      'no-undef': 'off', // TypeScript handles this
      'no-prototype-builtins': 'off',
      'prefer-const': 'warn',
      'no-var': 'warn',
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    rules: {
      'prefer-const': 'off',
    },
  },
  {
    files: ['src/components/elements/icon/element.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/home/units/partials/location-details.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/components/elements/rt.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/auth/layouts/auth.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/company/layouts/company.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/layouts/checkout.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/company/page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/distributor/page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/home/page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/orders/page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/groups/consumer/pages/product/page.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
  {
    files: ['src/features/layouts/user.svelte'],
    rules: {
      'svelte/no-at-html-tags': 'off',
    },
  },
);
