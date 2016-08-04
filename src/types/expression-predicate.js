var Expression=require("@collinbrewer/expression");

function ExpressionPredicate(expression){
   this.expression=expression;
}

ExpressionPredicate.prototype.evaluateWithObject=function(o, vars){
   return this.expression.getValueWithObject(o);
};

ExpressionPredicate.parse = function (s) {
   var predicate;
   var expression=Expression.parse(s);

   if(expression) {
      predicate=new ExpressionPredicate(expression);
   }

   return predicate;
};

module.exports=ExpressionPredicate;
