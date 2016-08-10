// http://developer.apple.com/library/mac/#documentation/cocoa/conceptual/Predicates/Articles/pBNF.html

var Expression = require('@collinbrewer/expression');

var parsedCache = {};
var compiledCache = {};

// TODO: this is the simplistic first run, look to predicater.html for an in-the-works full parser
// var comparisonRegex=/(==|=|!=|<=|>=|<|>|between|contains|in|beginswith|endswith|like|matches)/i;
// var compounderRegex=/[\b\s](&&|and|\|\||or)[\b\s]/gi;

function Predicate () {}

var predicateClasses = [];

Predicate.register = function (PredicateClass) {
	predicateClasses.indexOf(PredicateClass) === -1 && predicateClasses.push(PredicateClass);
};

// currently handles compound and comparison predicates, does not handle nested predicates
Predicate.parse = function (s, vars) {
	if (typeof (s) !== 'string' && ('evaluateWithObject' in s)) {
		return s;
	}

	var predicate;
	var i;
	var l = predicateClasses.length;
	var PredicateClass;

	for (i = 0; i < l; i++) {
		PredicateClass = predicateClasses[i];
		if ((predicate = PredicateClass.parse(s, vars))) {
			break;
		}
	}

	// // NOTE: I'm not sure if this is how it should work, can we evaluate the substitution variables ahead of time?
	// //    enquoting all the variables should trigger the parser to treat them as constants, however they would no longer be variable expressions
	// if(args && args.constructor!==Array) {
	//    predicate._substitutionVariables=args;
	// }

	return predicate;
};

// expression: self, employee.title
// comparison predicate: leftExpression != rightExpression    {left:self, operator:!=, right:employee.title}
// compound predicate: expression1 && expression2 && expression3   [expression1, &&, expression2, &&, expression3]

// exp {left:self, operator:in, right:subtasks}
// ors [[exp1], [exp2]]   ex: "self in subtasks || title !=''"
// and [exp1, exp2]   ex: "self in subtasks && title != ''"

// if(exp1 || (exp2 && exp3))   >  [exp1, "||", [exp2, "&&", exp3]]

Predicate.getExpressions = function (p) {
	var es = [];

	if (p.left) // comparison predicate
	{
		es.push(p.left);
		es.push(p.right);
	}
	else {
		for (var i = 0, l = p.length; i < l; i++) {
			if (i % 2 === 0) {
				es = es.concat(Predicate.getExpressions(p[i]));
			}
		}
	}

	return es;
};

Predicate.prototype.copy = function () {
	console.warn("Predicate subclass requires 'copy' to be overridden.");
};

Predicate.prototype._removeExpressionsReferencingKeys = function () {};

Predicate.prototype.getDependentKeyPathExpressions = function () {
	return [];
};

Predicate.prototype._predicateReferencesKeyPath = function (p) {
	p = Predicate.parse(p);

	if (p.left) {
		if (Expression._expressionReferencesKeyPath(p.left)) {
			return true;
		}

		if (Expression._expressionReferencesKeyPath(p.right)) {
			return true;
		}
	}
	else {
		for (var i = 0, l = p.length; i < l; i++) {
			if (i % 2 === 0) {
				if (Predicate._expressionReferencesKeyPath(p[i])) {
					return true;
				}
			}
		}
	}

	return false;
};

Predicate.prototype._predicateReferencesKeys = function (p, ks) {
	// console.log("predicate references keys: ", p, ks);

	p = Predicate.parse(p);

	if (Expression._expressionReferencesKeys(p.left, ks)) {
		return true;
	}
	else if (Expression._expressionReferencesKeys(p.right, ks)) {
		return true;
	}

	return false;
};

Predicate.prototype._removeExpressionsReferencingKeyPaths = function (p, ps) {
	console.log('remove expressions referencing keys: ', p, ps);

	ps || (ps = []);

	p = Predicate.parse(p);

	if (p.left) // key==value, key>value
	{
		// console.log("comparison predicate: ", p);

		if (!Predicate._predicateReferencesKeyPath(p)) {
			ps.push(p);
		}
	}
	else // key==value && key2>value2
	{
		// console.log("compound predicate: ", p);

		for (var i = 0, l = p.length; i < l; i++) {
			if (i % 2 === 0) {
				if (Predicate._predicateReferencesKeyPath(p[i])) {
					if (i < l - 1) // if there is a next compound, skip it
					{
						i++;
					}
					else if (i > 0) // if there is a previous compound, skip it
					{
						ps.splice(ps.length - 1, 1);
					}
				}
				else {
					ps = ps.concat(Predicate._removeExpressionsReferencingKeyPaths(p[i]));
				}
			}
			else {
				ps.push(p[i]);
			}
		}
	}

	return ps;
};

Predicate.prototype.toLocaleString = function () {
	return '';
};

Predicate.prototype.stringify = function () {
	return '';
};

Predicate.prototype.evaluateWithObject = function (o, vars) {
	return true;
};

// dependencies
var CompoundPredicate = require('./types/compound-predicate.js');
var ComparisonPredicate = require('./types/comparison-predicate.js');

// dynamic registration
Predicate.register(CompoundPredicate);
Predicate.register(ComparisonPredicate);

module.exports = Predicate;
