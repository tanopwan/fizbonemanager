'use strict';

const path = require('path');
const config = require(`./${process.env.NODE_ENV}.config.js`);

module.exports = {
	env: process.env.NODE_ENV || 'development',
	root: path.normalize(`${__dirname}/../../..`),
	port: process.env.PORT || 3000,
	mongo: config.mongo,
	facebook: {
		clientID: config.facebook.clientID || 'clientID',
		clientSecret: config.facebook.clientSecret || 'clientSecret',
		callbackURL: config.facebook.callbackURL || `${process.env.DOMAIN || ''}/auth/facebook/callback`
	},
	jwt: config.jwt || 'superSecret',
	authorizedEmails: ['tanopwan@hotmail.com', 't_thanapon@hotmail.com', 'noolizaa@hotmail.com']
}
