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
			var predicate = Predicate.parse('1==1 && 2==2 && 3==3');
			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(3);
		});

		it('returns a nested compound predicate', function () {
			var predicate = Predicate.parse('1==1 && (2==1 || 2==2)');

			// expect predicate to be a compound predicate with two subpredicates
			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(2);

			// expect first subpredicate to be a comparison predicate with two constant expressions
			expect(predicate.subpredicates[0]).to.have.property('left');
			expect(predicate.subpredicates[0].left).to.have.property('type', 'constant');
			expect(predicate.subpredicates[0].left).to.have.property('value', 1);

			// expect second subpredicate to be a compound predicate with two subpredicates
			expect(predicate.subpredicates[1]).to.have.property('subpredicates');
			expect(predicate.subpredicates[1].subpredicates).to.have.length(2);

			// expect sub-subpredicates to be comparison predicates
			expect(predicate.subpredicates[1].subpredicates[0]).to.have.property('left');
			expect(predicate.subpredicates[1].subpredicates[1]).to.have.property('left');

			expect(predicate.subpredicates[1].subpredicates[0].left).to.have.property('value', 2);
			expect(predicate.subpredicates[1].subpredicates[0].right).to.have.property('value', 1);

			expect(predicate.subpredicates[1].subpredicates[1].left).to.have.property('value', 2);
			expect(predicate.subpredicates[1].subpredicates[1].right).to.have.property('value', 2);
		});

		it('returns a deep nested coumpound predicates', function () {
			var predicate = Predicate.parse('1==1 && (2==2 && (3==3))');

			// expect predicate to be a compound predicate with two subpredicates
			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(2);

			// expect first subpredicate to be a comparison predicate with two constant expressions
			expect(predicate.subpredicates[0]).to.have.property('left');
			expect(predicate.subpredicates[0].left).to.have.property('type', 'constant');
			expect(predicate.subpredicates[0].left).to.have.property('value', 1);

			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(2);

			// expect the first subpredicate of the first nested subpredicate to be a comparison
			// predicate with two constant expressions
			expect(predicate.subpredicates[1].subpredicates[0]).to.have.property('left');
			expect(predicate.subpredicates[1].subpredicates[0].left).to.have.property('type', 'constant');
			expect(predicate.subpredicates[1].subpredicates[0].left).to.have.property('value', 2);

			// expect the first subpredicate of the second nested subpredicate to be a comparison
			// predicate with two constant expressions
			expect(predicate.subpredicates[1].subpredicates[1]).to.have.property('left');
			expect(predicate.subpredicates[1].subpredicates[1].left).to.have.property('type', 'constant');
			expect(predicate.subpredicates[1].subpredicates[1].left).to.have.property('value', 3);

			//
			// // expect first subpredicate to be a comparison predicate with two constant expressions
			// expect(predicate.subpredicates[0]).to.have.property('left');
			// expect(predicate.subpredicates[0].left).to.have.property('type', 'constant');
			// expect(predicate.subpredicates[0].left).to.have.property('value', 3);
		});

		it('returns a multiple coumpound predicates', function () {
			var predicate = Predicate.parse('(1==1 && 2==2) || (3==3 && 4==4)');

			expect(predicate).to.have.property('subpredicates');
			expect(predicate.subpredicates).to.have.length(2);
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
