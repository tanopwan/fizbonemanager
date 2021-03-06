const passport = require('passport');
const facebookPassport = require('passport-facebook');
const config = require('../../config/environment');

const FacebookStrategy = facebookPassport.Strategy;

const authorizedEmails = config.authorizedEmails;

module.exports = function (User, config) {
	passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL,
		profileFields: [
			'displayName',
			'emails',
		]
	},
		function (accessToken, refreshToken, profile, done) {
			console.log('[passport.js] Login with ' + JSON.stringify(profile._json));
			if (authorizedEmails.indexOf(profile._json.email) === -1) {
				console.log('[passport.js] Not authorized user.');
				done('not authorized user');
			}

			return User.findOne({ 'facebook.id': profile.id }).exec()
				.then(user => {
					if (user) {
						user.providerProfile = profile._json;
						user.providerRef = {
							accessToken,
							refreshToken,
						}

						return user.save()
						.then(savedUser => done(null, savedUser))
						.catch(err => done(err));
					}

					user = new User({
						name: profile.displayName,
						email: profile.emails[0].value,
						role: 'user',
						provider: 'facebook',
						providerProfile: profile._json,
						providerRef: {
							accessToken,
							refreshToken,
						},
					});
					user.save()
						.then(savedUser => done(null, savedUser))
						.catch(err => done(err));
				})
				.catch(err => done(err));
		}));
}
