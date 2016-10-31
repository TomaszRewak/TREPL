var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var _ = require('underscore');
var db = require('./models/db.js');
var passport = require('./config/authentication.js').passport;
var debug = require('debug')('TREPL');

var index = require('./routes/index');
var ide = require('./routes/ide.js');
var api = require('./routes/api.js');
var sitemap = require('./routes/sitemap.js');
var login = require('./routes/login.js');
var admin = require('./routes/admin.js');
var page404 = require('./routes/404.js');

// view engine setup
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));

app.use(session({ secret: 'vtsio5uyvc3vm54y589d54c0OGASN0c72t' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(index);
app.use(ide)
app.use(api);
app.use(sitemap);
app.use(login);
app.use(admin);

app.use(express.static(path.join(__dirname, 'public')));

app.use(page404);

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
