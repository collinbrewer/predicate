Predicate
=========
[![Dependency Status](https://img.shields.io/david/collinbrewer/predicate/master.svg)](https://david-dm.org/collinbrewer/predicate.svg)
[![Build Status](https://img.shields.io/travis/collinbrewer/predicate.svg)](https://travis-ci.org/collinbrewer/predicate)
[![Coveralls](https://img.shields.io/coveralls/collinbrewer/predicate.svg?maxAge=2592000)](https://coveralls.io/github/collinbrewer/predicate)

A Javascript utility for evaluating objects against a set of criteria.

Installation
------------
```sh
npm install @collinbrewer/predicate -S
```

Usage
-----
```js
let predicate = Predicate.parse('name BEGINSWITH "C" && rank>9');
let satisfies = predicate.evaluateWithObject({name:'Collin', rank:12}); // returns true
```
