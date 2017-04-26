'use strict';

const path = require('path');
const facebookBot = require('./service/bot/facebook');

module.exports = function(app) {

	app.use('/api/auth', require('./auth').facebookRouter);
	app.use('/api/users', require('./api/user'));
	app.use('/api/products', require('./api/product'));
	app.use('/api/batches', require('./api/batch'));
	app.use('/api/promotions', require('./api/promotion'));
	app.use('/api/customers', require('./api/customer'));
	app.use('/api/sales', require('./api/sale'));
	app.use('/login', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/login.html`));
	});

	app.get('/webhook', facebookBot.verifyRequestSignature, facebookBot.verifyWebhook);
	app.post('/webhook', facebookBot.verifyRequestSignature, facebookBot.webhook);

	// Below all routes
	app.use((req, res) => {
		res.redirect('/');
	});
}
