var should=require("chai").should();

var Predicate=require("../index.js");

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

      it("returns a complex compound predicate", function(){
         var predicate=Predicate.parse("1==1 && 2==2");

         predicate.should.have.property("subpredicates");
         predicate.subpredicates.should.have.length(2);
      });

      it('maintain substitution variables', function(){
         var predicate=Predicate.parse('$substitutedVariable==3', {substitutedVariable:3});

         predicate.evaluateWithObject({}).should.equal(true);
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
