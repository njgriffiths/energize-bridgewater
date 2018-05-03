module.exports = {
	entry: './app/js/app.js',
	module: {
		rules: [
			{ 
				test: /\.hbs/,
				loader: "handlebars-template-loader"
			},
			{
				test: /\.(svg|gif|png|eot|woff|ttf)$/,
				use: [
					{
						loader: 'url-loader'
					}
				]
			}
		]
	},
	node: {
		fs: 'empty'
	},
	output: {
		path: __dirname + '/app',
		filename: 'bundle.js'
	},
	resolve: {
		extensions: ['.js']
	},
	target: 'node'
};