var ComparisonPredicate = require('./comparison-predicate.js');

var regex = /[\b\s](&&|and|\|\||or)[\b\s]/gi;
var shorthandGates = {
	'&&': 'and',
	'||': 'or'
};

function ensurePredicate (p, args) {
	var Predicate = require('../predicate.js');
	var type = typeof p;

	if (type === 'string') {
		return Predicate.parse(p, args);
	}
	else {
		return (p !== null && type === 'object' && ('evaluateWithObject' in p) ? p : new ComparisonPredicate(p, args));
	}
}

/**
 * Creates an AND/OR compound predicate
 * @param {String} gate The logical gate operation, AND/OR/&&/||
 * @param {Array} a    An array of subpredicates to compound
 */
function CompoundPredicate (gate, a) {
	// type = (typeof type === 'string' ? type : type[0]);

	this.gate = (shorthandGates[gate] || gate.toLowerCase());
	this.subpredicates = a.map(function (sub) {
		return ensurePredicate(sub);
	});
}

CompoundPredicate.parse = function (s, vars) {
	var predicate;
	var matches = s.match(regex);

	if (matches) {
		var compounder = matches[0].trim();
		var index = s.indexOf(compounder);
		var firstPredicateString = s.substring(0, index);
		var secondPredicateString = s.substring(index + compounder.length);
		var firstPredicate = ensurePredicate(firstPredicateString, vars);
		var secondPredicate = ensurePredicate(secondPredicateString, vars);

		predicate = new CompoundPredicate(compounder, [firstPredicate, secondPredicate]);
	}

	return predicate;
};

CompoundPredicate.prototype.getGate = function () {
	return this.gate;
};

CompoundPredicate.prototype.getSubpredicates = function () {
	return this.subpredicates;
};

CompoundPredicate.prototype.copy = function () {
	return new CompoundPredicate(this.gate, this.subpredicates.map(function (subpredicate) {
		return subpredicate.copy();
	}));
};

CompoundPredicate.prototype.getDependentKeyPathExpressions = function () {
	var expressions = [];

	this.subpredicates.forEach(function (subpredicate) {
		expressions = expressions.concat(subpredicate.getDependentKeyPathExpressions());
	});

	return expressions;
};

CompoundPredicate.prototype.stringify = function () {
	return this.subpredicates.map(function (predicate) {
		return predicate.stringify();
	}).join(' ' + this.gate + ' ');
};

// priority is equal to 1 and date due is today property3 and lastProperty is between 1 and 2
// proper
// x, y, and z
CompoundPredicate.prototype.toLocaleString = function () {
	return this.subpredicates.map(function (p) {
		return p.toLocaleString();
	}).join(' ' + this.gate + ' ');
};

CompoundPredicate.prototype.evaluateWithObject = function (o, vars) {
	vars || (vars = this._substitutionVariables);

	var subpredicates = this.subpredicates;
	var gate = this.gate;
	var isAnd = (gate === 'and');
	var result = (isAnd);
	var i;
	var l = subpredicates.length;
	var subpredicate;

	for (i = 0; i < l; i++) {
		subpredicate = subpredicates[i];

		if (subpredicate.evaluateWithObject(o, vars)) {
			if (!isAnd) {
				return true;
			}
		}
		else {
			if (isAnd) {
				return false;
			}
		}
	}

	return result;
};

// NOTE: could probably reduce the form here, this will yield '1 AND 2 AND (3 AND 4)'
// as nested predicates instead of '1 AND 2 AND 3 AND 4' as one predicate
CompoundPredicate.prototype.and = function (predicate) {
	return new CompoundPredicate('and', [this, predicate]);
};

CompoundPredicate.prototype.or = function (predicate) {
	return new CompoundPredicate('or', [this, predicate]);
};

CompoundPredicate.AND = 'and';
CompoundPredicate.OR = 'or';

module.exports = CompoundPredicate;
