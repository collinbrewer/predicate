// an expression is a representation of a value and can be a static value, or an evaluated value
//    constants - 'a string', 3, true, null
//    evaluated object -
//    variable - $VARIABLE_KEY
//    key path - path.to.key
//    function -
var ConstantExpression=require("./expression-types/constant-expression.js");
var EvaluatedObjectExpression=require("./expression-types/evaluated-object-expression.js");
var FunctionExpression=require("./expression-types/function-expression.js");
var KeyPathExpression=require("./expression-types/key-path-expression.js");
var VariableExpression=require("./expression-types/variable-expression.js");


(function(root){

   var _cache={};
   var _debug=false;

   function Expression(){};

   Expression.prototype.getDependentKeyPaths=function(){
      return [];
   };

   Expression.parse=function(s, args){

      // args && console.assert(args.constructor===Array, "Expression.parse expects args to be an array: " + s + ", " + JSON.stringify(args));

      var e, vars;

      if(arguments.length===2)
      {
         var second=arguments[1];

         if(second)
         {
            var isArray=(second.constructor===Array);
            args=(isArray ? second : []);
            vars=(isArray ? {} : second);
         }
      }

      typeof(s)==="number" && (s="" + s);

      if(typeof(s)==="string")
      {
         s=s.trim();

         if(s==="?" && args && args.length!==0) // formatter substitution
         {
            // console.log("args: ", args);
            s=args.shift();
         }

         e=_cache[s];

         if(!e)
         {
            if(typeof(s)==="string")
            {
               var c=s.charAt(0);

               if(c==="$")
               {
                  e=new VariableExpression(s, vars);
               }
               else if(c==="'" || c==='"') // quoted string
               {
                  e=new ConstantExpression(s.substring(1, s.length-1));
               }
               else if(s==="self" || s==="this")
               {
                  e=new EvaluatedObjectExpression();
               }
               else if(s==="null")
               {
                  e=new ConstantExpression(null);
               }
               else if(s==="true")
               {
                  e=new ConstantExpression(true);
               }
               else if(s==="false")
               {
                  e=new ConstantExpression(false);
               }
               else if(!isNaN(s))
               {
                  // e=+s;
                  e=new ConstantExpression(+s);
               }
               else // things are getting "fuzzy"
               {
                  var operators=s.match(/[\+\-\/\*]/g); // ["+", "-", "/", "*"]

                  if(operators)
                  {
                     e=FunctionExpression.parse(s);
                  }
                  else
                  {
                     // e=s; // keypath?
                     e=new KeyPathExpression(s);
                  }
               }

               _cache[s]=e;
            }
            else
            {
               e=new ConstantExpression(s);
            }
         }
         else
         {
            if(e.type==="variable")
            {
               e._substitutionVariables=vars;
            }
         }
      }

      return e;
   };

   Expression.resultIsArithmatic=function(e){

      var isArithmatic=false,
          i=e.indexOf(".");

      if(i!==-1)
      {
         var operator=e.substring(0, i);

         // collection operator
         if(operator==="@avg" ||
            operator==="@average" ||
            operator==="@variance" ||
            operator==="@count" ||
            operator==="@min" ||
            operator==="@max" ||
            operator==="@median" ||
            operator==="@mode" ||
            operator==="@stddev" ||
            operator==="@sqrt" ||
            operator==="@log" ||
            operator==="@ln" ||
            operator==="@exp" ||
            operator==="@ceil" ||
            operator==="@abs" ||
            operator==="@sum")
         {
            isArithmatic=true;
         }
         else if(operator==="@count")
         {
            isArithmatic=true;
         }
      }

      return isArithmatic;
   };

   // getDependentKeyPaths: function(e){

   //    var ps=[];

   //    if(Expression.getType(e)==="keypath")
   //    {
   //       var splits=Expression.getKeyPath(e).replace(/@[a-zA-Z].+?\./g, "").split("."),
   //           key;

   //       while((key=splits.shift()))
   //       {
   //          if(key.indexOf("@")===-1) // if this key is not a collection operator
   //          {
   //             ps.push(key);

   //             break;
   //          }
   //       }
   //    }
   //    else if(e.type)
   //    {
   //       if(e.type==="function")
   //       {
   //          console.log("found function expression!");
   //       }
   //    }
   //    else
   //    {
   //       console.warn("not sure...", e);
   //    }

   //    return ps;
   // },

   // returns the value of an expression in the context of an object...
   // NOTE: an issue cropped up on 5-28-13 causing predicates to compile and filter incorrectly.  When an expression is a key, it gets evaluated as a property, which
   //       could be a relationship and return another managed object, this needs to be normalized, so it can be compared with another expression
   //       example expression: transaction == transaction
   //          the left expression will evaluate as a managed object, however the right transaction will evaluate as an ID
   //          we need to either have the left expression evaluate managed object ID
   Expression.valueWithObject=function(e, o, getter){

      console.warn("Expression.valueWithObject is deprecated");

      var v, i, l, obj, ID;

      if(_debug)
      {
         console.log("working on e: ");
         console.log(e);
         console.log("typeof: " + typeof e);
      }

      if(e!==null && e!==undefined)
      {
         if(Object.prototype.toString.call(e) === '[object Array]')
         {
            if(e.length && (e[0].getID || e[0].entity)) // array of managed objects
            {
               v=new Array(e.length);

               for(i=0, l=e.length; i<l, (obj=e[i]); i++)
               {
                  if(obj.getID)
                  {
                     ID=obj.getID();

                     v[i]=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
                  }
                  else
                  {
                     v[i]=[obj.store.identifier, obj.entity.name, obj.reference].join("/");
                  }
               }
            }
            else
            {
               v=e;
            }
         }
         if(typeof(e)==="object")
         {
            if(e instanceof ManagedObject)
            {
               //var ID=e.getID();
               //v=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
               v=e;
            }
            else if(e.store && e.entity && e.reference)
            {
               v=[e.store.identifier, e.entity.name, e.reference].join("/");
            }
            /*else if(e.getTime)
            {
               if(d) console.log("treating as date");

               v=e.getTime();
            }*/
            else if(e.getValueWithObject)
            {
               v=e.getValueWithObject(o);
            }
            else
            {
               v=e;
            }
         }
         else
         {
            if(isNaN(e))//if(e==NaN)
            {
               //Debugger.logStacktrace();

               // console.log("working on e: ");
               // console.log(e);
               // console.log("typeof: " + typeof e);
            }

            var s;

            // literals - numeric, predicate argument, predicate variable, null, true, false, self
            if(!isNaN(e)) // numeric
            {
               if(_debug) console.log("treating as number!");

               v=+e;
            }
            else if(e.toLowerCase()==="null") // null
            {
               if(_debug) console.log("treating as null!");

               v=null;
            }
            else if(e.toLowerCase()==="true") // true
            {
               if(_debug) console.log("treating as true!");

               v=true;
            }
            else if(e.toLowerCase()==="false") // false
            {
               if(_debug) console.log("treating as false!");

               v=false;
            }
            else if(e.toLowerCase()==="self") // self
            {
               if(_debug) console.log("treating as self!");

               //console.log("self!");
               //console.log(o);

               v=o;
            }
            else if(e.charAt(0)==="'" || e.charAt(0)==='"') // string
            {
               if(_debug) console.log("treating as string!");

               //console.log(e);

               /* jslint evil:true */
               v=eval(e);
            }
            else if((s=e.toLowerCase().indexOf("function("))>=0) // function
            {
               i=8;

               //console.log("is a function!");

               console.warn("function predicates have not been tested");

               // FUNCTION(receiver, selectorName, arguments, ...),
               var f=e.indexOf(")", i);

               if(f>=0)
               {
                  var innards=e.substring(i+1, f);

                  //console.log(innards);

                  var split=innards.split(",");

                  /* jslint evil:true */
                  var operand=eval(split[0].trim()),
                      fnName=eval(split[1].trim()),
                      args=split.slice(2).map(function(i){ return eval(i.trim()); });

                  v=operand[fnName].apply(operand, args);

                  //.Object.performApply(o, fnName, args);
               }
            }
            else // keypath
            {
               // FIXME: this isn't working, maybe because o.get doesn't support keypaths?

               if(e==="ID")
               {
                  ID=o.getID();

                  v=[ID.store.identifier, ID.entity.name, ID.reference].join("/");
               }
               else
               {
                  //v=o.get ? o.get(e) : .Object.get(o, e);
                  //v=getter(o, e);
                  v=HR.Object.get(o, e, getter);
               }
            }
         }
      }

      if(_debug) console.log(v);

      return v;
   };

   Expression.expressionWithType=function(type, args){

      var className=Expression.getExpressionClassForType(type);

      if(className)
      {
         console.log("className: ", className);
         return window[className].apply(null, args);
      }

      return null;
   };

   Expression.expressionForConstantValue=function(v){
      // var e=Expression._expressionWithType("constant");

      // e.setConstant()
      return new ConstantExpression(v);
   };

   Expression.expressionForKeyPath=function(k){
      return new KeyPathExpression(k);
   };

   Expression.expressionForFunction=function(){
      return Expression._expressionWithType("function", arguments);
   };

   Expression.getExpressionClassForType=function(type){

      var classesByType={
         "constant":"ConstantExpression",
         "function":"FunctionExpression",
         "keyPath":"KeyPathExpression"
      };

      return classesByType[type];
   };

   Expression.expressionReferencesKeys=function(){ return false; };
   Expression.expressionReferencesKeyPath=function(){ return false; };

   Expression.prototype.copy=function(){ console.warn("Expression subclasses require 'copy' to be overridden."); };
   Expression.prototype.stringify=function(){};
   Expression.prototype.toLocaleString=function(){ console.warn("Not Yet Implemented"); };
   Expression.prototype.getValueWithObject=function(){ console.warn("Expression subclasses require 'getValueWithObject' to be overridden."); };

   // expose
   (function(mod, name){
      (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));
      root[name]=mod;
   })(Expression, "Expression");

})(this);
