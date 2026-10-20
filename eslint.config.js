import js from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import n from 'eslint-plugin-n'
import promise from 'eslint-plugin-promise'
import globals from 'globals'

export default [
  { ignores: ['dist/**'] },
  js.configs.recommended,
  n.configs['flat/recommended-module'],
  promise.configs['flat/recommended'],
  {
    rules: {
      'n/no-unpublished-import': 'off'
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['test/**/*.js'],
    ...vitest.configs.recommended,
    languageOptions: {
      globals: vitest.environments.env.globals
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'vitest/no-disabled-tests': 'error'
    }
  }
]
