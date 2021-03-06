var Expression = require('@collinbrewer/expression');

function ExpressionPredicate (expression) {
	this.expression = expression;
}

ExpressionPredicate.prototype.evaluateWithObject = function (o, vars) {
	return this.expression.getValueWithObject(o, vars || this.vars);
};

ExpressionPredicate.parse = function (s, vars) {
	var predicate;
	var expression = Expression.parse(s, vars);

	if (expression) {
		predicate = new ExpressionPredicate(expression);
	}

	return predicate;
};

module.exports = ExpressionPredicate;
