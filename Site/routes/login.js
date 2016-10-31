var express = require('express');
var router = express.Router();
var passport = require('../config/authentication.js').passport;

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

router.get('/login', function(req, res) {
	if (req.user)
		res.redirect('/');
	else
		res.render('login');
});

router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;