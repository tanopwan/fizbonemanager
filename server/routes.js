'use strict';

const path = require('path');
const facebookBot = require('./service/bot/facebook');
const bodyParser = require('body-parser');

module.exports = function(app) {
	app.use(bodyParser.json({ type: 'application/*+json' }));
	app.use(bodyParser.urlencoded({ type: 'application/x-www-form-urlencoded'}));
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
	app.use('/facebook-messenger/shipping-address', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/shipping-address.html`));
	});

	app.get('/webhook', bodyParser.json({ verify: facebookBot.verifyRequestSignature }), facebookBot.verifyWebhook);
	app.post('/webhook', bodyParser.json({ verify: facebookBot.verifyRequestSignature }), facebookBot.webhook);

	// Below all routes
	app.use((req, res) => {
		res.redirect('/');
	});
}
