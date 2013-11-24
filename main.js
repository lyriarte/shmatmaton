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
		case 'peek':
			this.guess(shmatmaton.Instruction.prototype.peek);
			break;
		case 'poke':
			this.guess(shmatmaton.Instruction.prototype.poke);
			break;
		default:
			try {
				var func = eval(str);
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
	if (shmatmaton.log)
		shmatmaton.log(str + " => " + JSON.stringify(this));
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
			inst.args = args;
			var result = inst.value.apply(inst, args);
			if (result)
				shmatmaton.stack.push(result);
			break;
		default:
			shmatmaton.stack.push(inst);
	}
	if (shmatmaton.log) {
		shmatmaton.log("===> ip: " + shmatmaton.ip);
		shmatmaton.log("stack: " + JSON.stringify(shmatmaton.stack));
		shmatmaton.log("heap: " + JSON.stringify(shmatmaton.heap));
	}
	shmatmaton.ip++;
};



/*****************************************************************************/

