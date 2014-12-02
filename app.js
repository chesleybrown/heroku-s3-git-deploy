var express = require('express');
var bodyParser = require('body-parser');

module.exports = function () {
	var app = express();
	
	app.use('/media', express.static(__dirname + '/media'));
	app.use(bodyParser.json());
	app.enable('trust proxy');
	
	app.get('/', function (req, res) {
		res.end('Running');
	});
	
	return app;
};