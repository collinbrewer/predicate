var expect = require('chai').expect;

var CompoundPredicate = require('./compound-predicate.js');

describe('CompoundPredicate', function () {
	context('#parse', function () {
		it('should create predicate from standard form', function () {
			var predicate = CompoundPredicate.parse('foo && bar');
			expect(predicate).to.exist;
			expect(predicate.subpredicates).to.have.length(2);
			expect(predicate.gate).to.equal('and');
		});
	});

	context('#constructor', function () {
		it('returns a compound predicate', function () {
			var predicate = new CompoundPredicate('AND', [1, 2]);
			expect(predicate.gate).to.equal(CompoundPredicate.AND);
		});
	});

	context('#getGate', function () {
		it('returns the logical gate type', function () {
			var predicate = new CompoundPredicate('AND', [1, 2]);
			expect(predicate.getGate()).to.equal('and');
		});
	});

	context('#getSubpredicates', function () {
		it('returns the logical gate type', function () {
			var predicate = new CompoundPredicate('AND', [1, 2]);
			expect(predicate.getSubpredicates()).to.have.length(2);
		});
	});

	context('#copy', function () {
		it('should return a duplicate', function () {
			var predicate = new CompoundPredicate('AND', [1, 2]);
			var copy = predicate.copy();

			expect(copy).to.exist;
		});
	});

	context('#getDependentKeyPathExpressions', function () {
		it('should return key path expressions', function () {
			var predicate = new CompoundPredicate('AND', ['age > 21', '@count.children == 0']);
			var dependentKeyPathExpressions = predicate.getDependentKeyPathExpressions();

			expect(dependentKeyPathExpressions).to.have.length(2);
		});
	});

	context('#stringify', function () {
		it('should return a serialized string', function () {
			var predicate = new CompoundPredicate('AND', [1, 2, 3]);

			expect(predicate.stringify()).to.equal('1 and 2 and 3');
		});
	});

	context('#toLocaleString', function () {
		it('should return a natural language string', function () {
			var predicate = new CompoundPredicate('AND', [1, 2, 3]);

			expect(predicate.toLocaleString()).to.equal('1 and 2 and 3');
		});
	});

	context('#evaluateWithObject', function () {
	});
});
