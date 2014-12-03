var express = require('express');
var bodyParser = require('body-parser');
var AWS = require('aws-sdk');
var Request = require('request');
var pkgcloudContainerCopy = require('pkgcloud-container-copy');
var when = require('when');
var Download = require('download');
var rimraf = require('rimraf');
var path = require('path');

module.exports = function () {
	var app = express();
	
	app.use('/media', express.static(__dirname + '/media'));
	app.use(bodyParser.json());
	app.set('view engine', 'ejs');
	app.enable('trust proxy');
	
	app.get('/', function (req, res) {
		var awsAuthenticated = false;
		var bitbucketAuthenticated = false;
		
		when
			.resolve()
			.then(function () {
				var deferred = when.defer();
				Request({
					url: 'https://' + process.env.BITBUCKET_USERNAME + ':' + process.env.BITBUCKET_PASSWORD + '@api.bitbucket.org/2.0/users/chesleybrown',
					method: 'GET'
				}, function (err, response, body) {
					bitbucketAuthenticated = (err) ? false : true;
					deferred.resolve();
				});
				return deferred.promise;
			})
			.then(function () {
				var deferred = when.defer();
				
				var s3 = new AWS.S3();
				s3.listBuckets(function (err, data) {
					awsAuthenticated = (err) ? false : true;
					deferred.resolve();
				});
				return deferred.promise
			})
			.finally(function () {
				res.render('index', {
					BITBUCKET_USERNAME: Boolean(process.env.BITBUCKET_USERNAME),
					BITBUCKET_PASSWORD: Boolean(process.env.BITBUCKET_PASSWORD),
					AWS_REGION: Boolean(process.env.AWS_REGION),
					AWS_ACCESS_KEY_ID: Boolean(process.env.AWS_ACCESS_KEY_ID),
					AWS_SECRET_ACCESS_KEY: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
					host: req.protocol + '://' + req.get('host'),
					authenticated: {
						aws: awsAuthenticated,
						bitbucket: bitbucketAuthenticated
					}
				});
			})
		;
	});
	
	app.get('/commit-hook', function (req, res) {
		if (!process.env.BITBUCKET_USERNAME || !process.env.BITBUCKET_PASSWORD || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
			res.status(500).end();
			return;
		}
		
		var repo = req.body.repository.slug;
		
		var destination = pkgcloudContainerCopy.createCloudContainerSpecifer({
			client: {
				provider: 'aws-sdk',
				region: process.env.AWS_REGION
			},
			container: repo
		});
		
		// delete directory if it already exist
		var localDestination = path.resolve(__dirname, 'downloads', repo);
		
		rimraf(localDestination, function () {
			// download repo as zip
			new Download({extract: true, strip: 1})
				.get('https://' + process.env.BITBUCKET_USERNAME + ':' + process.env.BITBUCKET_PASSWORD + '@bitbucket.org' + req.body.repository.absolute_url + 'get/' + req.body.commits.branch + '.zip')
				.dest(localDestination)
				.run(function (err, files, stream) {
					if (err) {
						throw err;
					}
					
					pkgcloudContainerCopy
						.copyContainer(localDestination, destination)
						.then(function () {
							res.status(200);
						})
						.catch(function () {
							res.status(500);
						})
						.finally(function () {
							res.end();
						})
					;
				})
			;
		});
	});
	
	return app;
};