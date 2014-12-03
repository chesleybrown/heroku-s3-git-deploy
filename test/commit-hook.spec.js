var expect = require('chai').expect;
var request = require('supertest');
var AWS = require('aws-sdk');

describe('Commit Hook', function () {
	var app, response;
	
	before(function () {
		app = require('../app')();
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
		
		describe('and commit hook is called', function () {
			before(function (done) {
				request(app)
					.post('/commit-hook')
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
