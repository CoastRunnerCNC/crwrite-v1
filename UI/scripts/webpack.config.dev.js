const webpack = require('webpack');
const path = require("path");

// The base for this is webpack.config.prod.js.
// This is merged with it when NODE_ENV is development.
console.log("config.dev " + path.resolve(__dirname, "../app"))
module.exports = {
  mode: 'development',
  entry: {
    app: ['webpack-hot-middleware/client'],
  },

  devtool: 'eval-source-map', // faster to rebuild than inline-source-map
  devServer: {
    static: {
        directory: path.resolve(__dirname, "../app/index.html")
    },
    hot: true,
    historyApiFallback: true, 
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],

  optimization: {
    moduleIds: 'named'
  }
};