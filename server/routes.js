'use strict';

const path = require('path');

module.exports = function(app) {

	app.use('/api/auth', require('./auth').facebookRouter);
	app.use('/api/users', require('./api/user'));
	app.use('/api/products', require('./api/product'));
	app.use('/login', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/login.html`));
	});

	// Below all routes
	app.use((req, res) => {
		res.redirect('/');
	});
}
