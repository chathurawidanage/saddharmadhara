module.exports = {
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    plugins: ['react', 'react-hooks'],
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
        requireConfigFile: false,
        babelOptions: {
            presets: ["@babel/preset-react"],
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
        'no-unused-vars': 'error',
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/display-name': 'off',
        'semi': ['error', 'always'],
        'quotes': ['error', 'double'],
    },
};
