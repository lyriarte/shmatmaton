/******************************************************************************
 * Copyright (c) 2013 Luc Yriarte
 * Licensed under the MIT License
 * http://opensource.org/licenses/MIT
 *****************************************************************************/



/*****************************************************************************/

var shmatmaton = {
	version: '0.0.1',
	types: ['number', 'string', 'function'],
	heap: [],
	stack: [],
	code: [],
	ip: -1
};



/*****************************************************************************/

shmatmaton.Instruction = function(str) {
	this.guess(shmatmaton.Instruction.prototype.nop);
	if (!str)
		return this;
	try {
		this.guess(JSON.parse(str));
	}
	catch (e) {
		switch (str) {
		case '+':
			this.guess(shmatmaton.Instruction.prototype.add);
			break;
		case '-':
			this.guess(shmatmaton.Instruction.prototype.sub);
			break;
		case '*':
			this.guess(shmatmaton.Instruction.prototype.mul);
			break;
		case '/':
			this.guess(shmatmaton.Instruction.prototype.div);
			break;
		case '^':
			this.guess(shmatmaton.Instruction.prototype.pow);
			break;
		}
	}
	return this;
};


shmatmaton.Instruction.prototype.guess = function(arg) {
	if (arg != undefined)
		this.value = arg;
	this.type = typeof this.value;
	this.arity = undefined;
	if (shmatmaton.types.indexOf(this.type) == -1) {
		this.type = 'number';
		this.value = this.value ? 1 : 0;
		return 1;
	}
	if (this.type == 'function')
		this.arity = this.value.length;
	return 0;
};


shmatmaton.Instruction.prototype.nop = function() {
	return;
};


shmatmaton.Instruction.prototype.add = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (['number','string'].indexOf(arg1.type) == -1
		|| ['number','string'].indexOf(arg2.type) == -1)
		return result;
	result.guess(arg1.value + arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.sub = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(arg1.value - arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.mul = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(arg1.value * arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.div = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(arg1.value / arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.pow = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(Math.pow(arg1.value,arg2.value));
	return result;
};



/*****************************************************************************/


shmatmaton.parse = function(instructions) {
	shmatmaton.code = new Array(instructions.length);
	for (var i=0; i<instructions.length; i++) {
		shmatmaton.code[i] = new shmatmaton.Instruction(instructions[i]);
	}
};


shmatmaton.reset = function() {
	shmatmaton.heap = [];
	shmatmaton.stack = [];
	shmatmaton.ip = 0;
};


shmatmaton.step = function() {
	var inst = shmatmaton.code[shmatmaton.ip];
	switch (inst.type) {
		case 'function': 
			var args = [];
			for (var i=0; i<inst.arity; i++)
				args.unshift(shmatmaton.stack.pop());
			var result = inst.value.apply(window, args);
			if (result)
				shmatmaton.stack.push(result);
			break;
		default:
			shmatmaton.stack.push(inst);
	}
	shmatmaton.ip++;
};



/*****************************************************************************/

