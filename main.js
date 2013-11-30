/******************************************************************************
 * Copyright (c) 2013 Luc Yriarte
 * Licensed under the MIT License
 * http://opensource.org/licenses/MIT
 *****************************************************************************/



/*****************************************************************************/

var shmatmaton = {
	version: '0.0.1',
	types: ['function', 'matrix', 'number', 'string'],
	heap: [],
	stack: [],
	code: [],
	ip: 0
};



/*****************************************************************************/

shmatmaton.matrixAddMatrix = function(m1, m2) {
	var result = new shmatmaton.Instruction();
	var value = m1.add(m2);
	if (value) {
		result.value = value;
		result.type = 'matrix';
	}
	return result;
}

shmatmaton.matrixMulMatrix = function(m1, m2) {
	var result = new shmatmaton.Instruction();
	var value = m1.mul(m2);
	if (value) {
		result.value = value;
		result.type = 'matrix';
	}
	return result;
}

shmatmaton.matrixAddNumber = function(m, n) {
	var result = new shmatmaton.Instruction();
	result.value = m.addNum(n);
	result.type = 'matrix';
	return result;
}

shmatmaton.matrixMulNumber = function(m, n) {
	var result = new shmatmaton.Instruction();
	result.value = m.mulNum(n);
	result.type = 'matrix';
	return result;
}

shmatmaton.matrixPowNumber = function(m, n) {
	var result = new shmatmaton.Instruction();
	if (n < 0) {
		var inv = m.inv();
		if (!inv)
			return result;
		m = inv;
		n = -n;
	}
	result.value = m;
	for (var i=1; i<n; i++)
		result.value = result.value.mul(m);
	result.type = 'matrix';
	return result;
}

shmatmaton.stringMulNumber = function(s, n) {
	var result = new shmatmaton.Instruction();
	result.value = "";
	for (var i=0; i<n; i++)
		result.value += s;
	result.type = 'string';
	return result;
}

shmatmaton.stringSubNumber = function(s, n) {
	var result = new shmatmaton.Instruction();
	result.value = "";
	var l = s.length - n;
	if (l > 0)
		result.value = s.substr(0, l);
	result.type = 'string';
	return result;
}

shmatmaton.stringDivNumber = function(s, n) {
	var result = new shmatmaton.Instruction();
	result.value = "";
	var l = s.length / n;
	if (l > 0)
		result.value = s.substr(0, l);
	result.type = 'string';
	return result;
}



/*****************************************************************************/


