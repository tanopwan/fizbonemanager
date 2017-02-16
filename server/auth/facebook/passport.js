const passport = require('passport');
const facebookPassport = require('passport-facebook');

const FacebookStrategy = facebookPassport.Strategy;

module.exports = function(User, config) {
	passport.use(new FacebookStrategy({
		clientID: config.facebook.clientID,
		clientSecret: config.facebook.clientSecret,
		callbackURL: config.facebook.callbackURL,
		profileFields: [
			'displayName',
			'emails'
		]
	},
	function(accessToken, refreshToken, profile, done) {
		User.findOne({'facebook.id': profile.id}).exec()
		.then(user => {
			if(user) {
				return done(null, user);
			}

			user = new User({
				name: profile.displayName,
				email: profile.emails[0].value,
				role: 'user',
				provider: 'facebook',
				facebook: profile._json
			});
			user.save()
			.then(savedUser => done(null, savedUser))
			.catch(err => done(err));
		})
		.catch(err => done(err));
	}));
}
