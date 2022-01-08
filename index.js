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
->  Iterators: Iterator are objects which uses next() method to get next value of sequence. 
    Generators: A generator is a function that produces or yields a sequence of values using yield method.
-> The yield keyword pauses generator function execution and the value of the expression following the yield keyword is returned to the generator's caller. 
   It can be thought of as a generator-based version of the return keyword. yield can only be called directly from the generator function that contains it.
-> in custom iterators, we have to manually implement throw and error methods .. but generators already have those
   */

// code starts here
const axios = require('axios')
const CAF = require('caf')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'enter command > '
});

readline.prompt() // prompt the user for input
readline.on('line', async line => { // add an event listener to user's prompt
    switch (line.trim()) {
        case 'vegan':
            {   // 
                const { data } = await axios.get(`http://localhost:3001/food`);
                function* listVeganFoods() { //a generator function
                    try {
                        let idx = 0;
                        const veganOnly = data.filter(food => food.dietary_preferences.includes('vegan')
                        );
                        while (veganOnly[idx]) {
                            yield veganOnly[idx]
                            idx++;
                        }
                    } catch (error) {
                        console.log({ error })
                    }

                }
                for (let val of listVeganFoods()) { //for..of loop uses iterator, so we dont have to use next commands manually
                    console.log(val.name)  //the whole list of vegan foods is printed in this for..of loop
                }
                readline.prompt()
            }
            break;
        case 'log':
            {   // implementing built-in iterable here
                const { data } = await axios.get(`http://localhost:3001/food`)
                const it = data[Symbol.iterator](); //data is an object having function Symbol.iterator() .. read in mind like: data.(Symbol.iterator)() 
                let actionIt; // to be defined later for actionIterator

                function* actionGenerator() { //a generator function
                    try {
                        const food = yield; //first next statement will bring the cursor here but it will be paused here
                        const servingSize = yield askForServingSize();//2nd next statement will bring the cursor here but it will be paused here .. askforServingSize() will execute but value will not be assigned to const servingSize until another next command
                        yield displayCalories(servingSize, food)
                    } catch (error) {
                        console.log({ error })
                    }
                    // const food = yield; //first next statement will bring the cursor here but it will be paused here
                    // const servingSize = yield askForServingSize();//2nd next statement will bring the cursor here but it will be paused here .. askforServingSize() will execute but value will not be assigned to const servingSize until another next command
                    // yield displayCalories(servingSize, food)//3rd next here and paused
                }                                           //4th next will bring the cursor here and we'll leave the function .. 

                function askForServingSize() {
                    readline.question(`How many servings did you eat? `, servingSize => {
                        if (servingSize === 'nevermind' || servingSize === 'n') {
                            actionIt.return()
                            readline.prompt()
                        } else if (typeof Number(servingSize) !== 'number' || Number(servingSize) === NaN) {
                            actionIt.throw('Please only numbers can be entered') // throw an exception
                        } else {
                            actionIt.next(servingSize)
                        }
                    })
                }

                async function displayCalories(servingSize, food) {
                    const calories = food.calories
                    console.log(`${food.name} with a serving size of ${servingSize} has a ${Number.parseFloat(
                        calories * parseInt(servingSize, 10)
                    ).toFixed()} calories.` ,
                    );
                    const { data } = await axios.get('http://localhost:3001/users/1')
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
                                        calories * parseInt(servingSize * 10),
                                    )
                                }
                            }
                        ]
                    }
                    // await axios.put('http://localhost:3001/users/1', putBody, { // put users log info in db.json
                    //     headers: {
                    //         'Content-Type': 'application/json'
                    //     }
                    // })

                    actionIt.next()
                    readline.prompt()
                };


                readline.question(`What would you like to log today? `, async (item) => {
                    let position = it.next() // next function returns a value and a done property
                    while (!position.done) { // keep iterating until done is true
                        const food = position.value.name
                        if (food == item) { // if the entered name matches any item, then print it in console
                            console.log(`${item} has ${position.value.calories} calories. `);
                            actionIt = actionGenerator();
                            actionIt.next(); //it will just start the iterator
                            actionIt.next(position.value) //it will assign value to food : const food = yield;   // and will move to next statement
                        }
                        position = it.next() // go to next item
                    }
                    readline.prompt() // get back to prompt
                })
            };
            break;
        case `today`: // print today's log
            {
                let email; //define email
                readline.question('Email:', async emailAddress => { // enter email address
                    const { data } = await axios.get(
                        `http://localhost:3001/users?email=${emailAddress}`); //query the data for email address
                    const foodLog = data[0].log || []; //foodLog is an array containing objects
                    let totalCalories = 0;

                    function* getFoodLog() {
                        try {
                            yield* foodLog; //yield delegation to foodLog array
                        } catch (error) {
                            console.log({ error })
                        }
                    }
                    const logIterator = getFoodLog() //create an iterator of getFoodLog generator

                    for (const entry of logIterator) { //for (const entry of foodLog) --> it will also serve the same purpose .. but we had to understand yield delegation that's why ...
                        const timeStamp = Object.keys(entry)[0] //The Object.keys() method returns an array of a given object's own enumerable property names
                        // console.log('1', entry)     //{ '1572791640182': { food: 'apple', servingSize: '2', calories: 176 } }
                        // console.log('2 ',Object.keys(entry)) //[ '1572791640182' ]
                        // console.log('3 ', Object.keys(entry)[0]) //1572791640182
                        if (isToday(new Date(Number(timeStamp)))) { // checks if the timeStamp equals today
                            console.log(
                                `${entry[timeStamp].food}, ${entry[timeStamp].servingSize} serving(s), ${entry[timeStamp].calories} calories`
                            )
                            totalCalories += entry[timeStamp].calories
                            if (totalCalories > 7000) {
                                console.log('calories above 7000')
                                logIterator.return() // the generator will not log any more food items to the screen
                            }
                        }
                    }
                    console.log('---------------');
                    console.log(`Total Calories: ${totalCalories}`)
                    readline.prompt()
                })
            };
            break;
        default: {
            // any other input by user and we'' get into this portion that helps understand the Cancellable Async Flows
            //CAF makes generator functions work like async functions . Gives the ability to externally cancel an async request
            // Note: revisit this CAF part later if needed for better understanding

            const token = new CAF.timeout(300, "this is taking too long")  //this token is later passed as a signal to fetchData
            // logic: if the below function takes longer than 300ms, then cancel everything which uses CAF .. that means not only cancel the fetchCAF call, but also the delay
            const fetchCAF = CAF(function* fetchData(signal) { //CAF is a wrapper for function* generators that treats them like async functions, but with support for external cancellation via tokens.
                yield CAF.delay(signal, 200);
                const promise = yield axios.get('http://localhost:3001/food');
                return promise;
            })

            fetchCAF(token) //token for external cancellation
                .then(response => {
                    console.log(response.data[0])
                    readline.prompt()
                }).catch(error => {
                    console.log(error)
                    readline.prompt()
                })                

            // async function* fetchData() {
            //     const promise = await axios.get('http://localhost:3001/users');
            //     return promise
            // }
            // const it = fetchData()
            // it.next().value.then(response => {
            //     console.log(response.data[0].firstname)
            //     readline.prompt() //return to prompt
            // })
        }
            break;
    }
    // readline.prompt()
});

function isToday(timeStamp) { // checks if the timeStamp equals today
    const today = new Date();
    return ( // return true if all three conditions match
        timeStamp.getDate() === today.getDate() &&
        timeStamp.getMonth() === today.getMonth() &&
        timeStamp.getFullYear() === today.getFullYear()
    )
}



