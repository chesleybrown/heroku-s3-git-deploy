var expect = require('chai').expect;
var request = require('supertest');
var AWS = require('aws-sdk');

describe('Index', function () {
	var app, response;
	
	before(function () {
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
		describe('and accessing index page', function () {
			before(function (done) {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(true);
						}
					};
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
				expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
				expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
			});
		});
	});
	
	describe('when environment set', function () {
		before(function () {
			process.env.AWS_ACCESS_KEY_ID = 'access_key';
			process.env.AWS_SECRET_ACCESS_KEY = 'secret_access_key';
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
				it('should say login was successful', function () {
					expect(response.text).to.contain('App is running and has access to Amazon S3!');
				});
			});
		});
		
		describe('and credentials are wrong', function () {
			before(function () {
				AWS.S3 = function () {
					return {
						listBuckets: function (callback) {
							callback(true);
						}
					};
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
		
		after(function () {
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});
	});
	
})
