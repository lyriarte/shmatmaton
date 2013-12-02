/******************************************************************************
 * Copyright (c) 2013 Luc Yriarte
 * Licensed under the MIT License
 * http://opensource.org/licenses/MIT
 *****************************************************************************/



/*****************************************************************************/

var shmatmaton = require('../shmatmaton/shmatmaton.js').shmatmaton;
console.log("shmatmaton.version:" + shmatmaton.version);

shmatmaton.log = console.log;

/*****************************************************************************/

console.log("---- ---- parsing source code ---- ----");

shmatmaton.parse([
"[[1,2,4],[2,2,0],[3,0,4]]",
"0",
"poke",
"3",
"@loop",
"1",
"-",
"",
"dup",
"\"loop\"",
"jnz",
"",
"1",
"0",
"peek",
"/",
"0",
"peek",
"*"
]);

/*****************************************************************************/

console.log("---- ---- executing instructions ---- ----");

while (shmatmaton.step() != -1);

/*****************************************************************************/

console.log("---- ---- program exited normally ---- ----");



