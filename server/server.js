    require('rootpath')();
	var express = require('express'); 
    var app = express(); 
    var bodyParser = require('body-parser');
	var cors = require('cors');
	var expressJwt = require('express-jwt');
	var config = require('config.json');
	var _ = require('underscore');
	
	app.use(cors());
	app.use(bodyParser.json({limit: '50mb'})); 
	app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
	  
	// use JWT auth to secure the api, the token can be passed in the authorization header or querystring
	app.use(expressJwt({ secret: config.secret }).unless({ path: ['/users/login', '/users/register'] }));

	// routes
	app.use('/users', require('./controllers/users.controller'));
	app.use('/courses', require('./controllers/courses.controller'));
	app.use('/reviews', require('./controllers/reviews.controller'));
    app.use('/uploads', require('./controllers/uploads.controller'));

    app.listen('3001', function(){
        console.log('running on 3001...');
    });