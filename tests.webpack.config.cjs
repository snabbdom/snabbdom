const path = require('path')
const isPathInside = require('is-path-inside')
const globby = require('globby')

const outputPath = path.resolve(__dirname, 'build/test')
const makeTestsWebpackConfig = async () => ({
  mode: 'development',
  entry: Object.fromEntries(
    (await globby(path.resolve(outputPath, '**/*.js')))
      .map((item) => [path.relative(outputPath, item), item])
  ),
  output: {
    path: path.resolve(__dirname, 'test-bundles'),
    filename: ({ chunk }) => chunk.name
  },
  module: {
    rules: [
      {
        exclude: (input) => isPathInside(input, path.resolve(__dirname, 'node_modules')),
        test: /\.m?js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  useBuiltIns: 'usage',
                  corejs: 3,
                }
              ]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      'latest-snabbdom-release/init': 'latest-snabbdom-release/build/package/init'
    }
  }
})
module.exports = makeTestsWebpackConfig
