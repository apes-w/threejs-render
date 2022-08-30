const webpack = require('webpack');
const merge = require('webpack-merge');
const commonConfig = require('./common.config.js');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const devServer = {
  host: 'localhost',
  port: 8090,
  contentBase: './dist',
  open: true,
  hot: true,
};

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  devServer,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: 'global',
              import: true,
            },
          },
          'postcss-loader',
        ],
      },
      {
        test: /\.js$/,
        use: {
          loader: 'eslint-loader',
        },
        enforce: 'pre',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        // message: [],
        messages: [`project is running at http://${devServer.host}:${devServer.port}`],
        notes: [],
      },
      onErrors(severity, errors) {
        // serverity的取值有 error、warning
        // 可以在这里监听项目运行的错误和警告
      },
      // clearConsole: false, // 默认值为true，效果看起来是清空一次控制台打印
      additionalFormatters: [],
      additionalTransformers: [],
    }),
  ],
};

module.exports = merge(commonConfig, devConfig);
