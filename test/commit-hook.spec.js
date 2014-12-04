var expect = require('chai').expect;
var request = require('supertest');

describe('Commit Hook', function () {
	var app, response;
	
	before(function () {
		app = require('../app')();
	});
	
	describe('when bitbucket credentials are set, but no other environment set', function () {
		before(function () {
			delete process.env.BRANCH;
			process.env.BITBUCKET_USERNAME = 'bitbucket_username';
			process.env.BITBUCKET_PASSWORD = 'bitbucket_password';
			delete process.env.AWS_REGION;
			delete process.env.AWS_BUCKET;
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});
		
		describe('and commit hook is called with credentials', function () {
			before(function (done) {
				request(app)
					.post('/commit-hook')
					.end(function (err, res) {
						response = res;
						done();
					})
				;
			});
			
			it('should respond with access denied', function () {
				expect(response.status).to.equal(401);
			});
		});
		
		describe('and commit hook is called with incorrect auth', function () {
			before(function (done) {
				request(app)
					.post('/commit-hook')
					.auth('wrong_bitbucket_username', 'wrong_bitbucket_password')
					.end(function (err, res) {
						response = res;
						done();
					})
				;
			});
			
			it('should respond with access denied', function () {
				expect(response.status).to.equal(401);
			});
		});
		
		describe('and commit hook is called with correct auth', function () {
			before(function (done) {
				request(app)
					.post('/commit-hook')
					.auth('bitbucket_username', 'bitbucket_password')
					.end(function (err, res) {
						response = res;
						done();
					})
				;
			});
			
			it('should respond with failure', function () {
				expect(response.status).to.equal(500);
			});
		});
	});
	
	describe('when environment set, but no auth set', function () {
		before(function () {
			process.env.BRANCH = 'master';
			delete process.env.BITBUCKET_USERNAME;
			delete process.env.BITBUCKET_PASSWORD;
			process.env.AWS_REGION = 'region';
			process.env.AWS_BUCKET = 'bucket';
			process.env.AWS_ACCESS_KEY_ID = 'aws_access_key_id';
			process.env.AWS_SECRET_ACCESS_KEY = 'aws_secret_access_key';
		});
		
		describe('and commit hook is called', function () {
			before(function (done) {
				request(app)
					.post('/commit-hook')
					.auth('bitbucket_username', 'bitbucket_password')
					.end(function (err, res) {
						response = res;
						done();
					})
				;
			});
			
			it('should respond with access denied', function () {
				expect(response.status).to.equal(401);
			});
		});
	});
	
	after(function () {
		delete process.env.BRANCH;
		delete process.env.BITBUCKET_USERNAME;
		delete process.env.BITBUCKET_PASSWORD;
		delete process.env.AWS_REGION;
		delete process.env.AWS_BUCKET;
		delete process.env.AWS_ACCESS_KEY_ID;
		delete process.env.AWS_SECRET_ACCESS_KEY;
	});
	
})
