const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    index: './src/client/js/index.js',
    cafeDetail: './src/client/js/cafeDetail/cafeDetail.js',
    addTheme: './src/client/js/addTheme.js',
    address: './src/client/js/address.js',
    search: './src/client/js/search.js',
    profile: './src/client/js/profile.js',
    map: './src/client/js/map.js',
  },
  watch: false,
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/styles.css',
    }),
  ],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
};
