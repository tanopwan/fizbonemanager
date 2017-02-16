'use strict';

let name = 'fizbonemanager';

module.exports = {
	facebook: {
		clientID: '',
		clientSecret: '',
		callbackURL: `http://${process.env.DOMAIN}:${process.env.PORT}/api/auth/facebook/callback`
	},
	mongo: {
		uri: `mongodb://localhost/${name}`,
		options: {
            db: {
                safe: true
            }
        },
		jwt: 'abc'
	}
}
