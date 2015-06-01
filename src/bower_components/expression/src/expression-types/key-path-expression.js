(function(){

   var JSONPointer=require("../bower-components/json-pointer/index.js");
   var DotPointer=JSONPointer.Factory({delimiter:"."});

   function KeyPathExpression(keyPath)
   {
      this.type="keyPath";

      this.keyPath=keyPath;
   }

   KeyPathExpression.prototype.copy=function(){
      return new KeyPathExpression(this.keyPath);
   };

   KeyPathExpression.prototype.getType=function(){
      return "keyPath";
   };

   KeyPathExpression.prototype.getValueWithObject=function(o, getter){

      var debug=false;//(this.keyPath==="transaction.dateCompleted");

      debug && console.group("getting value of keypath(%s) on object: ", this.keyPath, o);

      debug && console.log("using getter: ", getter);

      var value=DotPointer.evaluate(this.keyPath, o, getter);

      debug && console.log("value: ", value);

      debug && console.groupEnd();

      return value;
   };

   KeyPathExpression.prototype.getDependentKeyPaths=function(){

      var ps=[];

      var splits=this.keyPath.replace(/@[a-zA-Z].+?\./g, "").split("."),
          key;

      while((key=splits.shift()))
      {
         if(key.indexOf("@")===-1 && key.indexOf("$")===-1) // if this key is not a collection operator
         {
            ps.push(key);

            break;
         }
      }

      return ps;
   };

   KeyPathExpression.prototype.getFirstKeyInKeyPath=function(){

      var components=this.keyPath.split("."),
          firstKey=null,
          key;

      while((key=components.shift()))
      {
         if(key.charAt(0)!=="@")
         {
            firstKey=key;
            break;
         }
      }

      return firstKey;
   };

   KeyPathExpression.prototype._expressionReferencesKeys=function(ks){
      return (ks.indexOf(this.keyPath)>=0); // TODO: I don't think this is complete because the our keypath could contain one of the keys
   };

   KeyPathExpression.prototype._expressionReferencesKeyPath=function(){
      return (this.keyPath.indexOf(".")!==-1);
   };

   KeyPathExpression.prototype.stringify=function(){
      return this.keyPath;
   };

   // name -> name
   // business.name -> name of business
   // boss.business.name -> name of business of boss
   KeyPathExpression.prototype.toLocaleString=function(){
      return this.keyPath.split(".").reverse().join(" of ");
   };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));
   })(KeyPathExpression, "KeyPathExpression");

})();
