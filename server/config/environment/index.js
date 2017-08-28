'use strict';

const path = require('path');
const config = require(`./${process.env.NODE_ENV}.config.js`);

module.exports = {
	env: process.env.NODE_ENV || 'development',
	root: path.normalize(`${__dirname}/../../..`),
	port: process.env.PORT || 3000,
	mongo: config.mongo,
	// facebook App
	facebook: {
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL || `${process.env.DOMAIN || ''}/auth/facebook/callback`
	},
	jwt: config.jwt,
	authorizedEmails: config.authorizedEmails,
	PAGE_ACCESS_TOKEN: config.PAGE_ACCESS_TOKEN,
	PAGE_SECRET: process.env.PAGE_SECRET || config.PAGE_SECRET,
	page_id: config.page_id,
}
