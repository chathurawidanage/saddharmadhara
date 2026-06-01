module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    plugins: ['react', 'react-hooks', '@typescript-eslint'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
        jest: true,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    rules: {
        // TypeScript handles unused vars better than the base rule
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        // Disallow explicit `any` — warn so migration is incremental
        '@typescript-eslint/no-explicit-any': 'warn',
        // Keep console discipline
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        // React hooks
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        // Not needed with TypeScript
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/display-name': 'off',
        // Style
        'semi': ['error', 'always'],
        'quotes': ['error', 'double'],
        '@typescript-eslint/no-non-null-assertion': 'error',
    },
    // Plain JS files: relax TypeScript rules
    overrides: [
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
                '@typescript-eslint/no-require-imports': 'off',
            },
        },
    ],
};
