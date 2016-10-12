// http://developer.apple.com/library/mac/#documentation/cocoa/conceptual/Predicates/Articles/pBNF.html

var Expression = require('@collinbrewer/expression');
var ExpressionPredicate = require('./expression-predicate.js');

var regex = /(==|=|!=|<=|>=|<|>|between|contains|in|beginswith|endswith|like|matches)/i;

function ensureExpression (e) {
	var type = typeof e;

	if (type === 'string') {
		return Expression.parse(e);
	}
	else {
		return (e !== null && type === 'object' && ('getValueWithObject' in e) ? e : Expression.expressionForConstantValue(e));
	}
}

function formatAsRegex (s) {
	var regex = s;

	// ? - matches one character, we use regex .{1,1}, so 'asd?' becomes 'asd.{1,1}' which matches asdf
	regex = regex.replace(new RegExp('\\?', 'g'), '.{1,1}');

	// * - matches 0 or more characters, we use regex .* so 'asd*' becomes 'asd.*' which matches asd, asdf, and asdfghjkl;
	regex = regex.replace(new RegExp('\\*', 'g'), '.*');

	return regex;
}

/**
 * Creates a new predicate for comparing two expressions
 * @param {Expression} left     The first expression to compare
 * @param {Expression} right    The second expression to compare
 * @param {String/function} operator A string representing a supported comparator or a function
 */
function ComparisonPredicate (left, right, operator) {
	this.type = 'comparison';

	if (arguments.length === 1 && typeof arguments[0] === 'object') {
		var o = arguments[0];

		this.left = ensureExpression(o.left);
		this.right = ensureExpression(o.right);
		this.operator = o.operator;
		this.selector = o.selector;
	}
	else {
		if (typeof operator === 'function') {
			this.selector = operator;
		}
		else if (operator) {
			this.operator = operator.toLowerCase();
		}

		this.left = ensureExpression(left);
		right && (this.right = ensureExpression(right));
	}
}

// returns an object in {left, operator, right} format
ComparisonPredicate.parse = function (s, vars) {
	var predicate;

	var matches = s.match(regex);

	if (matches) {
		var m = matches[0];
		var i = s.indexOf(m);
		var l = m.length;

		// typecast - parse out the right side of the expression, trim whitespace, if it's quoted, it's not a key, so either cast it to a number or a string
		var r = s.substr(i + l).trim();

		predicate = new ComparisonPredicate(Expression.parse(s.substr(0, i).trim(), vars), Expression.parse(r, vars), m);
	}
	else { // no comparator
		predicate = ExpressionPredicate.parse(s, vars);
	}

	return predicate;
};

ComparisonPredicate.getLocaleStringForOperator = function (operator) {
	var localeString = '';

	// ==, =, !=, <, >, <=, >=, between, contains, in, beginswith, endswith, like, matches
	// This should just refer to an en i10n file... and we should simply: return app.locales[givenLocale || defaultLocale][operator];
	var lookup = {
		'==': 'equals',
		'=': 'equals',
		'!=': 'does not equal',
		'<': 'less than',
		'<=': 'less than or equal to',
		'>': 'greater than',
		'>=': 'greater than or equal to',
		'beginswith': 'begins with',
		'endswith': 'ends with'
	};

	localeString = lookup[operator] || operator;

	return localeString;
};

ComparisonPredicate.prototype.copy = function () {
	var copy = new ComparisonPredicate(this.left.copy(), (this.right ? this.right.copy() : undefined), this.operator || this.selector);

	copy._substitutionVariables = this._substitutionVariables;

	return copy;
};

ComparisonPredicate.prototype.getDependentKeyPathExpressions = function () {
	var r = [];

	if (this.left && this.left.getType() === 'keyPath') {
		r.push(this.left);
	}

	if (this.right && this.right.getType() === 'keyPath') {
		r.push(this.right);
	}

	return r;
};

