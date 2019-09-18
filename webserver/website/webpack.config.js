var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');

module.exports = {
	context: __dirname,
	devtool: debug ? "inline-sourcemap" : null,
	entry: "./js/scripts.jsx",
	output: {
	      path: __dirname + "/build",
	      filename: "scripts.min.js"
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{ loader: "style-loader" },
					{ loader: "css-loader" },
					{
                                                loader: 'file-loader',
                                                options: {
                                                        name: '[name].[ext]'
                                                }
                                        }
				]
			},
			{
				test: /\.(png|svg|jpg|gif|mp4)/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]'
						}
					}
				]
			},
			{
				test: /\.jsx?$/,
				use: 'babel-loader',
				exclude: /node_modules/,
			}
		]
	},
	plugins: debug ? [] : [
	      new webpack.optimize.DedupePlugin(),
	      new webpack.optimize.OccurenceOrderPlugin(),
	      new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
	    ],
};
