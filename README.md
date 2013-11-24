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
blocks, there's the return of the mean old goto, all with labels and line
numbers. There's also a somewhat fancier version of it in the form of transitions,
letting a program be written as a finite-state *automaton*. Or not.


Runtime and execution
---------------------

The runtime is implemented in Javascript, not that it is a necessity or anything.
Objects, Arrays and Matrix are notated in JSON format, which makes it easier to read
for everybody, man and machine alike. The policy regarding ios and other interactions
with the system is that any instruction that's not a language keyword is handled by
the runtime as a function, taking its parameters on the stack and pushing back the
results if any.
