var Expression=require("expression");

// if(typeof(exports)==="object" && typeof(define)!=="function"){
//    var define=function(id, deps, factory){
//       require(deps);
//       var mod=factory(require, exports, module);
//       mod || (mod=exports);
//    };
// }

(function(root){

   var regex=/[\b\s](&&|and|\|\||or)[\b\s]/gi;
   var shorthandTypes={"&&":"and", "||":"or"};

   function ExpressionPredicate(expression){
      this.expression=expression;
   }

   ExpressionPredicate.prototype.evaluateWithObject=function(o, vars){
      return this.expression.getValueWithObject(o);
   };

   function CompoundPredicate(type, a)
   {
      type=(typeof(type)==="string" ? type : type[0]);

      this.type=(shorthandTypes[type] || type.toLowerCase());

      var subs=[],
          subpredicates=[];

      if(a.constructor===Array)
      {
         subs=a;
      }
      else
      {
         subs=[].slice.call(arguments, 1);
      }

      for(var i=0, l=subs, sub; i<l, (sub=subs[i]); i++)
      {
         if(!sub.evaluateWithObject)
         {
            sub=Predicate.parse(sub, a);
         }

         subpredicates.push(sub);
      }

      this.subpredicates=subpredicates;
   }

   CompoundPredicate.parse=function(s, args){

      var predicate=null,
          i=0, l=s.length,
          matches=s.match(regex);

      if(matches) // 1 && false
      {
         var compounder=matches[0].trim(),
             index=s.indexOf(compounder),
             firstPredicate=Predicate.parse(s.substring(0, index), args),
             secondPredicate=Predicate.parse(s.substring(index+compounder.length), args);

         predicate=new CompoundPredicate(compounder, [firstPredicate, secondPredicate]);
      }
      else // false
      {
         var expression=Expression.parse(s);
         predicate=new ExpressionPredicate(expression);
      }

      return predicate;
   };

   CompoundPredicate.and=function(){

      // var subs=

      return new CompoundPredicate("and", [].slice.call(arguments));
   };

   CompoundPredicate.or=function(){
      return CompoundPredicate.apply(null, ["or"].concat(arguments));
   };

   // $properties: ["subpredicates", "type"],


   CompoundPredicate.prototype.copy=function(){
      var subs=[];

      // TODO: I think we can just use .Object.copy(this.subpredicates) here...
      for(var i=0, subpredicates=this.subpredicates, l=subpredicates.length; i<l; i++)
      {
         subs.push(subpredicates[i].copy());
      }

      return new CompoundPredicate(this.type, subs);
   };

   CompoundPredicate.prototype._predicateReferencesKeyPath=function(){

      var p=this.subpredicates;

      for(var i=0, l=p.length; i<l; i++)
      {
         if(p[i]._predicateReferencesKeyPath())
         {
            return true;
         }
      }

      return false;
   };

   CompoundPredicate.prototype._removeExpressionsReferencingKeyPaths=function(){

      var ps=this.subpredicates;

      for(var i=0, l=ps.length; i<l; i++)
      {
         ps[i]._removeExpressionsReferencingKeyPaths();

         // if(i%2===0)
         {
            if(ps[i]._predicateReferencesKeyPath())
            {
               // if(i<l-1) // if there is a next compound, skip it
               // {
               //    i++;
               // }
               // else if(i>0) // if there is a previous compound, skip it
               {
                  ps.splice(ps.length-1, 1);
               }
            }
            // else
            // {
            //    ps=ps.concat(ps[i]._removeExpressionsReferencingKeyPaths());
            // }
         }
         // else
         // {
         //    ps.push(p[i]);
         // }
      }

      // this.subpredicates=ps;
   },

   CompoundPredicate.prototype._removeExpressionsReferencingKeys=function(ks, ps){

      // console.log("remove expressions referencing keys: ", p, ks);

      p=this.subpredicates;

      ps || (ps=[]);

      for(var i=0, l=p.length; i<l; i++)
      {
         if(i%2===0)
         {
            if(p[i]._predicateReferencesKeys(ks))
            {
               if(i<l-1) // if there is a next compound, skip it
               {
                  i++;
               }
               else if(i>0) // if there is a previous compound, skip it
               {
                  ps.splice(ps.length-1, 1);
               }
            }
            else
            {
               ps=ps.concat(p[i]._removeExpressionsReferencingKeys(ks));
            }
         }
         else
         {
            ps.push(p[i]);
         }
      }

      return ps;
   };

   CompoundPredicate.prototype.getDependentKeyPathExpressions=function(){

      var expressions=[];
      var subpredicates=this.subpredicates;

      for(var i=0, l=subpredicates.length, subpredicate; i<l, (subpredicate=subpredicates[i]); i++)
      {
         expressions=expressions.concat(subpredicate.getDependentKeyPathExpressions());
      }

      // var dependent=this.subpredicates.map(function(predicate){ return predicate.getDependentKeyPathExpressions(); });

      return expressions;
   };

   CompoundPredicate.prototype.stringify=function(){
      return this.subpredicates.map(function(predicate){ return predicate.stringify(); }).join(" " + this.type + " ");
   };

   // priority is equal to 1 and date due is today property3 and lastProperty is between 1 and 2
   // proper
   // x, y, and z
   CompoundPredicate.prototype.toLocaleString=function(){
      return this.subpredicates.map(function(p){ return p.toLocaleString(); }).join(this.type);
   };

   CompoundPredicate.prototype.evaluateWithObject=function(o, vars){

      vars || (vars=this._substitutionVariables);

      var subpredicates=this.subpredicates,
          type=this.type,
          isAnd=type==="and",
          result=(isAnd ? true : false),
          truth;

      for(var i=0, l=subpredicates.length, subpredicate; i<l, (subpredicate=subpredicates[i]); i++)
      {
         if(subpredicate.evaluateWithObject(o, vars))
         {
            if(!isAnd)
            {
               return true;
            }
         }
         else
         {
            if(isAnd)
            {
               return false;
            }
         }
      }

      return result;
   };

   CompoundPredicate.prototype.and=function(predicate){
      return new CompoundPredicate("and", [this, predicate]);
   };

   CompoundPredicate.prototype.or=function(predicate){
      return new CompoundPredicate("or", [this, predicate]);
   };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));

      root[name]=mod;
   })(CompoundPredicate, "CompoundPredicate");

})(this);
