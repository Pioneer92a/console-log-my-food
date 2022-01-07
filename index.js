#! /usr/bin/env node
// the above line tells the computer that we need to execute this line with node

/* this project is created to learn about iterators
they can be paused at a specific moment and thus give higher functionality than a standard loop
they are also lazy, meaning they are not utilized until necessary 
*/
/* iterable: for an object to be iterable, it must implement the iterator method
examples of iterables: arrays, strings, maps, sets
for..of only works with iterables, as it iterates over values
however, for..in is not the same, as it iterates over enumerable properties
*/

// const { Axios, default: axios } = require('axios');

// import { createInterface, question, close } from "readline";

// // Symbol.iterator is a well known symbol in JS .. lets see an example
// const arr = [0,3,4]
// const it = arr[Symbol.iterator]();
// console.log(it.next())  // {value: 0, done: false}
// console.log(it.next())  // {value: 3, done: false}
// console.log(it.next())  // {value: 4, done: false}
// console.log(it.next())  // {value: undefined, done: true}

// // now lets implement an iterator using maps
// const map = new Map()
// map.set('key1', 'value 1')
// map.set('key2', 'value 2')
// const mapIterator = map[Symbol.iterator]()
// console.log(mapIterator.next().value) //['key1', 'value 1']
// console.log(mapIterator.next().value) //['key2', 'value 2']
// console.log(mapIterator.next().value) //undefined

// // the same thing above can be done using the for..of method which also uses Symbol.iterator under the hood
// for (const value of map) { 
//     console.log(value) // ['key1', 'value 1'], ['key2', 'value 2']
// }


////////////////////
/* The exercise project starts here .. It is a webb application that maintains a food log of the things a user has eaten
-> Browsers such as google dont support Node commands yet, such as 'require' .. so we'll run the program in VSCode terminal here using node as prefix
(node ./index.js)
-> launch json-server before making REST requests to get data from there (we are storing json-formatted files there) 
(npx json-server --watch ./db.json --port 3001)
-> we are using axios to make RESTful requests to our json server
*/

// code starts here
const axios = require('axios')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'enter command > '
});

readline.prompt() // prompt the user for input
readline.on('line', async line => { // add an event listener to user's prompt
    switch (line.trim()) {
        case 'list vegan foods':
            {   // implementing a custom iterator here
                axios.get(`http://localhost:3001/food`).then(({ data }) => {
                    let idx = 0;
                    const veganOnly = data.filter(food => {
                        return food.dietary_preferences.includes('vegan')
                    })
                    const veganIterable = { // this object needs a Symbol.iterator method defined
                        [Symbol.iterator]() { // adding custom logic in Symbol.iterator method
                            return {
                                [Symbol.iterator]() { // we need a symbol.iterator method that returns itself
                                    return this;
                                },
                                next() {
                                    const current = veganOnly[idx];
                                    idx++;
                                    if (current) { // if current is still defined
                                        return { value: current, done: false }
                                    } else {
                                        return { value: current, done: true }
                                    }
                                },
                            }
                        },
                    };
                    for (let val of veganIterable) {
                        console.log(val.name)
                    }
                    readline.prompt()
                })
            }
            break;
        case 'log':
            {   // implementing built-in iterable here
                const { data } = await axios.get(`http://localhost:3001/food`)
                const it = data[Symbol.iterator](); //data is an object having function Symbol.iterator() .. read in mind like: data.(Symbol.iterator)() 
                let actionIt; // to be defined later for actionIterator

                const actionIterator = { // custom iterator to iterate functions instead of objects
                    [Symbol.iterator]() {
                        let positions = [...this.actions]
                        // let positions = this.actions // it also works fine in place of above statement
                        return {
                            [Symbol.iterator]() {
                                return this;
                            },
                            next(...args) {
                                if (positions.length > 0) { //check to see if we haven't finished the list
                                    const position = positions.shift() //shift removes the first element of an array and returns it
                                    // console.log(position) // it prints [Function: askForServingSize] first .. and then second time prints [Function: displayCalories]
                                    const result = position(...args)
                                    return { value: result, done: false }
                                } else {
                                    return { done: true }
                                }
                            },
                            return() {
                                positions = [];
                                return { done: true }
                            },
                            throw(error) {
                                console.log(error);
                                return { value: undefined, done: true }
                            }
                        }
                    },
                    actions: [askForServingSize, displayCalories],
                }

                function askForServingSize(food) {
                    readline.question(`How many servings did you eat? `, servingSize => {
                        if (servingSize === 'nevermind' || servingSize === 'n') {
                            actionIt.return()
                        } else {
                            actionIt.next(servingSize, food)
                        }
                    })
                }

                async function displayCalories(servingSize, food) {
                    const calories = food.calories
                    console.log(`${food.name} with a serving size of ${servingSize} has a ${Number.parseFloat(
                        calories * parseInt(servingSize, 10)
                    ).toFixed()} calories.` ,
                    );
                    const  {data}  = await axios.get('http://localhost:3001/users/1')
                    /* note that in ^, the curly braces indicate a destructuring assignment .. it is a shorthand way of writing things
                    it basically means: const data = (WHATEVER RESPONSE FROM AXIOS).data */
                    const usersLog = data.log || []; //set it to empty array in case its undefined
                    const putBody = {
                        ...data,
                        log: [
                            ...usersLog,
                            {
                                [Date.now()]: {
                                    food: food.name,
                                    servingSize,
                                    calories: Number.parseFloat(
                                        calories*parseInt(servingSize*10),
                                    )
                                }
                            }
                        ]
                    }
                    await axios.put('http://localhost:3001/users/1', putBody, { // put users log info in db.json
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    })

                    actionIt.next()
                    readline.prompt()
                };


                readline.question(`What would you like to log today? `, async (item) => {
                    let position = it.next() // next function returns a value and a done property
                    while (!position.done) { // keep iterating until done is true
                        const food = position.value.name
                        if (food == item) { // if the entered name matches any item, then print it in console
                            console.log(`${item} has ${position.value.calories} calories. `);
                            actionIt = actionIterator[Symbol.iterator]();
                            actionIt.next(position.value)
                            //^ Logic --> askForServingSize() is run first, and then displayCalories()
                        }
                        position = it.next() // go to next item
                    }
                    readline.prompt() // get back to prompt
                })
            }
    }
})


