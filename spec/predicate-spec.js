var should=require("chai").should();

// var Expression=require("./bower_components/expression/index.js");
//
// global.Expression=Expression;

var Predicate=require("../src/predicate.js");

describe("Predicate", function(){

   context("#parse", function(){

      it("returns a compound predicate", function(){
         var predicate=Predicate.parse("1 && 1");

         predicate.should.have.property("subpredicates");
      });

      it("returns a comparison predicate", function(){
         var predicate=Predicate.parse("1==1");

         predicate.type.should.equal("comparison");
      });
   });

   context("#evaluateWithObject", function(){

      it("returns true", function(){
         Predicate.parse("1 && 1").evaluateWithObject({}).should.equal(true);
      });

      it("returns false", function(){
         var predicate=Predicate.parse("1 && false");

         predicate.evaluateWithObject({}).should.equal(false);
      });

      it("returns true", function(){
         Predicate.parse("1==1").evaluateWithObject({}).should.equal(true);
      });

      it("returns true", function(){
         Predicate.parse("1==1").evaluateWithObject({}).should.equal(true);
      });
   });
});
