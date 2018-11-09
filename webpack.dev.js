const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const args = process.argv.slice(2);
const argv = {};
args.forEach(arg => {
  const [key, value] = arg.split('=');
  argv[key.replace('--', '')] = value;
});
let devServer = {
  host: '0.0.0.0',
  contentBase: './dist',
  proxy: {},
};
argv.port ? devServer.port = argv.port : console.warn("no argument '--port'");
argv.proxy ? devServer.proxy['/api'] = argv.proxy : console.warn("no argument '--proxy'");

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer,
  watchOptions: {
    poll: 100
  },
});