// http://developer.apple.com/library/mac/#documentation/cocoa/conceptual/Predicates/Articles/pBNF.html

var Expression=require("expression");

(function(root){

   var regex=/(==|=|!=|<=|>=|<|>|between|contains|in|beginswith|endswith|like|matches)/i;

   // constructor is overloaded with multiple argument options:
   //    left, operator, right
   //    {"left", "operator", "right"}
   //    TODO: left, right, selector
   //    TODO: {"left", "right", "selector"}
   function ComparisonPredicate(left, right, operator)
   {
      this.type="comparison";

      if(arguments.length===1)
      {
         var o=arguments[0];
         // if(typeof(arguments))
         {
            this.left=o.left;
            this.right=o.right;
            this.operator=o.operator;
            this.selector=o.selector;
         }
      }
      else
      {
         if(typeof(operator)==="function")
         {
            this.selector=operator;
         }
         else
         {
            this.operator=operator.toLowerCase();
         }

         this.left=left;
         this.right=right;
      }
   }

   // returns an object in {left, operator, right} format
   ComparisonPredicate.parse=function(s, args){

      // console.group("parsing as comparison predicate: ", s);

      var p=null;

      var matches=s.match(regex);

      if(matches)
      {
         var m=matches[0], i=s.indexOf(m), l=m.length;

         // typecast - parse out the right side of the expression, trim whitespace, if it's quoted, it's not a key, so either cast it to a number or a string
         var r=s.substr(i+l).trim();

         /*if(!Predicate._isQuoted(r))
         {
            r=(isNaN(r) ? r : +r); // to strip quotes: r=(isNaN(r) ? r.replace(/["']/g, "") : +r);
         }*/

         //p={left:Expression.parse(s.substr(0, i).trim()), operator:m, right:Expression.parse(r)};
         p=new ComparisonPredicate(Expression.parse(s.substr(0, i).trim(), args), Expression.parse(r, args), m);
      }

      return p;
   };

   ComparisonPredicate.getLocaleStringForOperator=function(operator){

      var localeString="";

      // ==, =, !=, <, >, <=, >=, between, contains, in, beginswith, endswith, like, matches
      // This should just refer to an en i10n file... and we should simply: return app.locales[givenLocale || defaultLocale][operator];
      var lookup={
         "==" : "equals",
         "=" : "equals",
         "!=" : "does not equal",
         "<" : "less than",
         "<=" : "less than or equal to",
         ">" : "greater than",
         ">=" : "greater than or equal to",
         "beginswith" : "begins with",
         "endswith" : "ends with"
      };

      localeString=lookup[operator] || operator;

      return localeString;
   };

   //$properties: ["left", "right", "operator", "selector"],

   ComparisonPredicate.prototype.copy=function(){
      var copy=new ComparisonPredicate(this.left.copy(), this.right.copy(), this.operator || this.selector);

      copy._substitutionVariables=this._substitutionVariables;

      return copy;
   };

   ComparisonPredicate.prototype._predicateReferencesKeys=function(keys){
      return (this.left._expressionReferencesKeys(keys) || this.right._expressionReferencesKeys(keys));
   };

   ComparisonPredicate.prototype._predicateReferencesKeyPath=function(){
      return this.left._expressionReferencesKeyPath() || this.right._expressionReferencesKeyPath();
   };

   // a comparison predicate can't be partially evaluated, so we'll just drop down to null==null
   ComparisonPredicate.prototype._removeExpressionsReferencingKeyPaths=function(){

      if(this.left._expressionReferencesKeyPath() || this.right._expressionReferencesKeyPath())
      {
         this.left=new ConstantExpression(null);
         this.right=new ConstantExpression(null);
      }
   };

   ComparisonPredicate.prototype._removeExpressionsReferencingKeys=function(ks, ps){

      // console.log("remove expressions referencing keys: ", p, ks);

      // ps || (ps=[]);

      // // console.log("comparison predicate: ", p);

      // if(!this._predicateReferencesKeys(ks))
      // {
      //    ps.push(p);
      // }

      // return ps;


      if(this.left._expressionReferencesKeys(ks) || this.right._expressionReferencesKeys(ks))
      {
         this.left=new ConstantExpression(null);
         this.right=new ConstantExpression(null);
      }
   };

   ComparisonPredicate.prototype.getDependentKeyPathExpressions=function(){

      var r=[];

      if(this.left.getType()==="keyPath")
      {
         r.push(this.left);
      }

      if(this.right.getType()==="keyPath")
      {
         r.push(this.right);
      }

      return r;
   };

   ComparisonPredicate.prototype.stringify=function(shouldSubstitute){
      return this.left.stringify(shouldSubstitute) + (this.operator ? this.operator : this.selector) + this.right.stringify(shouldSubstitute);
   };

   ComparisonPredicate.prototype.toLocaleString=function(){
      return this.left.toLocaleString() + (this.operator ? ComparisonPredicate.getLocaleStringForOperator(this.operator) : "matches selector?") + this.right.toLocaleString();
   };

   ComparisonPredicate.prototype.evaluateWithObject=function(o, vars){

      vars || (vars=this._substitutionVariables);

      var leftExpressionValue=(this.left.type==="variable" ? this.left.getValueWithObject(o, vars) : this.left.getValueWithObject(o)),
          rightExpressionValue=(this.right.type==="variable" ? this.right.getValueWithObject(o, vars) : this.right.getValueWithObject(o)),
          value;

      if(this.selector)
      {
         value=this.selector(left, right);
      }
      else
      {
         var operator=this.operator;

         // "==", "=", "!=", "<", ">", "<=", ">=", "BETWEEN", "contains", "in", "beginswith", "endswith", "like", "matches";
         if(operator==="==" || operator==="=")
         {
            value=(leftExpressionValue && leftExpressionValue.isEqual ? leftExpressionValue.isEqual(rightExpressionValue) : (rightExpressionValue && rightExpressionValue.isEqual ? rightExpressionValue.isEqual(leftExpressionValue) : (leftExpressionValue===rightExpressionValue)));
         }
         else if(operator==="!=")
         {
            value=!(leftExpressionValue && leftExpressionValue.isEqual ? leftExpressionValue.isEqual(rightExpressionValue) : (rightExpressionValue && rightExpressionValue.isEqual ? rightExpressionValue.isEqual(leftExpressionValue) : (leftExpressionValue===rightExpressionValue)));
         }
         else if(operator==="<")
         {
            value=(leftExpressionValue<rightExpressionValue);
         }
         else if(operator===">")
         {
            value=(leftExpressionValue>rightExpressionValue);
         }
         else if(operator==="<=")
         {
            value=(leftExpressionValue<=rightExpressionValue);
         }
         else if(operator===">=")
         {
            value=(leftExpressionValue>=rightExpressionValue);
         }
         else if(operator==="between")
         {
            value=(rightExpressionValue<=leftExpressionValue && leftExpressionValue<=rightExpressionValue);
         }
         else if(operator==="contains")
         {
            if(leftExpressionValue && leftExpressionValue.constructor===Array) // TODO: this should probably be done in _expressionValueWithObject
            {
               // check to see if we are working with managed objects...
               if(leftExpressionValue.length)
               {
                  leftExpressionValue=leftExpressionValue.map(function(o){

                     if(o)
                     {
                        var ID;

                        if(o instanceof ManagedObject)
                        {
                           ID=o.getID();

                           o=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
                        }
                        else if(o.store && o.entity && o.reference)
                        {
                           ID=o;

                           o=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
                        }
                     }

                     return o;
                  });

                  // if(leftExpressionValue[0] instanceof ManagedObject)
                  // {
                  //    // TODO: this method could be faster by not first mapping everything... once we find out if it's contained, we're done
                  //    // TODO: it'd be great to have a simple mechanism for caching things like this... if it's part of a fetch request, it's probably going to happen again!
                  //    //       ManagedObjectContext.cache(cachedValue, forKey); ManagedObjectContext
                  //    leftExpressionValue=leftExpressionValue.map(function(o){ var ID=o.getID(); return [ID.store.identifier, ID.entity.name, ID.reference].join("/"); });
                  // }
                  // else if(leftExpressionValue[0].store && leftExpressionValue[0].entity && leftExpressionValue[0].reference)
                  // {
                  //    leftExpressionValue=leftExpressionValue.map(function(ID){ return [ID.store.identifier, ID.entity.name, ID.reference].join("/"); });
                  // }
               }

               if(rightExpressionValue)
               {
                  if(rightExpressionValue instanceof ManagedObject)
                  {
                     rightExpressionValue=rightExpressionValue.getID();
                  }

                  if(rightExpressionValue.store && rightExpressionValue.entity && rightExpressionValue.reference)
                  {
                     rightExpressionValue=[rightExpressionValue.store.identifier, rightExpressionValue.entity.name, rightExpressionValue.reference].join("/");
                  }
               }

               r=(leftExpressionValue.indexOf(rightExpressionValue)!=-1);
            }
            else
            {

            }
         }
         else if(operator==="in")
         {
            value=(rightExpressionValue.indexOf(leftExpressionValue)!==-1);
         }
         else if(operator==="beginswith")
         {
            value=(leftExpressionValue.substr(0, rightExpressionValue.length)===rightExpressionValue);
         }
         else if(operator==="endswith")
         {
            value=(leftExpressionValue.substr(-(rightExpressionValue.length))===rightExpressionValue);
         }
         else if(operator==="like")
         {
            // convert the like predicate to a regex
            var rightExpressionValueAsRegex=rightExpressionValue;

            // ? - matches one character, we use regex .{1,1}, so 'asd?' becomes 'asd.{1,1}' which matches asdf
            rightExpressionValueAsRegex=rightExpressionValueAsRegex.replace(new RegExp("\\?", "g"), ".{1,1}");

            // * - matches 0 or more characters, we use regex .* so 'asd*' becomes 'asd.*' which matches asd, asdf, and asdfghjkl;
            rightExpressionValueAsRegex=rightExpressionValueAsRegex.replace(new RegExp("\\*", "g"), ".*");

            value=new RegExp(rightExpressionValueAsRegex, "i").test(leftExpressionValue);
         }
         else if(operator==="matches")
         {
            console.warn("Predicate: 'matches' comparison operation is not yet supported");
         }
         else
         {
            console.warn("ComparisonPredicate: Unrecognized operator '" + operator + "'");

         }
      }

      return value;
   };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));

      root[name]=mod;
   })(ComparisonPredicate, "ComparisonPredicate");
})(this);
