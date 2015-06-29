// http://developer.apple.com/library/mac/#documentation/cocoa/conceptual/Predicates/Articles/pBNF.html

(function(root){

   var parsedCache={};
   var compiledCache={};

   // TODO: this is the simplistic first run, look to predicater.html for an in-the-works full parser
   // var comparisonRegex=/(==|=|!=|<=|>=|<|>|between|contains|in|beginswith|endswith|like|matches)/i;
   // var compounderRegex=/[\b\s](&&|and|\|\||or)[\b\s]/gi;

   function Predicate()
   {

   }

   var predicateClasses=[];

   Predicate.register=function(PredicateClass){
      predicateClasses.push(PredicateClass);
   };

   Predicate._isQuoted=function(s){
      var c=s.charAt(0);
      return (c==="'" || c==='"');
   };

   // currently handles compound and comparison predicates, does not handle nested predicates
   Predicate.parse=function(s, args){

      var predicate;

      // clean er up a bit... this should probably be taken care of by each predicate class
      // s=s.trim();

      for(var i=0, l=predicateClasses.length, PredicateClass; i<l, (PredicateClass=predicateClasses[i]); i++)
      {
         if((predicate=PredicateClass.parse(s)))
         {
            break;
         }
      }


      // NOTE: I'm not sure if this is how it should work, can we evaluate the substitution variables ahead of time?
      //    enquoting all the variables should trigger the parser to treat them as constants, however they would no longer be variable expressions
      if(args && args.constructor!==Array)
      {
         p._substitutionVariables=args;
      }


      return predicate;

      var p, i, l, c;

      // we aren't using a real parser yet so we're hacking around issues... one of which is quoted strings that should escape the compounder and predicate operators, for example:
      //    keypath==null AND 'Frank and Beans'
      // this is a compounded, comparison predicate, but will incorrectly parse because the 'and' in 'Frank and Beans' will be treated is a compounder, rather than the constant strinv value, "Frank and Beans"
      // we should use a parser to read the state up to 'Frank and Beans' so that we'd know that the "and" is part of the constant value, but for now, we'll do a simple version of that with some sleight of hand
      // if we find a quoted string, we'll replace it with a special character before we continue parsing, then when we're done, we'll integrate the values back in...
      // so
      //    keypath1==null AND keypath2=='Frank and Beans'
      // will become
      //    keypath1==null AND keypath2=='???'
      // which will correctly be parsed as
      //    [{left:"keypath", operator:"==", right:null}, "AND", {left:"keypath2", operator:"==", right:"???"}]
      // then we'll use *substituteVariables* to integrate the values back in, which will yield
      //    [{left:"keypath", operator:"==", right:null}, "AND", {left:"keypath2", operator:"==", right:'Frank and Beans'}]

      if(!s)
      {
         return new Predicate(); // why not null?
      }
      else if(!s.evaluateWithObject)
      {
         if(typeof(s)==="string")
         {
            s=s.trim();

            // if args is an object, then it's not args it's vars, but we'll convert it to args
            // if(args && args.constructor!==Array)
            // {
            //    console.log("before: ", s);

            //    var vars=args,
            //        args=[],
            //        value, index=0, nextIndex;

            //    console.log("vars: ", vars);

            //    for(var key in vars)
            //    {
            //       nextIndex=s.indexOf("$" + key, index);

            //       console.log("got index of: ", "$" + key, index);

            //       if(index!==-1)
            //       {
            //          s=s.substr(0, nextIndex) + "?" + s.substring(nextIndex+key.length+1);
            //          args.push(vars[key]);
            //       }
            //    }

            //    console.log("after: ", s);
            //    console.log("args: ", args);
            // }

            // p=Predicate._parsedCache[s]; // TODO: use Cache

            if(!p)
            {
               // p=[];

               /* FIXME: quoted strings need to be handled but this code caused lower level issues
               var quotedStrings={};

               for(i=0, l=s.length, c; i<l, (c=s[i]); i++)
               {
                  if(c==="'" || c==='"')
                  {
                     // console.log("   c: ", c);

                     for(var j=i+1, c1; j<l, (c1=s[j]); j++)
                     {
                        // console.log("      c1: ", c1);
                        if(c1===c)
                        {
                           var key=.Util.getUUID().replace(/-/g, ""),
                               value=s.substring(i, j+1);

                           quotedStrings[key]=value;

                           s=s.substring(0, i) + "$" + key + s.substring(j+1);

                           i+=key.length;

                           break;
                        }

                        // NOTE: not sure what to do if the quote isn't matched...?
                     }
                  }
               }*/

               // console.log("found quoted strings: ", quotedStrings);
               // console.log("substituted: ", s);

               var matches=s.match(compounderRegex);

               if(matches)
               {
                  p=CompoundPredicate.parse(s, args);
               }
               else
               {
                  //console.log("parsing hrcomparisonpredicate string: ", s);
                  // p.push(Predicate._parseComparisonPredicate(s));
                  // p.push(ComparisonPredicate.parse(s));
                  p=ComparisonPredicate.parse(s, args);
               }

               //console.log("caching parsed predicate for key: ", s);

               // re-integrate substitutions
               // p=Predicate.substituteVariables(p, quotedStrings);

               // console.log("final: ", p);

               Predicate._parsedCache[s]=p; // store the parsed predicate in the cache
            }
            else
            {
               // console.log("using parsed predicate from cache for key: ", s);
               // p._substitutionVariables=
            }
         }
         else if("left" in s)
         {
            // p=new ComparisonPredicate(s);
            p=s.copy();
         }
         else
         {
            // p=new CompoundPredicate(s);
            p=s.copy();
         }
      }
      else if(s.left)
      {

      }
      else
      {
         p=s;
      }

      // NOTE: I'm not sure if this is how it should work, can we evaluate the substitution variables ahead of time?
      //    enquoting all the variables should trigger the parser to treat them as constants, however they would no longer be variable expressions
      if(args && args.constructor!==Array)
      {
         p._substitutionVariables=args;
      }

      return p;
   };

   // expression: self, employee.title
   // comparison predicate: leftExpression != rightExpression    {left:self, operator:!=, right:employee.title}
   // compound predicate: expression1 && expression2 && expression3   [expression1, &&, expression2, &&, expression3]

   // exp {left:self, operator:in, right:subtasks}
   // ors [[exp1], [exp2]]   ex: "self in subtasks || title !=''"
   // and [exp1, exp2]   ex: "self in subtasks && title != ''"

   // if(exp1 || (exp2 && exp3))   >  [exp1, "||", [exp2, "&&", exp3]]

   Predicate.getExpressions=function(p){

      var es=[];

      if(p.left) // comparison predicate
      {
         es.push(p.left);
         es.push(p.right);
      }
      else
      {
         for(var i=0, l=p.length; i<l; i++)
         {
            if(i%2===0)
            {
               es=es.concat(Predicate.getExpressions(p[i]));
            }
         }
      }

      return es;
   };


   Predicate.prototype.copy=function(){
      console.warn("Predicate subclass requires 'copy' to be overridden.");
   };

   Predicate.prototype._removeExpressionsReferencingKeys=function(){};

   Predicate.prototype.getDependentKeyPathExpressions=function(){ return []; };

   Predicate.prototype._predicateReferencesKeyPath=function(p){

      p=Predicate.parse(p);

      if(p.left)
      {
         if(Expression._expressionReferencesKeyPath(p.left))
         {
            return true;
         }

         if(Expression._expressionReferencesKeyPath(p.right))
         {
            return true;
         }
      }
      else
      {
         for(var i=0, l=p.length; i<l; i++)
         {
            if(i%2===0)
            {
               if(Predicate._expressionReferencesKeyPath(p[i]))
               {
                  return true;
               }
            }
         }
      }

      return false;
   };

   Predicate.prototype._predicateReferencesKeys=function(p, ks){

      // console.log("predicate references keys: ", p, ks);

      p=Predicate.parse(p);

      if(Expression._expressionReferencesKeys(p.left, ks))
      {
         return true;
      }
      else if(Expression._expressionReferencesKeys(p.right, ks))
      {
         return true;
      }

      return false;
   };

   Predicate.prototype._removeExpressionsReferencingKeyPaths=function(p, ps){

      console.log("remove expressions referencing keys: ", p, ps);

      ps || (ps=[]);

      p=Predicate.parse(p);

      if(p.left) // key==value, key>value
      {
         // console.log("comparison predicate: ", p);

         if(!Predicate._predicateReferencesKeyPath(p))
         {
            ps.push(p);
         }
      }
      else // key==value && key2>value2
      {
         //console.log("compound predicate: ", p);

         for(var i=0, l=p.length; i<l; i++)
         {
            if(i%2===0)
            {
               if(Predicate._predicateReferencesKeyPath(p[i]))
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
                  ps=ps.concat(Predicate._removeExpressionsReferencingKeyPaths(p[i]));
               }
            }
            else
            {
               ps.push(p[i]);
            }
         }
      }

      return ps;
   };

   Predicate.prototype.toLocaleString=function(){ return ""; };

   Predicate.prototype.stringify=function(){ return ""; };

   Predicate.prototype.evaluateWithObject=function(o, vars){
      return true;
   };

   global.Predicate=Predicate;


   // dependencies
   var CompoundPredicate=require("./types/compound-predicate.js");
   var ComparisonPredicate=require("./types/comparison-predicate.js");

   // dynamic registration
   Predicate.register(ComparisonPredicate);
   Predicate.register(CompoundPredicate);


   // expose
   (function(mod, name, root){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));

      root[name]=mod;
   })(Predicate, "Predicate", root);

})(this);
