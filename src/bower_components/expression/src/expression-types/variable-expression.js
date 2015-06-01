(function(){

   var JSONPointer=require("../bower-components/json-pointer/index.js");
   var DotPointer=JSONPointer.Factory({delimiter:"."});

   function VariableExpression(variable, vars){

      this.type="variable";
      this.variable=variable;

      this._substitutionVariables=vars;
   }

   VariableExpression.prototype.copy=function(){
      return new VariableExpression(this.variable, this._substitutionVariables); // Note sure this is needed... .Util.extend({}, this._substitutionVariables));
   };

   VariableExpression.prototype.getValueWithObject=function(o, vars){

      var value;

      vars || (vars=this._substitutionVariables);

      if(vars)
      {
         value=DotPointer.evaluate(this.variable.substr(1), vars);
      }
      else
      {
         console.error("no values given for variable expression: ", this);
      }

      return value;
   };

   VariableExpression.prototype.getDependentKeyPaths=function(){ return []; };
   VariableExpression.prototype._expressionReferencesKeys=function(){ return false; };
   VariableExpression.prototype._expressionReferencesKeyPath=function(){ return false; };

   VariableExpression.prototype.stringify=function(shouldSubstitute){
      return (shouldSubstitute ? JSON.toString(this.getValueWithObject(null)) : this.variable);
   };

   VariableExpression.prototype.toLocaleString=function(){
      return this.variable;
   };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));
   })(VariableExpression, "VariableExpression");
})();
