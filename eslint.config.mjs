import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';

const cleanedGlobals = (obj) =>
  Object.fromEntries(Object.entries(obj).map(([key, value]) => [key.trim(), value]));

export default [
  {
    ignores: ['dist', 'public', 'src/components/keenicons/assets']
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      globals: { ...cleanedGlobals(globals.node), ...cleanedGlobals(globals.browser) },
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettierPlugin,
      react: reactPlugin
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...js.configs.recommended.rules,
      // Disable conflicting rules
      'no-unused-vars': 'off',
      'react/jsx-uses-vars': 'off',
      'react/jsx-uses-react': 'off', // often unnecessary in React 17+
      'no-console': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'prettier/prettier': 'warn',
      'react/react-in-jsx-scope': 'off'
    }
  }
];
