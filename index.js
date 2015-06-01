// dependencies
var Predicate=require("./src/predicate.js");
var CompoundPredicate=require("./src/types/compound-predicate.js");
var ComparisonPredicate=require("./src/types/comparison-predicate.js");

// dynamic registration
Predicate.register(ComparisonPredicate);
Predicate.register(CompoundPredicate);

// expose
(function(mod, name){
   (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mod)));

   global[name]=mod;
})(Predicate, "Predicate");
