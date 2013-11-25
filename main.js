/******************************************************************************
 * Copyright (c) 2013 Luc Yriarte
 * Licensed under the MIT License
 * http://opensource.org/licenses/MIT
 *****************************************************************************/



/*****************************************************************************/

var shmatmaton = {
	version: '0.0.1',
	types: ['number', 'string', 'function', 'matrix'],
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
		var func = shmatmaton.instructions[str];
		if (func)
			this.guess(func);
		else {
			try {
				func = eval(str);
				if (typeof(func) == 'function') {
					this.guess(shmatmaton.Instruction.prototype.funcWrap);
					this.arity = func.length;
					this.funcHandle = func;
					this.funcName = str;
				}
			}
			catch (ee) {
				if (shmatmaton.log)
					shmatmaton.log(ee);
			};
		}
	}
	return this;
};


shmatmaton.Instruction.prototype.guess = function(arg) {
	if (arg != undefined)
		this.value = arg;
	this.type = typeof this.value;
	this.arity = undefined;
	if (this.type == 'object' && this.value.length && this.value[0].length) {
		this.value = new Matrix(this.value.length, this.value[0].length, this.value);
		this.type = 'matrix';
	}
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


shmatmaton.Instruction.prototype.funcWrap = function() {
	var argStr = this.args.length ? JSON.stringify(this.args[0].value) : "";
	for (i=1; i<this.args.length; i++)
		argStr += "," + JSON.stringify(this.args[i].value);
	var result = new shmatmaton.Instruction();
	try {
		result.value = eval(this.funcName + "(" + argStr + ")" );
	}
	catch (e) {
		if (shmatmaton.log)
			shmatmaton.log(e);
		return;
	}
	if (typeof(result.value) == 'undefined')
		return;
	result.guess();
	return result;
};


shmatmaton.Instruction.prototype.add = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'matrix' && arg2.type == 'matrix') {
		result.value = arg1.value.add(arg2.value);
		result.type = 'matrix';
		return result;
	}
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
	if (arg1.type == 'matrix' && arg2.type == 'matrix') {
		result.value = arg1.value.mul(arg2.value);
		result.type = 'matrix';
		return result;
	}
	if (arg1.type == 'number' && arg2.type == 'matrix') {
		result.value = arg2.value.mulNum(arg1.value);
		result.type = 'matrix';
		return result;
	}
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(arg1.value * arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.div = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number' && arg2.type == 'matrix'
		&& arg1.value == 1) {
		result.value = arg2.value.inv();
		result.type = 'matrix';
		return result;
	}
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(arg1.value / arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.pow = function(arg1, arg2) {
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'matrix' && arg2.type == 'number'
		&& arg1.value == -1) {
		result.value = arg1.value.inv();
		result.type = 'matrix';
		return result;
	}
	if (arg1.type != 'number' || arg2.type != 'number')
		return result;
	result.guess(Math.pow(arg1.value,arg2.value));
	return result;
};


shmatmaton.Instruction.prototype.peek = function(addr) {
	if (addr.type != 'number' || shmatmaton.heap[addr.value] == undefined)
		return new shmatmaton.Instruction();
	return shmatmaton.heap[addr.value];
};


shmatmaton.Instruction.prototype.poke = function(addr, value) {
	if (addr.type != 'number')
		return;
	shmatmaton.heap[addr.value] = value;
};


shmatmaton.Instruction.prototype.jnz = function(arg, addr) {
	if (addr.type != 'number' || shmatmaton.code[addr.value] == undefined)
		return;
	if (['number','string'].indexOf(arg.type) != -1 && !arg.value)
		return;
	shmatmaton.ip = addr.value;
};


shmatmaton.Instruction.prototype.dup = function(arg) {
	shmatmaton.stack.push(arg);
	return arg;
};



/*****************************************************************************/

shmatmaton.instructions = {
	'+': shmatmaton.Instruction.prototype.add,
	'-': shmatmaton.Instruction.prototype.sub,
	'*': shmatmaton.Instruction.prototype.mul,
	'/': shmatmaton.Instruction.prototype.div,
	'^': shmatmaton.Instruction.prototype.pow,
	'peek': shmatmaton.Instruction.prototype.peek,
	'poke': shmatmaton.Instruction.prototype.poke,
	'jnz': shmatmaton.Instruction.prototype.jnz,
	'dup': shmatmaton.Instruction.prototype.dup
};



/*****************************************************************************/

shmatmaton.parse = function(instructions) {
	shmatmaton.code = new Array(instructions.length);
	for (var i=0; i<instructions.length; i++) {
		shmatmaton.code[i] = new shmatmaton.Instruction(instructions[i]);
		if (shmatmaton.log)
			shmatmaton.log(i + ": " + instructions[i] + " => " + JSON.stringify(shmatmaton.code[i]));
	}
};


shmatmaton.reset = function() {
	shmatmaton.heap = [];
	shmatmaton.stack = [];
	shmatmaton.ip = 0;
};


shmatmaton.step = function() {
	if (shmatmaton.log)
		shmatmaton.log("===> ip: " + shmatmaton.ip);
	var inst = shmatmaton.code[shmatmaton.ip++];
	if (inst == undefined)
		return;
	switch (inst.type) {
		case 'function': 
			var args = [];
			for (var i=0; i<inst.arity; i++)
				args.unshift(shmatmaton.stack.pop());
			inst.args = args;
			var result = inst.value.apply(inst, args);
			if (result)
				shmatmaton.stack.push(result);
			break;
		default:
			shmatmaton.stack.push(inst);
	}
	if (shmatmaton.log) {
		shmatmaton.log("stack: " + JSON.stringify(shmatmaton.stack));
		shmatmaton.log("heap: " + JSON.stringify(shmatmaton.heap));
	}
};



/*****************************************************************************/

