'use strict';

const path = require('path');
const fbController = require('./service/bot/facebook.controller');
const fbMessenger = require('./service/bot/fbmessenger');

const bodyParser = require('body-parser');

module.exports = function(app) {
	app.get('/webhook', bodyParser.json({ verify: fbMessenger.verifyRequestSignature }), fbMessenger.verifyWebhook);
	app.post('/webhook', bodyParser.json({ verify: fbMessenger.verifyRequestSignature }), fbController.webhook);

	app.use(bodyParser.json());
	app.use('/api/auth', require('./auth').facebookRouter);
	app.use('/api/users', require('./api/user'));
	app.use('/api/products', require('./api/product'));
	app.use('/api/batches', require('./api/batch'));
	app.use('/api/promotions', require('./api/promotion'));
	app.use('/api/customers', require('./api/customer'));
	app.use('/api/sales', require('./api/sale'));
	app.use('/api/pages', require('./api/page'));
	app.use('/login', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/login.html`));
	});
	app.use('/facebook-messenger/shipping-address', function(req, res) {
		res.sendFile(path.resolve(`${__dirname}/views/shipping-address.html`));
	});

	// Below all routes
	app.use((req, res) => {
		if (!req.path.startsWith('/api')) {
			res.redirect('/');
		}
		else {
			res.status(404);
		}
	});
}
