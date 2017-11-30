var path = require('path')
var utils = require('./utils')
var webpack = require('webpack')
var config = require('../config')
var merge = require('webpack-merge')
var baseWebpackConfig = require('./webpack.base.conf')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
var extractCSS = new ExtractTextPlugin({
  filename: utils.assetsPath('css/caf-vue/style.css'),
  allChunks: true
});
// var extractSASS = new ExtractTextPlugin({
//   filename: utils.assetsPath('css/caf-vue/icon.css'),
//   allChunks: true
// });
var env = config.build.env
var webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: [ {
        test: /\.css$/,
        // use: ['style-loader', 'css-loader', 'postcss-loader'],
        use: extractCSS.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'postcss-loader']
        })
      }, {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
        // use: extractSASS.extract({
        //   fallback: 'style-loader',
        //   use: ['css-loader', 'sass-loader']
        // })
      }]
    
  },
  devtool: config.build.productionSourceMap ? '#source-map' : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/caf-vue/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/caf-vue/[id].[chunkhash].js')
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': env
    }),
    extractCSS,
    // extractSASS,
    // extract css into its own file
    // new ExtractTextPlugin({
    //   filename: utils.assetsPath('css/[name].[contenthash].css')
    // }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: true
    }),
    // new OptimizeCSSPlugin({
    //   cssProcessorOptions: {
    //     safe: true
    //   }
    // }),
    new HtmlWebpackPlugin({
      title: '资源',
      filename: 'html/resource/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['resource/index', 'store', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '菜单',
      filename: 'html/menu/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['menu/index', 'store', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '机构',
      filename: 'html/org/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['org/index', 'store', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '授权',
      filename: 'html/role/index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['role/index', 'store', 'api', 'vendor', 'manifest']
    }),
    // split vendor js into its own file
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
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
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: 'caf-vue/manifest',
    //   chunks: ['caf-vue/api','caf-vue/vendor']
    // }),
    // new webpack.optimize.ModuleConcatenationPlugin()
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ])
  ]
})

if (config.build.productionGzip) {
  var CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
