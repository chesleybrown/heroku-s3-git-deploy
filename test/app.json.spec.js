var expect = require('chai').expect;
var appJson = require('app.json');

describe('app.json', function () {
	var app;
	
	describe('validate it has no errors', function () {
		before(function () {
			app = appJson.new(__dirname + '/../app.json');
		});
		
		it('should is valid', function () {
			expect(app.valid).to.be.true;
		});
		it('should have no errors', function () {
			expect(app.errors).to.have.length(0);
		});
	});
	
})