// Create an Instruction from a line of code 
shmatmaton.Instruction = function(str) {
	// Initialize with a nop
	this.guess(shmatmaton.Instruction.prototype.nop);
	if (!str)
		return this;
	// Try base types
	try {
		this.guess(JSON.parse(str));
	}
	catch (e) {
		// Try shmatmaton instructions
		var func = shmatmaton.instructions[str];
		if (func)
			this.guess(func);
		else {
			try {
				// Let the platform evaluate the string
				func = eval(str);
				// Check if the string evaluates as a function on the platform
				if (typeof(func) == 'function') {
					// Make it an instruction that will wrap the platform function
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


// Initialize an intruction by guessing its value
shmatmaton.Instruction.prototype.guess = function(arg) {
	if (arg != undefined)
		this.value = arg;
	this.type = typeof this.value;
	this.arity = undefined;
	// Interpret two dimensional arrays as matrix
	if (this.type == 'object') {
		if (this.value.length && this.value[0].length) {
			this.value = new Matrix(this.value.length, this.value[0].length, this.value);
			this.type = 'matrix';
		}
		else {
			this.type = 'function';
			this.transitions = this.value;
			this.value = shmatmaton.Instruction.prototype.trans;
		}
	}
	// Interpret un-registered types as nop
	if (shmatmaton.types.indexOf(this.type) == -1) {
		this.type = 'function';
		this.value = shmatmaton.Instruction.prototype.nop;
	}
	if (this.type == 'function')
		this.arity = this.value.length;
	return this;
};


shmatmaton.Instruction.prototype.nop = function() {
	return;
};


shmatmaton.Instruction.prototype.isNop = function() {
	return this.value == shmatmaton.Instruction.prototype.nop;
};


// Wrap a platform function execution
shmatmaton.Instruction.prototype.funcWrap = function() {
	// Build arg strings
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
	return result.guess();
};


shmatmaton.Instruction.prototype.add = function(arg1, arg2) {
	// nop is the identity element
	if (arg1.isNop()) return arg2;
	if (arg2.isNop()) return arg1;
	// on invalid arguments return nop
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number') { 
		if (arg2.type == 'number' || arg2.type == 'string')
			return result.guess(arg1.value + arg2.value);
		if (arg2.type == 'matrix')
			return shmatmaton.matrixAddNumber(arg2.value, arg1.value);
		return result;
	}
	if (arg1.type == 'string' && (arg2.type == 'number' || arg2.type == 'string'))
		return result.guess(arg1.value + arg2.value);
	if (arg1.type == 'matrix') { 
		if (arg2.type == 'matrix')
			return shmatmaton.matrixAddMatrix(arg1.value, arg2.value);
		if (arg2.type == 'number')
			return shmatmaton.matrixAddNumber(arg1.value, arg2.value);
		return result;
	}
	return result;
};


shmatmaton.Instruction.prototype.sub = function(arg1, arg2) {
	// nop is the identity element
	if (arg1.isNop()) return arg2;
	if (arg2.isNop()) return arg1;
	// on invalid arguments return nop
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number' && arg2.type == 'number')
		return result.guess(arg1.value - arg2.value);
	if (arg1.type == 'string' && arg2.type == 'number')
		return shmatmaton.stringSubNumber(arg1.value, arg2.value);
	if (arg1.type == 'matrix') { 
		if (arg2.type == 'matrix')
			return shmatmaton.matrixAddMatrix(arg1.value, arg2.value.mulNum(-1));
		if (arg2.type == 'number')
			return shmatmaton.matrixAddNumber(arg1.value, -arg2.value);
		return result;
	}
	return result;
};


shmatmaton.Instruction.prototype.mul = function(arg1, arg2) {
	// nop is the identity element
	if (arg1.isNop()) return arg2;
	if (arg2.isNop()) return arg1;
	// on invalid arguments return nop
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number') { 
		if (arg2.type == 'number')
			return result.guess(arg1.value * arg2.value);
		if (arg2.type == 'string')
			return shmatmaton.stringMulNumber(arg2.value, arg1.value);
		if (arg2.type == 'matrix')
			return shmatmaton.matrixMulNumber(arg2.value, arg1.value);
		return result;
	}
	if (arg1.type == 'string' && arg2.type == 'number')
		return shmatmaton.stringMulNumber(arg1.value, arg2.value);
	if (arg1.type == 'matrix') { 
		if (arg2.type == 'matrix')
			return shmatmaton.matrixMulMatrix(arg1.value, arg2.value);
		if (arg2.type == 'number')
			return shmatmaton.matrixMulNumber(arg1.value, arg2.value);
		return result;
	}
	return result;
};


shmatmaton.Instruction.prototype.div = function(arg1, arg2) {
	// nop is the identity element
	if (arg1.isNop()) return arg2;
	if (arg2.isNop()) return arg1;
	// on invalid arguments return nop
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number') {
		if (arg2.type == 'number' && arg2.value != 0)
			return result.guess(arg1.value / arg2.value);
		if (arg2.type == 'matrix') {
			result = shmatmaton.matrixPowNumber(arg2.value, -1);
			if (arg1.value != 1 && result.type == 'matrix')
				result.value = result.value.mulNum(arg1.value);
		}
		return result;
	}
	if (arg1.type == 'string' && arg2.type == 'number' && arg2.value != 0)
		return shmatmaton.stringDivNumber(arg1.value, arg2.value);
	if (arg1.type == 'matrix') { 
		if (arg2.type == 'matrix') {
			var inv = arg2.value.inv();
			if (!inv)
				return result;
			return shmatmaton.matrixMulMatrix(arg1.value, inv);
		}
		if (arg2.type == 'number' && arg2.value != 0)
			return shmatmaton.matrixAddNumber(arg1.value, 1/arg2.value);
		return result;
	}
	return result;
};


shmatmaton.Instruction.prototype.pow = function(arg1, arg2) {
	// nop is the identity element
	if (arg1.isNop()) return arg2;
	if (arg2.isNop()) return arg1;
	// on invalid arguments return nop
	var result = new shmatmaton.Instruction();
	if (arg1.type == 'number' && arg2.type == 'number')
		return result.guess(Math.pow(arg1.value,arg2.value));
	if (arg1.type == 'matrix' && arg2.type == 'number')
		return shmatmaton.matrixPowNumber(arg1.value, arg2.value);
	return result;
};


shmatmaton.Instruction.prototype.peek = function(addr) {
	if (addr.type != 'number' || !shmatmaton.heap[addr.value])
		return new shmatmaton.Instruction();
	return shmatmaton.heap[addr.value];
};


shmatmaton.Instruction.prototype.poke = function(value, addr) {
	if (addr.type != 'number')
		return;
	shmatmaton.heap[addr.value] = value;
};


shmatmaton.Instruction.prototype.jnz = function(arg, addr) {
	if (addr.type != 'number' || !shmatmaton.code[addr.value])
		return;
	if (['number','string'].indexOf(arg.type) != -1 && !arg.value)
		return;
	shmatmaton.ip = addr.value;
};


shmatmaton.Instruction.prototype.dup = function(arg) {
	shmatmaton.stack.push(arg);
	return arg;
};


shmatmaton.Instruction.prototype.trans = function(arg) {
	for (var t in this.transitions) {
		if (arg.value == t) {
			shmatmaton.ip = this.transitions[t];
			break;
		}
	}
};



/*****************************************************************************/

shmatmaton.instructions = {
	'nop': shmatmaton.Instruction.prototype.nop,
	'+': shmatmaton.Instruction.prototype.add,
	'-': shmatmaton.Instruction.prototype.sub,
	'*': shmatmaton.Instruction.prototype.mul,
	'/': shmatmaton.Instruction.prototype.div,
	'^': shmatmaton.Instruction.prototype.pow,
	'peek': shmatmaton.Instruction.prototype.peek,
	'poke': shmatmaton.Instruction.prototype.poke,
	'jnz': shmatmaton.Instruction.prototype.jnz,
	'dup': shmatmaton.Instruction.prototype.dup,
	'trans': shmatmaton.Instruction.prototype.trans,
};



/*****************************************************************************/

shmatmaton.parse = function(instructions) {
	shmatmaton.ip = 0;
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
	// Get current instruction and increment instruction pointer
	var inst = shmatmaton.code[shmatmaton.ip++];
	if (!inst)
		return -1;
	switch (inst.type) {
		// execute functions. may affect instruction pointer
		case 'function': 
			// pop arguments according function arity, last argument is top of the stack
			var args = [];
			for (var i=0; i<inst.arity; i++)
				args.unshift(shmatmaton.stack.length ? shmatmaton.stack.pop() : new shmatmaton.Instruction());
			// attach arguments to instruction object for platform function wrappers
			inst.args = args;
			var result = inst.value.apply(inst, args);
			// push result if any
			if (result)
				shmatmaton.stack.push(result);
			break;
		// just push base types
		default:
			shmatmaton.stack.push(inst);
	}
	if (shmatmaton.log) {
		shmatmaton.log("stack: " + JSON.stringify(shmatmaton.stack));
		shmatmaton.log("heap: " + JSON.stringify(shmatmaton.heap));
	}
	// Return next instruction pointer
	return shmatmaton.ip;
};



/*****************************************************************************/

