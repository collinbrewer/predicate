var ComparisonPredicate = require('./comparison-predicate.js');

var regex = /[\b\s](&&|and|\|\||or)[\b\s]/gi;
var shorthandGates = {
	'&&': 'and',
	'||': 'or'
};

function ensurePredicate (p, args) {
	var Predicate = require('../predicate.js');
	var predicate;
	var type = typeof p;

	if (type === 'string') {
		var trimmed = p.trim();
		if (trimmed[0] === '(') { trimmed = trimmed.substr(1, trimmed.length - 2); }
		predicate = Predicate.parse(trimmed, args);
	}
	else {
		predicate = (p !== null && type === 'object' && ('evaluateWithObject' in p) ? p : new ComparisonPredicate(p, args));
	}

	return predicate;
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

/**
 * Parses two forms
 * - 1==1 && 2==2
 * - 1==1 && (2==2 || 3==3)
 */
CompoundPredicate.parse = function (str, vars) {
	var predicate;
	var gate;

	function getParts (s) {
		console.log('getParts', s);
		var matches = s.match(regex);
		var gate = (matches ? matches[0].trim() : undefined);
		var parts = s.split(gate);
		var subpredicates = [];

		parts.forEach(function (part) {
			subpredicates.push(part.trim());
		});

		console.log('gate', gate);
		console.log('subpredicates', subpredicates);

		return {
			subpredicates: subpredicates,
			gate: gate
		};
	}

	function splitByGates (s) {
		var subpredicates = [];
		var gate;
		var i;
		var l;
		var c;
		var scopeStack = [];
		var current = '';
		var parts;

		for (i = 0, l = s.length; i < l; i++) {
			c = s[i];

			if (c === '(') {
				// if the scope is open, we found the start of a new predicate so push up the previous
				if (scopeStack.length === 0 && current) {
					parts = getParts(current);
					gate = parts.gate;

					if (parts.subpredicates) {
						subpredicates = subpredicates.concat(parts.subpredicates);
					}
				}
				scopeStack.push(c);
				current = '';
			}
			else if (c === ')') {
				scopeStack.pop();

				// if we've resolved all open scopes, then we're done, push it up
				if (scopeStack.length === 0) {
					subpredicates.push(current);
				}

				current = '';
			}
			else { // nothing special, just keep pushing
				current += c;
			}
		}

		if (current) {
			parts = getParts(current);

			if (parts.gate) {
				gate = parts.gate;
			}

			if (parts.subpredicates) {
				subpredicates = subpredicates.concat(parts.subpredicates);
			}
		}

		return {
			subpredicates: subpredicates,
			gate: gate
		};
	}

	var splits = splitByGates(str);

	console.log('result', splits);

	let subpredicate;
	let subpredicates = [];

	while ((subpredicate = splits.subpredicates.shift())) {
		console.log('SUBPREDICATE', subpredicate)

		subpredicates.push(ensurePredicate(subpredicate));
	}

	// if no gate, it's a single statement, just use and
	if (gate && subpredicates.length > 0) {
		console.log('has gate and subpredicates');
		predicate = new CompoundPredicate(gate, subpredicates);
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
