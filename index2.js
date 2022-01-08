'use strict'
const { default: axios } = require('axios');
const { default: CAF } = require('caf');
//yield delegation exercise
/* function* gen1 () {
    yield 1;
    yield 2;
    return 4;
}

function* gen2 () {
    const val = yield* gen1(); //THIS IS YIELD DELEGATION
    console.log(val) // this prints just after yield 2 
    yield 3;
    yield val;
}

const it = gen2()
console.log(it.next()) // { value: 1, done: false }
console.log(it.next()) // { value: 2, done: false }
console.log(it.next()) // { value: 3, done: false }
console.log(it.next()) // { value: 4, done: false }
*/

/*
function gen1 () { // a normal function
    return ['three', 'six', 'nine']
}

function* gen2 () {
    const val = yield* gen1(); //YIELD DELEGATION can be applied to a normal function
}                              // an iterable is required for yield function .. even an array is an iterable

const it = gen2()
console.log(it.next()) // { value: 'three', done: false }
console.log(it.next()) // { value: 'six', done: false }
console.log(it.next()) // { value: 'nine', done: false }
*/
// const token = new CAF.timeout(300, "this is taking too long")

