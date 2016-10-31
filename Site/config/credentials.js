var admin = {
	id : 0,
	username : process.env.TREPL_admin_user,
	password : process.env.TREPL_admin_password,
	isAdmin : true
}

module.exports = {
	login : function(username, password, done) {
		if (username == admin.username && password == admin.password) {
			done(null, admin);
		}
		else {
			done(null, false, { message: 'Incorrect username or password' });
		}
	},

	findById : function(id, done) {
		if (id == admin.id) {
			done(null, admin);
		}
		else {
			done('User not found');
		}
	}
}