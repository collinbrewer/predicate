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

	context('#and', function () {
		it('should return a new and compound predicate', function () {
			var predicate = CompoundPredicate.parse('1 AND 2').and(CompoundPredicate.parse('3 and 4'));
			var subpredicates = predicate.getSubpredicates();

			expect(subpredicates).to.have.length(2);
			expect(subpredicates[0].subpredicates).to.have.length(2);
			expect(subpredicates[1].subpredicates).to.have.length(2);
		});
	});

	context('#or', function () {
		it('should return a new or compound predicate', function () {
			var predicate = CompoundPredicate.parse('1 AND 2').or(CompoundPredicate.parse('3 and 4'));
			var subpredicates = predicate.getSubpredicates();

			expect(subpredicates).to.have.length(2);
			expect(subpredicates[0].subpredicates).to.have.length(2);
			expect(subpredicates[1].subpredicates).to.have.length(2);
		});
	});

	context('#evaluateWithObject', function () {
		it('should return true', function () {
			var predicate = CompoundPredicate.parse('true && true');
			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should return false', function () {
			var predicate = CompoundPredicate.parse('true && false');
			expect(predicate.evaluateWithObject()).to.be.false;
		});

		it('should return true', function () {
			var predicate = CompoundPredicate.parse('true || false');
			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should return false', function () {
			var predicate = CompoundPredicate.parse('false || false');
			expect(predicate.evaluateWithObject()).to.be.false;
		});
	});
});
