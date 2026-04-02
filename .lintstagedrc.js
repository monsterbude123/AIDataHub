/**
 * lint-staged configuration for root monorepo
 *
 * NOTE: doc/ui/prototype is excluded because it uses ESLint 9.x flat config
 * which is incompatible with the root ESLint 8.x. The prototype has its own
 * lint-staged configuration in its package.json.
 */

module.exports = {
  // Match TypeScript files in packages and services, excluding prototype
  '{packages,services}/**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  // Match JSON and Markdown files in packages and services
  '{packages,services}/**/*.{json,md}': ['prettier --write'],
  // Root level config files
  '*.{json,md,js,mjs,cjs}': ['prettier --write'],
};