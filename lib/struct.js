"use strict";

var debug = require('debug')('file:struct');

module.exports = {};

/**
 * Write custom struct to file.
 */
function Write(file, position) {
	if (!(this instanceof Write))
		return new Write(file, position);

	this.file = file;
	this.position = position;

	this.queue = [];
}
module.exports.Write = Write;

Write.prototype.buffer = function(buffer) {
	this.queue.push((done) => {
		debug('buffer: %d bytes at %d', buffer.length, this.position);
		this.file.write(buffer, this.position, done);
	});
	return this;
};

Write.prototype.string = function(str) {
	this.queue.push((done) => {
		debug('string: %d bytes at %d', Buffer.byteLength(str), this.position);
		this.file.writeString(str, this.position, done);
	});
	return this;
};

Write.prototype.stringLenBE = function(str, len_size) {
	this.queue.push((done) => {
		debug('stringLenBE: %d bytes at %d', Buffer.byteLength(str) + len_size, this.position);
		this.file.writeStringLenBE(str, this.position, len_size, done);
	});
	return this;
};

Write.prototype.stringLenLE = function(str, len_size) {
	this.queue.push((done) => {
		debug('stringLenBE: %d bytes at %d', Buffer.byteLength(str) + len_size, this.position);
		this.file.writeStringLenLE(str, this.position, len_size, done);
	});
	return this;
};

Write.prototype.bufferLenBE = function(data, len_size) {
	this.queue.push((done) => {
		debug('bufferLenBE: %d bytes at %d', data.length + len_size, this.position);
		this.file.writeBufferLenBE(data, this.position, len_size, done);
	});
	return this;
};

Write.prototype.bufferLenLE = function(data, len_size) {
	this.queue.push((done) => {
		debug('bufferLenLE: %d bytes at %d', data.length + len_size, this.position);
		this.file.writeBufferLenLE(data, this.position, len_size, done);
	});
	return this;
};
Write.prototype.stringLen = Write.prototype.stringLenBE;

Write.prototype.uintBE = function(value, len) {
	this.queue.push((done) => {
		debug('uintBE: %d at %d', value, this.position);
		this.file.writeUIntBE(value, this.position, len, done);
	});
	return this;
};

Write.prototype.uintLE = function(value, len) {
	this.queue.push((done) => {
		debug('uintLE: %d at %d', value, this.position);
		this.file.writeUIntLE(value, this.position, len, done);
	});
	return this;
};

Write.prototype.intBE = function(value, len) {
	this.queue.push((done) => {
		debug('intBE: %d at %d', value, this.position);
		this.file.writeIntBE(value, this.position, len, done);
	});
	return this;
};

Write.prototype.intLE = function(value, len) {
	this.queue.push((done) => {
		debug('intLE: %d at %d', value, this.position);
		this.file.writeIntLE(value, this.position, len, done);
	});
	return this;
};

Write.prototype.write = function(cb) {
	var next = () => {
		var fn = this.queue.shift();

		if (!fn) return cb(null, this.position);

		fn((err, written) => {
			if (err) return cb(err);
			this.position += written;
			next();
		});
	};
	next();
};

/**
 * Read custom struct from file.
 */
function Read(file, position) {
	if (!(this instanceof Read))
		return new Read(file, position);

	this.file = file;
	this.position = position || 0;

	this.queue = [];
}
module.exports.Read = Read;

Read.prototype.buffer = function(name, len) {
	this.queue.push((done) => {
		debug("buffer '%s' %d bytes at %d", name, len, this.position);
		this.file.read(this.position, len, (err, data, bytesRead) => {
			done(err, name, data, bytesRead);
		});
	});
	return this;
};
Read.prototype.string = function(name, len) {
	this.queue.push((done) => {
		debug("string '%s' %d bytes at %d", name, len, this.position);
		this.file.readString(this.position, len, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.uintBE = function(name, len) {
	this.queue.push((done) => {
		debug("uintBE '%s' %d bytes at %d", name, len, this.position);
		this.file.readUIntBE(this.position, len, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.uintLE = function(name, len) {
	this.queue.push((done) => {
		debug("uintLE '%s' %d bytes at %d", name, len, this.position);
		this.file.readUIntLE(this.position, len, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.intBE = function(name, len) {
	this.queue.push((done) => {
		debug("intBE '%s' %d bytes at %d", name, len, this.position);
		this.file.readIntBE(this.position, len, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.intLE = function(name, len) {
	this.queue.push((done) => {
		debug("intLE '%s' %d bytes at %d", name, len, this.position);
		this.file.readIntLE(this.position, len, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.stringLenBE = function(name, len_size) {
	this.queue.push((done) => {
		debug("stringLenBE '%s' at %d", name, this.position);
		this.file.readStringLenBE(this.position, len_size, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};
Read.prototype.stringLenLE = function(name, len_size) {
	this.queue.push((done) => {
		debug("stringLenLE '%s' at %d", name, this.position);
		this.file.readStringLenLE(this.position, len_size, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};

Read.prototype.bufferLenBE = function(name, len_size) {
	this.queue.push((done) => {
		debug("bufferLenBE '%s' at %d", name, this.position);
		this.file.readBufferLenBE(this.position, len_size, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};

Read.prototype.bufferLenLE = function(name, len_size) {
	this.queue.push((done) => {
		debug("bufferLenLE '%s' at %d", name, this.position);
		this.file.readBufferLenLE(this.position, len_size, (err, value, bytesRead) => {
			done(err, name, value, bytesRead);
		});
	});
	return this;
};

Read.prototype.read = function(cb) {
	var result = {};

	var next = () => {
		var fn = this.queue.shift();

		if (!fn) return cb(null, result, this.position);

		debug('read position: %d', this.position);
		fn((err, name, value, bytesRead) => {
			if (err) return cb(err);

			this.position += bytesRead;
			result[name] = value;
			
			next();
		});
	};
	next();
};
