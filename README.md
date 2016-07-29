Predicate
=========
[![Dependency Status](https://img.shields.io/david/collinbrewer/predicate/master.svg)](https://david-dm.org/collinbrewer/predicate.svg)

A Javascript utility for evaluating objects against a set of criteria.

Installation
------------
```sh
npm install collinbrewer/predicate -S
```

Usage
-----
```js
let predicate = Predicate.parse('firstName BEGINSWITH "C" && rank>9');
let satisfies = predicate.evaluateWithObject(author); // returns true
```
