const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    index: './index.js',
  },
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].js',
  },
  resolve: {
    // extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              emitFile: false,
              limit: 1024 * 1024,
              context: 'src',
              name: '[path][name].[ext]',
              fallback: {
                loader: 'file-loader',
                options: {
                  name: '[name].[hash:8].[ext]',
                },
              },
            },
          },
        ],
      },
      {
        test: /\.(hdr|gif|blend|glb)/,
        use: [
          {
            loader: 'url-loader',
            options: {
              context: 'src',
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(glsl)$/,
        use: ['glslify-import-loader', 'raw-loader', 'glslify-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      title: 'index',
      hash: true,
      chunks: ['index'],
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets/image', to: 'image' },
        { from: 'src/assets/model', to: 'model' },
      ],
    }),
  ],
};
