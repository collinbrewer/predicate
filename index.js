// dependencies
var Predicate=require("./src/predicate.js");

var CompoundPredicate=require("./src/types/compound-predicate.js");
var ComparisonPredicate=require("./src/types/comparison-predicate.js");

// expose
(function(mod, name){
   (typeof(module)!=="undefined" ? (module.exports=mod) : ((typeof(define)!=="undefined" && define.amd) ? define(function(){ return mod; }) : (window[name]=mode)));
})(Predicate, "Predicate");
