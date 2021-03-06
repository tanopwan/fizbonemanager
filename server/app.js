'use strict';

const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/environment');

const app = express();
const port = config.port;

mongoose.Promise = require('bluebird');

app.listen(port, () => {
	console.log("listen on port " + port);
});

mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
	console.error(`MongoDB connection error: ${err}`);
	process.exit(-1);
});

module.exports = app;
