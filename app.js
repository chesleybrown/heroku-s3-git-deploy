var express = require('express');
var AWS = require('aws-sdk');
var Request = require('request');
var pkgcloudContainerCopy = require('pkgcloud-container-copy');
var when = require('when');
var Download = require('download');
var rimraf = require('rimraf');
var path = require('path');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');

module.exports = function () {
	var app = express();
	
	app.use('/media', express.static(__dirname + '/media'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended:true}));
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
					BRANCH: process.env.BRANCH,
					BITBUCKET_USERNAME: process.env.BITBUCKET_USERNAME,
					BITBUCKET_PASSWORD: Boolean(process.env.BITBUCKET_PASSWORD),
					AWS_REGION: process.env.AWS_REGION,
					AWS_BUCKET: process.env.AWS_BUCKET,
					AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
					AWS_SECRET_ACCESS_KEY: Boolean(process.env.AWS_SECRET_ACCESS_KEY),
					ssl: (req.protocol === 'https') ? true : false,
					host: req.get('host'),
					authenticated: {
						aws: awsAuthenticated,
						bitbucket: bitbucketAuthenticated
					}
				});
			})
		;
	});
	
	app.post('/commit-hook', basicAuth(function (username, password) {
		return (username === process.env.BITBUCKET_USERNAME && password === process.env.BITBUCKET_PASSWORD);
	}), function (req, res) {
		var payload;
		
		if (!process.env.BITBUCKET_USERNAME || !process.env.BITBUCKET_PASSWORD || !process.env.AWS_REGION || !process.env.AWS_BUCKET || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
			res.status(500).end();
			return;
		}
		
		if (!req.body || !req.body.payload) {
			res.status(400).end();
			return;
		}
		
		try {
			payload = JSON.parse(req.body.payload);
		}
		catch (err) {
			console.error(err);
			res.status(400).end();
			return;
		}
		
		// only continue if changes to master
		var isMaster = false;
		if (payload && payload.commits && payload.commits.length) {
			for (var i in payload.commits) {
				if (payload.commits[i].branch == process.env.BRANCH) {
					isMaster = true;
					break;
				}
			}
		}
		if (!isMaster) {
			res.status(400).end();
			return;
		}
		
		var destination = pkgcloudContainerCopy.createCloudContainerSpecifer({
			namePrefix: payload.repository.slug + '/',
			client: {
				provider: 'aws-sdk',
				region: process.env.AWS_REGION
			},
			container: process.env.AWS_BUCKET
		});
		
		// delete directory if it already exist
		var localDestination = path.resolve(__dirname, 'downloads', payload.repository.slug);
		
		rimraf(localDestination, function () {
			// download repo as zip
			new Download({extract: true, strip: 1})
				.get('https://' + process.env.BITBUCKET_USERNAME + ':' + process.env.BITBUCKET_PASSWORD + '@bitbucket.org/' + process.env.BITBUCKET_USERNAME + '/' + payload.repository.slug + '/get/' + process.env.BRANCH + '.zip')
				.dest(localDestination)
				.run(function (err, files, stream) {
					if (err) {
						console.error(err);
						res.status(500).end();
						return;
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