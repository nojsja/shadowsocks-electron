const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, './index.tsx'),
  // devtool: 'hidden-source-map',
  mode: 'production',
  output: {
    filename: 'bundle_[hash:8].js',
    path: path.resolve(__dirname, '../build/'),
    publicPath: '',
  },
  resolve: {
    alias: {
      // dir
      '@': path.resolve(__dirname, '..'),
      '@main': path.resolve(__dirname, '../main'),
      '@renderer': path.resolve(__dirname, '.'),
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  module: {
    noParse:[/jquery/],
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /(\.js?|\.jsx?)$/,
        exclude: /(node_modules|bower_components)/,
        use: ['babel-loader?cacheDirectory']
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // by default it uses publicPath in webpackOptions.output
              publicPath: path.join(__dirname, '../build/'),
            },
          },
          {
            loader: 'css-loader',
            options: { minimize: true },
          }
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              // by default it uses publicPath in webpackOptions.output
              publicPath: path.join(__dirname, '../build/'),
            },
          },
          {
            loader: 'css-loader',
            options: { minimize: true }
          },
          {
            loader: 'less-loader',
          }
        ],
      },
      {
        test: /\.html$/,
        use: {
          loader: 'html-loader',
        },
      },
      {
        test: /\.(ico|woff|eot|ttf|woff2|icns)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 500, // 小于500B的文件直接写入bunndle
              name: '[name]_[hash:8].[ext]',
              outputPath: 'resources/assets',
            },
          },
        ]
      },
      {
        test: /\.(png|jpg|gif|svg|jpeg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'resources/images',
            },
          }
        ],
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new ESLintPlugin({
      extensions: ['.ts', '.tsx'],
      context: path.resolve(__dirname, './'),
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
    }),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './template.ejs',
      inject: 'body',
      publicPath: './',
      minify: false
    }),
  ],

  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 2,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          name: 'vendors_[hash:8].[ext]',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          name: 'bundle_[hash:8].[ext]',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    }
  },
  target: 'electron-renderer'
};
