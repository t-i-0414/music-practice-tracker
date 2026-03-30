module.exports = function (api) {
  api.cache(true);

  const plugins = [
    [
      'module-resolver',
      {
        alias: {
          '@': './src',
        },
      },
    ],
    '@babel/plugin-transform-class-static-block',
  ];

  // TODO: Re-enable when react-docgen-typescript supports TypeScript 6 AST
  // plugins.unshift(['babel-plugin-react-docgen-typescript', { exclude: 'node_modules' }]);

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
