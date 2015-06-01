(function(){

   var functionNamesByOperator={
      "+" : "add",
      "-" : "subtract",
      "*" : "multiply",
      "/" : "divide",
      "%" : "modulus"
   };

   // functions
   var Predefined={
      add: function(a, b){ return a+b; },
      subtract: function(a, b){ return a-b; },
      multiply: function(a, b){ return a*b; },
      divide: function(a, b){ return a/b; },
      modulus: function(a, b){ return a%b; }
   };

   /**
    * @class FunctionExpression
    * @description Creates an object describing a function that can be evaluated
    * @param {Object} receiver The target of the function
    * @param {String/Function} func The function or name of the function
    * @param {Array} arguments The arguments to be passed to the function
    * @return {Object} The new FunctionExpression
    */
   function FunctionExpression(target, func, args)
   {
      this.type="function";
      this.target=target;
      this.func=func;
      this.args=args;
   }

   // TODO: Support additional formats:
   // longhand: add(1, 2)
   // absolute: FUNCTION(receiver, selectorName, arguments, ...)
   // eval:     function(argument1, argument2){ return argument1+argument2; };
   FunctionExpression.parse=function(s){

      var e=null,
          operatorRegex=/[\+\-\/\*]/g,
          match=s.match(operatorRegex);

      if(match)
      {
         var operator=match[0],
             args=s.split(operator);


         e=new FunctionExpression(null, operator, args);
      }

      return e;
   };

   FunctionExpression.prototype.getArguments=function(){
      return this.args;
   };

   FunctionExpression.prototype.copy=function(){
      return new FunctionExpression(this.target, this.func, this.args);
   };

   FunctionExpression.prototype.getFunction=function(){
      return this.func;
   };

   FunctionExpression.prototype.getValueWithObject=function(o, getter){

      var Expression=require("../expression.js");

      var target=this.target;
      var func=this.func;
      var args=this.args;

      // sanitize func and target for predefined functions
      // convert shorthand to longhand name and target to "predefined" namespace
      if(func in functionNamesByOperator)
      {
         func=functionNamesByOperator[func];
         target=Predefined;
      }

      // finalize the function
      func=target[func];

      // convert arguments to expressions and evaluate them
      var arguments=[];

      for(var i=0, l=args.length; i<l; i++)
      {
         arguments.push(Expression.parse(args[i]).getValueWithObject(o, getter));
      }

      return func.apply(target, arguments); // return func(a.getValueWithObject(o, getter), b.getValueWithObject(o, getter));
   };

   FunctionExpression.prototype.getDependentKeyPaths=function(){

      var ps=[],
          operatorRegex=/[\+\-\/\*]/,
          args=this.arguments;

      for(var i=0, l=args.length, a; i<l, (a=args[i]); i++)
      {
         a=Expression.parse(a);

         ps=ps.concat(a.getDependentKeyPaths());
      }

      return ps;
   };

   FunctionExpression.prototype._expressionReferencesKeyPath=function(){ return false; };

   FunctionExpression.prototype.stringify=function(){

      var func=this.func;

      if(func in functionNamesByOperator)
      {
         func=functionNamesByOperator[func];
      }

      return func + "(" + this.args.join(", ") + ")";
   };

   FunctionExpression.prototype.toLocaleString=function(){
      return "function";
   };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));

      root[name]=mod;
   })(FunctionExpression, "FunctionExpression");

})();
