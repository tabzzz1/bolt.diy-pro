import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/dist', '**/node_modules', '**/.wrangler', '**/bolt/build', '**/.history'],
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'off',
        {
          'ts-ignore': 'allow',
          'ts-expect-error': 'allow',
          'ts-nocheck': 'allow',
          'ts-check': 'allow',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'array-bracket-spacing': ['error', 'never'],
      'object-curly-newline': ['error', { consistent: true }],
      'consistent-return': 'error',
      semi: ['error', 'always'],
      'keyword-spacing': 'off',
      curly: 'off',
      'no-control-regex': 'off',
      'no-empty': 'off',
      'no-eval': ['error'],
      'no-self-assign': 'off',
      'no-unused-private-class-members': 'off',
      'no-useless-escape': 'off',
      'no-useless-catch': 'off',
      'linebreak-style': ['error', 'unix'],
      'arrow-spacing': ['error', { before: true, after: true }],
    },
  },
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
);
