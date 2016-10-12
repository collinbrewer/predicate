var expect = require('chai').expect;

var ComparisonPredicate = require('./comparison-predicate.js');

describe('ComparisonPredicate', function () {
	context('#parse', function () {
		it('should create predicate from standard form', function () {
			var predicate = ComparisonPredicate.parse('foo > bar');
			expect(predicate).to.exist;
			expect(predicate.left.getKeyPath()).to.equal('foo');
			expect(predicate.right.getKeyPath()).to.equal('bar');
			expect(predicate.operator).to.equal('>');
		});
	});

	context('#constructor', function () {
		it('returns a comparison predicate from arg list with operator', function () {
			var predicate = new ComparisonPredicate('left', 'right', 'operator');
			expect(predicate.left).to.exist;
			expect(predicate.right).to.exist;
			expect(predicate.operator).to.equal('operator');
			expect(predicate.selector).to.be.undefined;
		});

		it('returns a comparison predicate from arg list with selector', function () {
			var predicate = new ComparisonPredicate('left', 'right', 'operator');
			expect(predicate.left).to.exist;
			expect(predicate.right).to.exist;
			expect(predicate.operator).to.equal('operator');
			expect(predicate.selector).to.be.undefined;
		});

		it('returns a comparison predicate from object', function () {
			var predicate = new ComparisonPredicate({left: 'left', operator: 'operator', right: 'right', selector: 'selector'});
			expect(predicate.left).to.exist;
			expect(predicate.right).to.exist;
			expect(predicate.operator).to.equal('operator');
			expect(predicate.selector).to.equal('selector');
		});
	});

	context('#copy', function () {
		it('should return a duplicate', function () {
			var predicate = new ComparisonPredicate(1, 2, '<');
			var copy = predicate.copy();

			expect(copy).to.exist;
		});
	});

	context('#getDependentKeyPathExpressions', function () {
		it('should return key path expressions', function () {
			var predicate = new ComparisonPredicate('father.age', 'mother.age', '<');
			var dependentKeyPathExpressions = predicate.getDependentKeyPathExpressions();

			expect(dependentKeyPathExpressions).to.have.length(2);
		});
	});

	context('#stringify', function () {
		it('should return a serialized string', function () {
			var predicate = new ComparisonPredicate(1, 2, '<');

			expect(predicate.stringify()).to.equal('1 < 2');
		});
	});

	context('#toLocaleString', function () {
		it('should return a natural language string', function () {
			var predicate = new ComparisonPredicate(1, 2, '<');

			expect(predicate.toLocaleString()).to.equal('1 less than 2');
		});
	});

	context('#evaluateWithObject', function () {
		it('should be equal', function () {
			var predicate = new ComparisonPredicate('2', '2', '==');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be not equal', function () {
			var predicate = new ComparisonPredicate(1, 2, '!=');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be less than or equal to', function () {
			var predicate = new ComparisonPredicate(1, 2, '<=');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be greater than or equal to', function () {
			var predicate = new ComparisonPredicate(2, 1, '>=');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be less than', function () {
			var predicate = new ComparisonPredicate(1, 2, '<');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be greater than', function () {
			var predicate = new ComparisonPredicate(2, 1, '>');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be between', function () {
			var predicate = new ComparisonPredicate(2, [1, 3], 'between');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should contain', function () {
			var predicate = new ComparisonPredicate([1, 2, 3], 1, 'contains');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be in', function () {
			var predicate = new ComparisonPredicate(1, [1, 2, 3], 'in');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should begin with', function () {
			var predicate = ComparisonPredicate.parse('"foobar" beginswith "foo"');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should end with', function () {
			var predicate = ComparisonPredicate.parse('"foobar" endswith "bar"');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should be like', function () {
			var predicate = ComparisonPredicate.parse('"foobar" like "f*bar"');

			expect(predicate.evaluateWithObject()).to.be.true;
		});

		it('should match', function () {
			var predicate = ComparisonPredicate.parse('"foobar" matches "f(.+?)ba[r]"');

			expect(predicate.evaluateWithObject()).to.be.true;
		});
	});
});
