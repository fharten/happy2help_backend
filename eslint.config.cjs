const tseslint = require('typescript-eslint');

module.exports = tseslint.config(
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '**/*.js'],
  },
  ...tseslint.configs.recommended
);
