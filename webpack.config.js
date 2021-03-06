const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const VENDOR_LIBS = ['vue'];

module.exports = {
	entry: {
		bundle: './client/src/index.js',
		vendor: VENDOR_LIBS
	},
	output: {
		filename: '[name].[chunkHash].js',
		path: path.resolve(__dirname, './dist'),
	},
	module: {
		rules: [
			{
				use: 'babel-loader',
				test: /\.js$/,
				exclude: /node_modules/
			},
			{
				test: /\.vue$/,
				loader: 'vue-loader'
			}

		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({
			name: 'vendor'
		}),
		new HtmlWebpackPlugin({
			template: './server/views/index_template.html'
		}),
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		})
	],
	resolve: {
		alias: {
			'src': path.resolve(__dirname, './client/src'),
			'components': path.resolve(__dirname, './client/src/components'),
			'pages': path.resolve(__dirname, './client/src/components/pages'),
			'basic': path.resolve(__dirname, './client/src/components/basic'),
			'blocks': path.resolve(__dirname, './client/src/components/blocks'),
			'modals': path.resolve(__dirname, './client/src/components/modals'),
			'parts': path.resolve(__dirname, './client/src/components/parts'),
		}
	}
}
