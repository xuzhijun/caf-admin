const resolve = require('path').resolve
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const url = require('url')
const publicPath = ''

module.exports = (options = {}) => ({
  entry: {
    'vendor': './src/vendor',
    'api': './src/api',
    'index': './src/page/index/index',
    'resource': './src/page/resource/index',
    'resource1': './src/page/resource/index1',
    'menu': './src/page/menu/index',
    'org': './src/page/org/index',
    'role': './src/page/role/index'

  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: options.dev
      ? '[name].js'
      : '[name].js?[chunkhash]',
    chunkFilename: '[id].js?[chunkhash]',
    publicPath: options.dev
      ? '/assets/'
      : publicPath
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                scss: 'vue-style-loader!css-loader!sass-loader', // <style lang="scss">
                sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax' // <style lang="sass">
              }
            }
          }
        ]
      }, {
        test: /\.js$/,
        use: ['babel-loader'],
        exclude: /node_modules/
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }, {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack
      .optimize
      .CommonsChunkPlugin({
        names: ['api', 'vendor', 'manifest']
      }),
    // new HtmlWebpackPlugin({template: 'src/index.html'})
    new HtmlWebpackPlugin({
      title: '首页',
      filename: 'index.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['index', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '资源',
      filename: 'resource.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['resource1', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '菜单',
      filename: 'menu.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['menu', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '机构',
      filename: 'org.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['org', 'api', 'vendor', 'manifest']
    }),
    new HtmlWebpackPlugin({
      title: '授权',
      filename: 'role.html',
      template: 'src/index.html',
      inject: true,
      chunks: ['role', 'api', 'vendor', 'manifest']
    })
  ],
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src')
    }
  },
  devServer: {
    historyApiFallback: true,
    hot: true,
    inline: true,
    port: 8010,
    stats: {
      colors: true
    },
    proxy: {
      '/applicationFunction': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/applicationFunction": ""
        },
        changeOrigin: true
      },
      '/shareCompon': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/shareCompon": ""
        },
        changeOrigin: true
      },
      '/applicationOrg': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/applicationOrg": ""
        },
        changeOrigin: true
      },
      '/applicationRole': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/applicationRole": ""
        },
        changeOrigin: true
      },
      '/roleFunction/': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/roleFunction/": "/"
        },
        changeOrigin: true
      },
      '/roleFunctionPermission/': {
        target: 'http://localhost:9090',
        pathRewrite: {
          "^/roleFunctionPermission/": "/"
        },
        changeOrigin: true
      }
    }
    // historyApiFallback: {   index: url     .parse(options.dev     ? '/assets/'  :
    // publicPath)     .pathname }
  },
  devtool: options.dev
    ? '#eval-source-map'
    : '#source-map'
})
