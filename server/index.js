'use strict';

const app = require('./app');
const path = require('path');
const config = require('./config/environment');
const express = require('express');

if (process.env.NODE_ENV !== 'production') {
	console.log(`Running on ${process.env.NODE_ENV} mode`);
	const webpack = require('webpack');
	const webpackMiddleware = require('webpack-dev-middleware');
	const webpackConfig = require('../webpack.config.js');
	app.use(webpackMiddleware(webpack(webpackConfig)));
	app.use(express.static('dist'));
	app.use(express.static('assets'));
}
else {
	console.log(`Running on Production mode`);
	app.set('appPath', path.join(config.root, 'dist'));
	app.use(express.static(app.get('appPath')));
	app.use(express.static(path.join(config.root, 'assets')));
	app.route('/', (req, res) => {
		res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
	});
}

require('./routes')(app);
