var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
function resolve(dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  entry: {
    'vendor': './src/vendor',
    'api': './src/api',
    // 'index': './src/page/index/index', 'resource/indexOld':
    // './src/page/resource/indexOld',
    'resource/index': './src/page/resource/index',
    'menu/index': './src/page/menu/index',
    'org/index': './src/page/org/index',
    'role/index': './src/page/role/index'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: [
      '.js', '.vue', '.json'
    ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        // options: vueLoaderConfig
        options: {
              loaders: {
                scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
                sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
              }
            }
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      }, {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      }, {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('css/caf-vue/fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  }
}
