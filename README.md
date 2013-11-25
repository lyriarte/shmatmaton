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
'-' pops 2 arguments, arg1 and arg2, from the stack, and pushes the result instead.

  * '+' : a + b, push arg1 added to arg2.
  * '-' : a - b, push arg2 substracted from arg1.
  * '*' : a * b, push arg1 multiplied by arg2.
  * '/' : a / b, push arg1 divided by arg2.
  * '^' : a ^ b, push arg1 raised to the power of arg2.
  * 'peek' addr: push the content of the heap at address addr. push a NOP on null content.
  * 'poke' addr, value: put value in the heap at address addr.
  * 'jnz' arg, addr: jump to addr if arg is not numeric zero, or empty string.
  * 'dup' arg: duplicates arg on the stack.

Everything Shmatmaton deals with is an instruction, interpreting a base-type object just means
pushing it on the stack. Invalid instructions are replaced by a NOP at parse time.

