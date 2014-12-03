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
			delete process.env.AWS_ACCESS_KEY_ID;
			delete process.env.AWS_SECRET_ACCESS_KEY;
		});
		
		describe('and commit hook is called', function () {
			before(function (done) {
				request(app)
					.get('/commit-hook')
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
	
})
