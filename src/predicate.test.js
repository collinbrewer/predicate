var expect = require('chai').expect;

var Predicate = require('../index');

describe('Predicate', function () {
	context('#parse', function () {
		it('returns a compound predicate', function () {
			var predicate = Predicate.parse('1 && 1');
			expect(predicate).to.have.property('subpredicates');
		});

		it('returns a comparison predicate', function () {
			var predicate = Predicate.parse('1==1');
			expect(predicate.type).to.equal('comparison');
		});

		it('returns a complex compound predicate', function () {
			var predicate = Predicate.parse('1==1 && 2==2');
			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(2);
		});

		it('returns a nested compound predicate', function () {
			var predicate = Predicate.parse('1==1 && (2==1 || 2==2)');
			console.log('predicate', predicate);
		});

		it('returns a predicate when an existing predicate is provided', function () {
			var predicate = Predicate.parse('1');
			// var existingPredicate = Predicate.parse(predicate);
			expect(predicate).to.not.equal(undefined);
		});

		it('should create predicate with substitution variables', function () {
			var substitutionVariables = {'FOO': 1234};
			var predicate = Predicate.parse('foo==$FOO', substitutionVariables);
			expect(predicate).to.exist;
			expect(predicate.right._substitutionVariables).to.equal(substitutionVariables);
		});
	});

	context('#evaluateWithObject', function () {
		it('returns true', function () {
			expect(Predicate.parse('1 && 1').evaluateWithObject({})).to.equal(true);
		});

		it('returns false', function () {
			var predicate = Predicate.parse('1 && false');
			expect(predicate.evaluateWithObject({})).to.equal(false);
		});

		it('should maintain substitution variables', function () {
			var p1 = Predicate.parse('$a==3 && values.number>$b', {a: 3, b: 4});
			var p2 = Predicate.parse('$a==3 && values.number>$b', {a: 10, b: 4});

			expect(p1.evaluateWithObject({values: {number: 5}})).to.be.true;
			expect(p2.evaluateWithObject({values: {number: 5}})).to.be.false;
		});
	});
});
