/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();
var cookieParser = require('cookie-parser');
var session = require('cookie-session');
var user = {name:"john",pass:"1234"};
var _ = require('lodash');
// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(cookieParser());
  app.use(session({
    secret: "victory cat"
  }));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session()); 
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});


passport.use(new LocalStrategy(
  function(username, password, done) {
   
    process.nextTick(function () {
        user.username = username;
        user.password=password
        return done(null, user);
	//   UserDetails.findOne({'username':username},
	// 	function(err, user) {
	// 		if (err) { return done(err); }
	// 		if (!user) { return done(null, false); }
	// 		if (user.password != password) { return done(null, false); }
	// 		return done(null, user);
	// 	});
    });
  }
));
 var callbackUrl;

app.get('/auth', function(req, res, next) {
    callbackUrl = req.query.continue;
    if(!req.user){
        res.sendfile('views/login.html');
    }
   else if(!_.isUndefined(callbackUrl)){
    res.redirect(callbackUrl+'/dashboard?user='+req.user.username);
    
    }
    else{
        res.sendfile('views/account.html');
    }
});

app.get('/logOut' , function(req, res, next){
    callbackUrl = req.query.continue;
    req.logout();
    res.redirect('/auth?continue='+callbackUrl);
     
}); 

app.get('/loginFailure' , function(req, res, next){
	res.send('Failure to authenticate');
});

app.get('/loginSuccess' , function(req, res, next){
    var name = req.user.username;
    
    console.log(name);
    if(!_.isUndefined(callbackUrl)){
    res.redirect(callbackUrl+'/dashboard?user='+name);
    
    }
    else{
        res.sendfile('views/account.html');
    }
	//res.send('Welcome '+name);
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/loginSuccess',
    failureRedirect: '/loginFailure'
  }));

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

