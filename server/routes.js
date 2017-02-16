'use strict';

const path = require('path');
const errors = require('./components/errors');

module.exports = function(app) {

	app.use('/api/auth', require('./auth').facebookRouter);
	app.use('/api/users', require('./api/user'));

	// Below all routes
	app.use(errors[404]);
}
