Predicate
=========
[![Travis](https://img.shields.io/travis/collinbrewer/predicate.svg?maxAge=2592000)](https://travis-ci.org/collinbrewer/predicate)
[![Test Coverage](https://codeclimate.com/github/collinbrewer/predicate/badges/coverage.svg)](https://codeclimate.com/github/collinbrewer/predicate/coverage)
[![Code Climate](https://img.shields.io/codeclimate/github/collinbrewer/predicate.svg?maxAge=2592000)](https://codeclimate.com/github/collinbrewer/predicate)

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
