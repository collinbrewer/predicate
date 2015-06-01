var should=require("chai").should();
var Expression=require("../index.js");

describe("Expression", function(){

   context("#parse", function(){

      it("returns a constant expression", function(){
         var expression=Expression.parse("1");

         expression.type.should.equal("constant");
      });

      it("returns an evaluated expression", function(){
         var expression=Expression.parse("self");

         expression.type.should.equal("evaluatedObject");
      });

      // it("returns a function expression", function(){
      //    var expression=Expression.parse("1");
      //
      //    expression.type.should.equal("function");
      // });

      it("returns a key path expression", function(){
         var expression=Expression.parse("key.path");

         expression.type.should.equal("keyPath");
      });

      it("returns a variable expression", function(){
         var expression=Expression.parse("$variable");

         expression.type.should.equal("variable");
      });
   });
});

describe("ConstantExpression", function(){

   context("#getValueWithObject", function(){

      it("returns the constant value", function(){
         var expression=Expression.parse("'foo'");

         // console.log("expression: ", expression);

         expression.getValueWithObject({}).should.equal("foo");
      });
   });

   context("#copy", function(){

      it("creates a copy of the receiver", function(){
         var expression=Expression.parse("'foo'");

         expression.copy().getValueWithObject({}).should.equal("foo");
      });
   });

   context("#stringify", function(){

      it("returns a string representing the string", function(){
         var expression=Expression.parse("'foo'");

         expression.stringify().should.equal("\"foo\"");
      });

      it("returns a string representing the boolean", function(){
         var expression=Expression.parse("true");

         expression.stringify().should.equal("true");
      });

      it("returns a string representing the number", function(){
         var expression=Expression.parse("1");

         expression.stringify().should.equal("1");
      });

      it("returns a string representing the object", function(){
         var expression=new Expression.parse("{}");

         expression.stringify().should.equal("{}");
      });

      it("returns a string representing the array", function(){
         var expression=Expression.parse("[]");

         expression.stringify().should.equal("[]");
      });
   });
});

describe("EvaluatedObjectExpression", function(){

   context("#getValueWithObject", function(){

      it("returns the given object(self)", function(){
         var o=new (function(){})();
         var expression=Expression.parse("self");

         expression.getValueWithObject(o).should.equal(o);
      });
   });

   context("#copy", function(){

      it("creates a copy of the receiver", function(){
         var o=new (function(){})();
         var expression=Expression.parse("self");

         expression.copy().getValueWithObject(o).should.equal(o);
      });
   });

   context("#stringify", function(){

      it("returns a string representing the expression", function(){
         var o=new (function(){})();
         var expression=Expression.parse("self");

         expression.stringify().should.equal("self");
      });
   });

});

describe("FunctionExpression", function(){

   var expression;
   var func;
   var args;

   beforeEach(function(){
      expression=Expression.parse("1+2");
   });

   context("#getValueWithObject", function(){
      it("returns the value of the function", function(){
         expression.getValueWithObject().should.equal(3);
      });
   });

   context("#copy", function(){
      it("creates a copy of the receiver", function(){
         expression.copy().getValueWithObject().should.equal(3);
      });
   });

   context("#parse", function(){
      it("create a function expression from a shorthand string representation", function(){
         expression.getValueWithObject().should.equal(3);
      });

      // Expression.parse("FUNCTION(receiver, selectorName, arguments, ...)")
      it("create a function expression from a longhand string representation");
   });

   context("#stringify", function(){
      it("returns a string representing the expression", function(){
         expression.stringify().should.equal("add(1, 2)");
      });
   });
});

describe("KeyPathExpression", function(){

   var expression;
   var object={
      "path" : {
         "to" : {
            "value" : "foo"
         }
      }
   };

   beforeEach(function(){
      expression=Expression.parse("path.to.value");
   });

   context("#getValueWithObject", function(){
      it("returns the value of the function", function(){
         expression.getValueWithObject(object).should.equal("foo");
      });
   });

   // context("#copy", function(){
   //    it("creates a copy of the receiver", function(){
   //       expression.copy().getValueWithObject().should.equal("foo");
   //    });
   // });
   //
   // context("#stringify", function(){
   //    it("returns a string representing the expression", function(){
   //       expression.stringify().should.equal("path.to.value");
   //    });
   // });
});

describe("VariableExpression", function(){

   var expression;
   var object={};

   beforeEach(function(){
      expression=Expression.parse("$var");
   });

   context("#getValueWithObject", function(){
      it("returns the value of the function", function(){
         expression.getValueWithObject(object, {"var":"foo"}).should.equal("foo");
      });
   });

   // context("#copy", function(){
   //    it("creates a copy of the receiver", function(){
   //       expression.copy().getValueWithObject().should.equal("foo");
   //    });
   // });
   //
   // context("#stringify", function(){
   //    it("returns a string representing the expression", function(){
   //       expression.stringify().should.equal("path.to.value");
   //    });
   // });
});
