var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')

// add hot-reload related code to entry chunks
Object.keys(baseWebpackConfig.entry).forEach(function (name) {
  baseWebpackConfig.entry[name] = ['./build/dev-client'].concat(baseWebpackConfig.entry[name])
})

module.exports = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: '#cheap-module-eval-source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env': config.dev.env
    }),
    // https://github.com/glenjamin/webpack-hot-middleware#installation--usage
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      title: '资源',
      filename: 'html/resource/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['resource/index', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '菜单',
      filename: 'html/menu/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['menu/index', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '机构',
      filename: 'html/org/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['org/index', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '授权',
      filename: 'html/role/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['role/index', 'api', 'vendor', 'manifest']
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor','promise'],
      minChunks: function (module, count) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    new FriendlyErrorsPlugin()
  ]
})
