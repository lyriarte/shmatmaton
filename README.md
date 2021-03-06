Shmatmaton
==========

Shmatmaton - stack, heap, matrix, automaton - is a programming language.

This is an attempt at doing "breedable code", as in genetic algorithms.
Intermingling the lines of code of a pair of shmatmaton programs should 
produce another syntactically correct shmatmaton program - the behaviour
of the latter being anyone's guess.


Theory of operation
-------------------

Shmatmaton's syntax has no blocks of code, matching braces, or parentheses.
Expressions are written in Reverse Polish Notation, hence the *stack* . There's
also a storage *heap* in replacement of named variables. Base types include
numbers, strings, and *matrix*, because everybody loves matrix. Or maybe just me.
And I had this code already written anyway. Then to make up for the lack of code
blocks, there's the old assembly-style jump-nonzero, all with labels and line
numbers. And also a somewhat fancier version of it in the form of transitions,
letting a program be written as a finite-state *automaton*. Or not.


Runtime and execution
---------------------

The runtime is implemented in Javascript, not that it is a necessity or anything.
Objects, Arrays and Matrix are notated in JSON format, which makes it easier to 
read for everybody, man and machine alike. 

The policy regarding IOs and other interactions with the system is that any 
instruction that's not a language keyword is handled by the runtime as a function,
taking its parameters on the stack and pushing back the results if any.
In order to figure out if said line of code has actual meaning for the platform, the 
runtime executes it in a try/catch block when parsing the instruction, replaces it by
a NOP if useless. Interesting side effects may happen.


Instructions
------------

All instructions are executed on the stack, in reverse Polish order. That is, instruction
'-' pops arg2, pops arg1, and pushes arg1 - arg2.

### Arithmetic operations
  * + : [a, b, +] => push a + b
  * - : [a, b, -] => push a - b
  * * : [a, b, *] => push a * b
  * / : [a, b, /] => push a / b
  * ^ : [a, b, ^] => push a ^ b

### Stack instructions
  * nop [ ] => do nothing. on the stack, identity element for arithmetic operations
  * dup [arg, dup] => [arg, arg] duplicates arg on top of the stack.

### Heap instructions
  * peek [addr, peek] => push the content of the heap at address addr. push a nop on null content.
  * poke [value, addr, poke] => put value in the heap at address addr.
  * peetrix [lines, cols, addr, peetrix] => push a matrix with the contents of the heap from addresses addr to addr + lines * cols.
Push a nop if part of the range content is null or non numeric.
  * potrix [matrix, addr, potrix] => put matrix contents in the heap from addresses addr to addr + matrix lines * cols.

### Transition instructions
  * jnz [arg, addr, jnz] => jump to addr if arg is not numeric zero, or empty string.
  * jle [arg1, arg2, addr, jle] => jump to addr if arg1 is inferior or equal to arg2
  * trans [arg, {cond1: addr1, ...condN: addrN}] => jump to addrX if arg equals condX.

Everything Shmatmaton deals with is an instruction, interpreting a base-type object just means
pushing it on the stack. Invalid instructions are replaced by a nop at parse time.

