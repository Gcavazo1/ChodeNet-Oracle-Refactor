import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";
import reactJsxRuntime from "eslint-plugin-react/configs/jsx-runtime.js";
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  { ignores: ['dist'] },
  {
    languageOptions: { 
      globals: {
        ...globals.browser,
        ...globals.node,
      } 
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Configure React-specific linting rules.
    ...reactRecommended,
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    settings: {
        react: {
            version: "detect"
        }
    }
  },
  {
    // Add JSX runtime rules for modern React.
    ...reactJsxRuntime,
    files: ["src/**/*.{js,jsx,ts,tsx}"],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  }
];
