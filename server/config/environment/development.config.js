'use strict';

let name = 'fizbonemanager';

module.exports = {
	facebook: {
		clientID: '397434167256284',
		clientSecret: '678889f126b6e75e1b1ee1c011e53e4d',
		callbackURL: `${process.env.DOMAIN}:${process.env.PORT}/api/auth/facebook/callback`
	},
	mongo: {
		uri: `mongodb://localhost/${name}`,
		options: {
            db: {
                safe: true
            }
        }
	}
}