ComparisonPredicate.prototype.stringify = function (shouldSubstitute) {
	if (this.left && this.right) {
		return [this.left.stringify(shouldSubstitute), (this.operator ? this.operator : this.selector), this.right.stringify(shouldSubstitute)].join(' ');
	}
	else {
		return this.left.stringify();
	}
};

ComparisonPredicate.prototype.toLocaleString = function (shouldSubstitute) {
	if (this.left && this.right) {
		return [this.left.toLocaleString(shouldSubstitute), (this.operator ? ComparisonPredicate.getLocaleStringForOperator(this.operator) : this.selector), this.right.toLocaleString(shouldSubstitute)].join(' ');
	}
	else {
		return this.left.toLocaleString();
	}
};

ComparisonPredicate.prototype.evaluateWithObject = function (o, vars) {
	vars || (vars = this._substitutionVariables);

	var leftExpressionValue = (this.left.type === 'variable' ? this.left.getValueWithObject(o, vars) : this.left.getValueWithObject(o));
	var rightExpressionValue = (this.right.type === 'variable' ? this.right.getValueWithObject(o, vars) : this.right.getValueWithObject(o));
	var value;

	if (this.selector) {
		value = this.selector(leftExpressionValue, rightExpressionValue);
	}
	else {
		var operator = this.operator;

		// "==", "=", "!=", "<", ">", "<=", ">=", "BETWEEN", "contains", "in", "beginswith", "endswith", "like", "matches";
		if (operator === '==' || operator === '=') {
			value = (leftExpressionValue && leftExpressionValue.isEqual ? leftExpressionValue.isEqual(rightExpressionValue) : (rightExpressionValue && rightExpressionValue.isEqual ? rightExpressionValue.isEqual(leftExpressionValue) : (leftExpressionValue === rightExpressionValue)));
		}
		else if (operator === '!=') {
			value = !(leftExpressionValue && leftExpressionValue.isEqual ? leftExpressionValue.isEqual(rightExpressionValue) : (rightExpressionValue && rightExpressionValue.isEqual ? rightExpressionValue.isEqual(leftExpressionValue) : (leftExpressionValue === rightExpressionValue)));
		}
		else if (operator === '<') {
			value = (leftExpressionValue < rightExpressionValue);
		}
		else if (operator === '>') {
			value = (leftExpressionValue > rightExpressionValue);
		}
		else if (operator === '<=') {
			value = (leftExpressionValue <= rightExpressionValue);
		}
		else if (operator === '>=') {
			value = (leftExpressionValue >= rightExpressionValue);
		}
		else if (operator === 'between') {
			value = (rightExpressionValue[0] <= leftExpressionValue && leftExpressionValue <= rightExpressionValue[1]);
		}
		else if (operator === 'contains') {
			if (leftExpressionValue && leftExpressionValue.constructor === Array) { // TODO: this should probably be done in _expressionValueWithObject
				value = (leftExpressionValue.indexOf(rightExpressionValue) !== -1);
			}
			else {
				// ?
			}
		}
		else if (operator === 'in') {
			value = (rightExpressionValue.indexOf(leftExpressionValue) !== -1);
		}
		else if (operator === 'beginswith') {
			value = (leftExpressionValue.substr(0, rightExpressionValue.length) === rightExpressionValue);
		}
		else if (operator === 'endswith') {
			value = (leftExpressionValue.substr(-(rightExpressionValue.length)) === rightExpressionValue);
		}
		else if (operator === 'like') {
			value = new RegExp(formatAsRegex(rightExpressionValue), 'i').test(leftExpressionValue);
		}
		else if (operator === 'matches') {
			value = new RegExp(formatAsRegex(rightExpressionValue), 'i').test(leftExpressionValue);
		}
		else {
			console.warn("ComparisonPredicate: Unrecognized operator '" + operator + "'");
		}
	}

	return value;
};

module.exports = ComparisonPredicate;
