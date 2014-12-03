var express = require('express');
var bodyParser = require('body-parser');
var pkgcloudContainerCopy = require('pkgcloud-container-copy');
var when = require('when');

module.exports = function () {
	var app = express();
	
	app.use('/media', express.static(__dirname + '/media'));
	app.use(bodyParser.json());
	app.set('view engine', 'ejs');
	app.enable('trust proxy');
	
	app.get('/', function (req, res) {
		res.render('index', {
			AWS_ACCESS_KEY_ID: Boolean(process.env.AWS_ACCESS_KEY_ID),
			AWS_SECRET_ACCESS_KEY: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
			host: req.protocol + '://' + req.get('host'),
			authenticated: false
		})
	});
	
	app.get('/commit-hook', function (req, res) {
		
	});
	
	return app;
};