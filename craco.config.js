const { addBeforeLoader, loaderByName } = require('@craco/craco');

module.exports = {
  babel: {
    plugins: ['@babel/plugin-transform-react-jsx', ['@babel/plugin-transform-typescript', { allowDeclareFields: true }]],
    presets: ['@babel/preset-typescript'],
  },
  webpack: {
    configure: function(webpackConfig) {
      const stylusLoader = {
        test: /\.(styl)$/,
        use: ['style-loader', 'css-loader?modules', 'stylus-loader'],
      };

      const cssLoader = {
        test: /^\/src.*\.(css)$/,
        use: ['style-loader', 'css-loader'],
      };

      const scssLoader = {
        test: /^\/src.*\.(scss)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      };

      addBeforeLoader(webpackConfig, loaderByName('file-loader'), stylusLoader);
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), cssLoader);
      addBeforeLoader(webpackConfig, loaderByName('file-loader'), scssLoader);

      return webpackConfig;
    },
  },
};
