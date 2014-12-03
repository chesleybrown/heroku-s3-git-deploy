var expect = require('chai').expect;
var request = require('supertest');

describe('Index', function () {
	var app, response;
	
	before(function () {
		app = require('../app')();
	});
	after(function () {
		response = undefined;
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
	
	describe('when accessing index page', function () {
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
		it('should complain about configuration', function () {
			expect(response.text).to.contain('App is running, but missing required configuration!');
			expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_ACCESS_KEY_ID</span> ENV variable.');
			expect(response.text).to.contain('You still need to set the <span class="label label-default">AWS_SECRET_ACCESS_KEY</span> ENV variable.');
		});
	});
})
