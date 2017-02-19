module.exports = {
	facebook: {
		clientID: '',
		clientSecret: '',
		callbackURL: `${process.env.DOMAIN}:${process.env.PORT}/api/auth/facebook/callback`
	},
	mongo: {
		uri: 'mongodb://localhost/fizbonemanager',
		options: {
            db: {
                safe: true
            }
        },
		jwt: 'abc'
	}
}
