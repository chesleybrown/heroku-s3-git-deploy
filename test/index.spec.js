var expect = require('chai').expect;
var request = require('supertest');
var AWS = require('aws-sdk');
var mockery = require('mockery');

describe('Index', function () {
	var app, response, Request;
	
	before(function () {
		mockery.enable({
			warnOnReplace: false,
			warnOnUnregistered: false
		});
		
		mockery.registerMock('request', function (opt, callback) {
			return Request(opt, callback);
		});
		
		app = require('../app')();
	});
	
	describe('when calling an unknown url', function () {
		before(function (done) {
			request(app)
				.get('/invalid/')
				.end(function (err, res) {
					response = res;
					done();
				})
			;
		});
		
		it('should respond with not found', function () {
			expect(response.status).to.equal(404);
			expect(response.body).to.be.empty;
		});
	});
	
	describe('when no environment set', function () {
		before(function () {
			delete process.env.BRANCH;
			delete process.env.BITBUCKET_USERNAME;
			delete process.env.BITBUCKET_PASSWORD;
			delete process.env.AWS_REGION;
			delete process.env.AWS_BUCKET;
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});
		
		describe('and accessing index page', function () {
			before(function (done) {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(true);
						}
					};
				};
				Request = function (opt, callback) {
					callback(true);
				};
				request(app)
					.get('/')
					.end(function (err, res) {
						response = res;
						done();
					})
				;
			});
			
			it('should respond with success', function () {
				expect(response.status).to.equal(200);
			});
			it('should render', function () {
				expect(response.text).to.contain('<!DOCTYPE html>');
			});
			it('should complain about configuration', function () {
				expect(response.text).to.contain('App is running, but missing required configuration!');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">BRANCH</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">BITBUCKET_USERNAME</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">BITBUCKET_PASSWORD</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_REGION</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
			});
		});
	});
	
	describe('when environment set', function () {
		before(function () {
			process.env.BRANCH = 'master';
			process.env.BITBUCKET_USERNAME = 'bitbucket_username';
			process.env.BITBUCKET_PASSWORD = 'bitbucket_password';
			process.env.AWS_REGION = 'region';
			process.env.AWS_BUCKET = 'bucket';
			process.env.AWS_ACCESS_KEY_ID = 'aws_access_key_id';
			process.env.AWS_SECRET_ACCESS_KEY = 'aws_secret_access_key';
		});
		
		describe('and credentials are correct', function () {
			before(function () {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(null);
						}
					};
				};
				Request = function (opt, callback) {
					callback(null, {statusCode: 200});
				};
			});
			
			describe('and accessing index page', function () {
				before(function (done) {
					request(app)
						.get('/')
						.end(function (err, res) {
							response = res;
							done();
						})
					;
				});
				
				it('should respond with success', function () {
					expect(response.status).to.equal(200);
				});
				it('should render', function () {
					expect(response.text).to.contain('<!DOCTYPE html>');
				});
				it('should NOT complain env', function () {
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">BRANCH</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">BITBUCKET_USERNAME</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">BITBUCKET_PASSWORD</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_REGION</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
				});
				it('should say what bitbucket username is set', function () {
					expect(response.text).to.contain('Set to <span class="label label-default">bitbucket_username</span>.');
				});
				it('should NEVER say what aws bitbucket password is set', function () {
					expect(response.text).not.to.contain('bitbucket_password');
				});
				it('should say what branch is set', function () {
					expect(response.text).to.contain('Set to <span class="label label-default">master</span>.');
				});
				it('should say what bucket is set', function () {
					expect(response.text).to.contain('Set to <span class="label label-default">bucket</span>.');
				});
				it('should say what region is set', function () {
					expect(response.text).to.contain('Set to <span class="label label-default">region</span>.');
				});
				it('should say what aws access id is set', function () {
					expect(response.text).to.contain('Set to <span class="label label-default">aws_access_key_id</span>.');
				});
				it('should NEVER say what aws secret access key is set', function () {
					expect(response.text).not.to.contain('aws_secret_access_key');
				});
				it('should say login was successful', function () {
					expect(response.text).to.contain('App is running and has access to Amazon S3 and Bitbucket!');
				});
			});
		});
		
		describe('and aws credentials are wrong', function () {
			before(function () {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(true);
						}
					};
				};
				Request = function (opt, callback) {
					callback(null, {statusCode: 200});
				};
			});
			
			describe('and accessing index page', function () {
				before(function (done) {
					request(app)
						.get('/')
						.end(function (err, res) {
							response = res;
							done();
						})
					;
				});
				
				it('should respond with success', function () {
					expect(response.status).to.equal(200);
				});
				it('should render', function () {
					expect(response.text).to.contain('<!DOCTYPE html>');
				});
				it('should NOT complain env', function () {
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
				});
				it('should say login is failing', function () {
					expect(response.text).to.contain('Access to Amazon S3 was denied. Are you sure the credentials are correct?');
				});
			});
		});
		
		describe('and bitbucket credentials are wrong', function () {
			before(function () {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(null);
						}
					};
				};
				Request = function (opt, callback) {
					callback(true, {statusCode: 401});
				};
			});
			
			describe('and accessing index page', function () {
				before(function (done) {
					request(app)
						.get('/')
						.end(function (err, res) {
							response = res;
							done();
						})
					;
				});
				
				it('should respond with success', function () {
					expect(response.status).to.equal(200);
				});
				it('should render', function () {
					expect(response.text).to.contain('<!DOCTYPE html>');
				});
				it('should NOT complain env', function () {
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
					expect(response.text).not.to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
				});
				it('should say login is failing', function () {
					expect(response.text).to.contain('Access to Bitbucket was denied. Are you sure the credentials are correct?');
				});
			});
		});
		
		after(function () {
			mockery.disable();
			delete process.env.BRANCH;
			delete process.env.BITBUCKET_USERNAME;
			delete process.env.BITBUCKET_PASSWORD;
			delete process.env.AWS_REGION;
			delete process.env.AWS_BUCKET;
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});
	});
	
})
