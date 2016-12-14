// http://developer.apple.com/library/mac/#documentation/cocoa/conceptual/Predicates/Articles/pBNF.html
var ebnf = require('ebnf');
var Grammars = ebnf.Grammars;
var fs = require('fs');
var grammar = fs.readFileSync(__dirname + '/grammar.bnf', 'utf8').replace(/(\n   )/g, ' ');

console.log('grammar', grammar);

let parser = new Grammars.W3C.Parser(grammar);
console.log('parser', parser);
// let ast = parser.getAST();
// console.log('ast', ast);

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

	if (p.left) { // comparison predicate
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

Predicate.prototype.getDependentKeyPathExpressions = function () {
	return [];
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
