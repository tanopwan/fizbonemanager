'use strict';

const app = require('../../app');
const path = require('path');

module.exports[404] = function pageNotFound(req, res, next) {

	var viewFilePath = '404';
	var statusCode = 404;
	var result = {
		status: statusCode
	};

	res.status(result.status);
	res.sendFile(path.resolve(`${__dirname}/../../views/${viewFilePath}.html`));
};
