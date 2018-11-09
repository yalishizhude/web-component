const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    index: './example/index/index.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    chunkFilename: '[name].js'
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        common: {
          chunks: 'all',
          test: /common\.css$/,
          name: 'common',
          enforce: true,
        }
      }
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        "eslint-loader",
      ],
    }, {
      test: /\.css$/,
      use: [
        MiniCssExtractPlugin.loader, 'css-loader'
      ]
    }, {
      test: /\.(png|svg|jpe?g|gif)$/,
      use: ['url-loader'],
    }, {
      test: /\.html$/,
      use: ['html-loader']
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['common', 'index'],
      filename: 'index.html',
      template: 'example/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[name].css"
    }),
  ],
}