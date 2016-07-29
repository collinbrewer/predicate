// dependencies
var Predicate=require("./src/predicate.js");
var CompoundPredicate=require("./src/types/compound-predicate.js");
var ComparisonPredicate=require("./src/types/comparison-predicate.js");
var ExpressionPredicate=require('./src/types/expression-predicate.js');

// dynamic registration
Predicate.register(CompoundPredicate);
Predicate.register(ComparisonPredicate);
Predicate.register(ExpressionPredicate);

module.exports=Predicate;
