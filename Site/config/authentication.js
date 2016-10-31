var passport = require('passport');
var LocalStrategy = require('passport-local');
var credentials = require('./credentials.js');

passport.use(new LocalStrategy(
	credentials.login
));

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(credentials.findById);

module.exports.passport = passport;