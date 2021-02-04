const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'demo'),
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './demo',
  },
  resolve: {
    fallback: {
      "assert": require.resolve("assert/"),
      "stream": require.resolve("stream-browserify/"),
      "util": require.resolve("util/")
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
};
