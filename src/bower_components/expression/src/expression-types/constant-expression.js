(function(){

   function ConstantExpression(value)
   {
      this.type="constant";
      this.value=value;
   }

   ConstantExpression.prototype.copy=function(){
      return new ConstantExpression(this.value);
   };

   ConstantExpression.prototype.getValueWithObject=function(o){
      return this.value;
   };

   ConstantExpression.prototype.getDependentKeyPaths=function(){ return []; };
   ConstantExpression.prototype._expressionReferencesKeys=function(){ return false; };
   ConstantExpression.prototype._expressionReferencesKeyPath=function(){ return false; };

   ConstantExpression.prototype.stringify=function(){

      var v=this.value;

      if(v)
      {
         if(v.length && (v[0] && (v[0].getID || v[0].entity))) // array of managed objects
         {
            var a=new Array(v.length), ID;

            for(var i=0, l=v.length, o; i<l, (o=v[i]); i++)
            {
               if(o.getID)
               {
                  ID=o.getID();

                  a[i]=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
               }
               else
               {
                  a[i]=[o.store.identifier, o.entity.name, o.reference].join("/");
               }
            }

            v=a;
         }
         else if(v.getID)// instanceof ManagedObject)
         {
            v=v.getID();

            if(v && v.store && v.entity && v.reference)
            {
               v=[v.store.identifier, v.entity.name, v.reference].join("/");
            }
         }
      }

      v=JSON.stringify(v);//v=(v===null ? "null" : (v===undefined ? "undefined" : v.toString()));

      return v;
   };

   ConstantExpression.prototype.toLocaleString=function(){
      return this.stringify();
   };

   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));
   })(ConstantExpression, "CosntantExpression");
})();
