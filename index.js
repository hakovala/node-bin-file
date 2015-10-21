"use strict";

var fs = require('fs');
var path = require('path');

function File(filepath) {
	if (!(this instanceof File))
		return new File(filepath);

	this.filepath = filepath;

	this.fd = null;
	this._flags = undefined;
	this._mode = undefined;
}
module.exports = File;

function makeCallback(args, context) {
	var callback = args[args.length - 1];

	return function(err) {
		if (err) throw err;
		if (typeof callback == 'function') {
			callback.apply(context, arguments);
		}
	}
}

File.open = function(filepath, flags, mode, cb) {
	var file = new File(filepath);

	cb = makeCallback(arguments, file);
	if (typeof mode === 'function')
		mode = undefined;
	if (typeof flags === 'function')
		flags = undefined;

	file.open(flags, mode, cb);
	return file;
};

File.prototype.open = function(flags, mode, cb) {
	cb = makeCallback(arguments, this);
	if (typeof mode === 'function')
		mode = undefined;
	if (typeof flags === 'function')
		flags = undefined;
	
	flags = flags || this._flags || 'r+';
	mode = mode || this._mode;

	fs.open(this.filepath, flags, mode, (err, fd) => {
		if (err) return cb(err);

		this.fd = fd;
		this._flags = flags;
		this._mode = mode;
		cb(null, this);
	});
};

File.prototype.close = function(cb) {
	cb = makeCallback(arguments, this);
	if (this.fd) {
		fs.close(this.fd, cb);
	}
};

File.prototype.isOpen = function() {
	return !!this.fd;
};

File.prototype.sync = function(cb) {
	cb = makeCallback(arguments, this);
	fs.fsync(this.fd, cb);
};

File.prototype.stat = function(cb) {
	cb = makeCallback(arguments, this);
	fs.fstat(this.fd, cb);
};

File.prototype.utimes = function(atime, mtime, cb) {
	cb = makeCallback(arguments, this);
	fs.futimes(this.fd, atime, mtime, cb);
};

File.prototype.truncate = function(len, cb) {
	cb = makeCallback(arguments, this);
	fs.ftruncate(this.fd, len, cb);
};

File.prototype.rename = function(dest, cb) {
	cb = makeCallback(arguments, this);

	this.close();
	fs.rename(this.filepath, dest, (err) => {
		if (err) return cb(err);

		this.filepath = dest;
		this.open(cb);
	})
};

File.prototype.read = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	var buffer = new Buffer(len);
	fs.read(this.fd, buffer, 0, len, pos, cb);
};

File.prototype.readString = function(pos, len, cb) {
	cb = makeCallback(arguments, this);
	this.read(pos, len, (err, bytesRead, data) => {
		if (err) return cb(err);
		cb(null, data.toString());
	});
};

File.prototype.readUIntBE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);
	this.read(pos, len, (err, bytesRead, data) => {
		if (err) return cb(err);
		var value = data.readUIntBE(0, len);
		cb(null, value);
	});
};
File.prototype.readUIntLE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);
	this.read(pos, len, (err, bytesRead, data) => {
		if (err) return cb(err);
		var value = data.readUIntLE(0, len);
		cb(null, value);
	});
};
File.prototype.readIntBE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);
	this.read(pos, len, (err, bytesRead, data) => {
		if (err) return cb(err);
		var value = data.readIntBE(0, len);
		cb(null, value);
	});
};
File.prototype.readIntLE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);
	this.read(pos, len, (err, bytesRead, data) => {
		if (err) return cb(err);
		var value = data.readIntLE(0, len);
		cb(null, value);
	});
};


File.prototype.write = function(data, pos, cb) {
	cb = makeCallback(arguments, this);
	console.log('writing: ' + data);
	fs.write(this.fd, data, 0, data.length, pos, cb);
};

File.prototype.writeString = function(str, pos, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(str);
	this.write(buffer, pos, cb);
};

File.prototype.writeUIntBE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeUIntBE(value, 0, len);
	this.write(buffer, pos, cb);
};

File.prototype.writeUIntLE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeUIntLE(value, 0, len);
	this.write(buffer, pos, cb);
};

File.prototype.writeIntBE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeIntBE(value, 0, len);
	this.write(buffer, pos, cb);
};

File.prototype.writeIntLE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeIntLE(value, 0, len);
	this.write(buffer, pos, cb);
};


