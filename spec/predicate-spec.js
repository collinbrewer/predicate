var should=require("chai").should();

var Predicate=require("../index");

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

      it('should maintain substitution variables', function(){
         var predicate=Predicate.parse('$three==3 && values.number>$four', {three:3, four:4});
         predicate.evaluateWithObject({values:{number:10}}).should.equal(true);
      });

      it('returns a predicate when an existing predicate is provided', function(){
         var predicate=Predicate.parse('1');
         var existingPredicate=Predicate.parse(predicate);
         predicate.should.not.equal(undefined);
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
