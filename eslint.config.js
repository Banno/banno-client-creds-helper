import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.js'],
    rules: {
      'prettier/prettier': [
        'error',
        {
          bracketSpacing: false,
          semi: true,
          singleQuote: true,
        },
      ],
    },
  },
];
