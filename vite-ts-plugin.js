// vite-ts-plugin.js
// @ts-check
// import { createRequire } from 'module';
// import { fileURLToPath } from 'url';
import path from 'path';

// const require = createRequire(import.meta.url);
// const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Custom plugin to handle TypeScript files in ES modules
 */
export function typescriptEsm() {
  return {
    name: 'typescript-esm',
    
    // Ensure .ts files are properly handled in ESM context
    /**
     * @param {string} source - The import source path
     * @param {string | undefined} importer - The importing file path
     * @returns {string | null} - The resolved path or null
     */
    resolveId(source, importer) {
      if (source.endsWith('.ts') && importer) {
        return path.resolve(path.dirname(importer), source);
      }
      return null;
    },
    
    // Transform TypeScript files to JavaScript
    /**
     * @param {string} code - The source code to transform
     * @param {string} id - The path of the file being transformed
     * @returns {Promise<{code: string, map: null} | null>}
     */
    async transform(code, id) {
      if (id.endsWith('.ts')) {
        // This plugin doesn't actually transform the code,
        // it just ensures the file is properly resolved.
        // The actual transformation is handled by SvelteKit/Vite.
        return {
          code,
          map: null
        };
      }
      return null;
    }
  };
}
