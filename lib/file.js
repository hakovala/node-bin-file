"use strict";

var fs = require('fs');
var path = require('path');
var debug = require('debug')('file:file');

var Struct = require('./struct');

/**
 * File representing a binary file.
 * @param {string} filepath File path
 */
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

/**
 * Open file asynchronously
 * @param  {string}   filepath File path to open
 * @param  {}   flags    Open flags
 * @param  {}   mode     File mode if file is created
 * @param  {Function} cb Callback is called when file is open with arguments (err, file)
 * @return {File}            File object
 */
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

/**
 * Open file asyncrhonously.
 */
File.prototype.open = function(flags, mode, cb) {
	cb = makeCallback(arguments, this);
	if (typeof mode === 'function')
		mode = undefined;
	if (typeof flags === 'function')
		flags = undefined;

	flags = flags || this._flags || 'r+';
	mode = mode || this._mode;

	debug('open: %s (%s)', this.filepath, flags);

	fs.open(this.filepath, flags, mode, (err, fd) => {
		if (err) return cb(err);

		this.fd = fd;
		this._flags = flags;
		this._mode = mode;

		cb(null, this);
	});
};

/**
 * Close file asyncrhonously.
 */
File.prototype.close = function(cb) {
	cb = makeCallback(arguments, this);
	if (this.fd) {
		fs.close(this.fd, cb);
	}
};

/**
 * Check if file is open.
 */
File.prototype.isOpen = function() {
	return !!this.fd;
};

/**
 * Sync file writes asynchronously.
 */
File.prototype.sync = function(cb) {
	cb = makeCallback(arguments, this);
	fs.fsync(this.fd, cb);
};

/**
 * Get file stats.
 */
File.prototype.stat = function(cb) {
	cb = makeCallback(arguments, this);
	fs.fstat(this.fd, cb);
};

/**
 * Set atime and utime.
 */
File.prototype.utimes = function(atime, mtime, cb) {
	cb = makeCallback(arguments, this);
	fs.futimes(this.fd, atime, mtime, cb);
};

/**
 * Truncate file size.
 */
File.prototype.truncate = function(len, cb) {
	cb = makeCallback(arguments, this);
	fs.ftruncate(this.fd, len, cb);
};

/**
 * Rename file.
 *
 * File objects filepath is changed if successful.
 */
File.prototype.rename = function(dest, cb) {
	cb = makeCallback(arguments, this);

	this.close();
	fs.rename(this.filepath, dest, (err) => {
		if (err) return cb(err);

		this.filepath = dest;
		this.open(cb);
	})
};

//
// Read methods
//

/**
 * Read buffer from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.read = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read: %d bytes at %d', len, pos);
	var buffer = new Buffer(len);
	fs.read(this.fd, buffer, 0, len, pos, (err, bytesRead, data) => {
		cb(err, data, bytesRead);
	});
};

/**
 * Read string from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readString = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read string: %d bytes at %d', len, pos);
	this.read(pos, len, (err, data, bytesRead) => {
		if (err) return cb(err);
		cb(null, data.toString(), bytesRead);
	});
};

/**
 * Read big-endian uint from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readUIntBE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read uintBE: %d bytes at %d', len, pos);
	this.read(pos, len, (err, data, bytesRead) => {
		if (err) return cb(err);
		var value = data.readUIntBE(0, len);
		cb(null, value, bytesRead);
	});
};

/**
 * Read little-endian uint from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readUIntLE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read uintLE: %d bytes at %d', len, pos);
	this.read(pos, len, (err, data, bytesRead) => {
		if (err) return cb(err);
		var value = data.readUIntLE(0, len);
		cb(null, value, bytesRead);
	});
};

/**
 * Read big-endian int from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readIntBE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read intBE: %d bytes at %d', len, pos);
	this.read(pos, len, (err, data, bytesRead) => {
		if (err) return cb(err);
		var value = data.readIntBE(0, len);
		cb(null, value, bytesRead);
	});
};

/**
 * Read little-endian int from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Bytes to read
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readIntLE = function(pos, len, cb) {
	cb = makeCallback(arguments, this);

	debug('read intLE: %d bytes at %d', len, pos);
	this.read(pos, len, (err, data, bytesRead) => {
		if (err) return cb(err);
		var value = data.readIntLE(0, len);
		cb(null, value, bytesRead);
	});
};

/**
 * Read big-endian length prefixed string from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Size of the length field
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readStringLenBE = function(pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	debug('read string with len prefix %d bytes at %d', len_size, pos);
	this.readUIntBE(pos, len_size, (err, len, lenBytesRead) => {
		if (err) return cb(err);

		this.readString(pos + lenBytesRead, len, (err, str, strBytesRead) => {
			cb(err, str, lenBytesRead + strBytesRead);
		});
	});
};

/**
 * Read little-endian length prefixed string from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Size of the length field
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readStringLenLE = function(pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	debug('read string with len prefix %d bytes at %d', len_size, pos);
	this.readUIntLE(pos, len_size, (err, len, lenBytesRead) => {
		if (err) return cb(err);

		this.readString(pos + lenBytesRead, len, (err, str, strBytesRead) => {
			cb(err, str, lenBytesRead + strBytesRead);
		});
	});
};

/**
 * Read big-endian length prefixed buffer from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Size of the length field
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readBufferLenBE = function(pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	debug('read buffer with len prefix %d bytes at %d', len_size, pos);
	this.readUIntBE(pos, len_size, (err, len, lenBytesRead) => {
		if (err) return cb(err);

		this.read(pos + lenBytesRead, len, (err, data, dataBytesRead) => {
			cb(err, str, lenBytesRead + dataBytesRead);
		});
	});
};

/**
 * Read little-endian length prefixed buffer from file.
 * @param  {int}   pos Position in file
 * @param  {int}   len Size of the length field
 * @param  {function} cb  Callback function gets arguments (err, data, bytesRead)
 */
File.prototype.readBufferLenLE = function(pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	debug('read buffer with len prefix %d bytes at %d', len_size, pos);
	this.readUIntLE(pos, len_size, (err, len, lenBytesRead) => {
		if (err) return cb(err);

		this.read(pos + lenBytesRead, len, (err, data, dataBytesRead) => {
			cb(err, str, lenBytesRead + dataBytesRead);
		});
	});
};

/**
 * Create structure reader
 * @param  {int} pos Start position
 * @return {ReadStruct} ReadStruct object
 */
File.prototype.createReadStruct = function(pos) {
	return new Struct.Read(this, pos || 0);
};

// Read aliases
File.prototype.readUInt = File.prototype.readUIntBE;
File.prototype.readInt = File.prototype.readIntBE;
File.prototype.readStringLen = File.prototype.readStringLenBE;
File.prototype.readBufferLen = File.prototype.readBufferLenBE;

//
// Write methods
//

/**
 * Write buffer to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.write = function(data, pos, cb) {
	cb = makeCallback(arguments, this);
	fs.write(this.fd, data, 0, data.length, pos, cb);
};

/**
 * Write string to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeString = function(str, pos, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(str);
	this.write(buffer, pos, cb);
};

/**
 * Write big-endian uint to file.
 * @param  {} data Data to write
 * @param  {int} pos  Position to write to
 * @param  {int} len Size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeUIntBE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeUIntBE(value, 0, len);
	this.write(buffer, pos, cb);
};

/**
 * Write little-endian uint to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeUIntLE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeUIntLE(value, 0, len);
	this.write(buffer, pos, cb);
};

/**
 * Write big-endian int to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeIntBE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeIntBE(value, 0, len);
	this.write(buffer, pos, cb);
};

/**
 * Write little-endian int to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeIntLE = function(value, pos, len, cb) {
	cb = makeCallback(arguments, this);
	var buffer = new Buffer(len);
	buffer.writeIntLE(value, 0, len);
	this.write(buffer, pos, cb);
};

/**
 * Write big-endian length prefixed string to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Length prefix size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeStringLenBE = function(str, pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	var str_len = Buffer.byteLength(str);
	var buffer = new Buffer(len_size + str_len);
	buffer.writeUIntBE(str_len, 0, len_size);
	buffer.write(str, len_size);
	this.write(buffer, pos, cb);
};

/**
 * Write little-endian length prefixed string to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Length prefix size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeStringLenLE = function(str, pos, len_size, cb) {
	cb = makeCallback(arguments, this);

	var str_len = Buffer.byteLength(str);
	var buffer = new Buffer(len_size + str_len);
	buffer.writeUIntLE(str_len, 0, len_size);
	buffer.write(str, len_size);
	this.write(buffer, pos, cb);
};

/**
 * Write big-endian length prefixed buffer to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Length prefix size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeBufferLenBE = function(data, pos, len_size, cb) {
	cb = makeCallback(arguments, this);
	var len_buffer = new Buffer(len_size);
	len_buffer.writeUIntBE(data.length, 0, len_size);
	this.write(Buffer.concat([len_buffer, data]), pos, cb);
};

/**
 * Write little-endian length prefixed buffer to file.
 * @param  {} data Data to write
 * @param  {int}   pos  Position to write to
 * @param  {int} len Length prefix size in bytes
 * @param  {Function} cb   Callback function get arguments (err, bytesWritten, data)
 */
File.prototype.writeBufferLenLE = function(data, pos, len_size, cb) {
	cb = makeCallback(arguments, this);
	var len_buffer = new Buffer(len_size);
	len_buffer.writeUIntLE(data.length, 0, len_size);
	this.write(Buffer.concat([len_buffer, data]), pos, cb);
};

/**
 * Create struct writer.
 * @param  {int} pos Start position
 * @return {WriteStruct}     WriteStruct object
 */
File.prototype.createWriteStruct = function(pos) {
	return new Struct.Write(this, pos || 0);
};

// Write aliases
File.prototype.writeUInt = File.prototype.writeUIntBE;
File.prototype.writeInt = File.prototype.writeIntBE;
File.prototype.writeStringLen = File.prototype.writeStringLenBE;
File.prototype.writeBufferLen = File.prototype.writeBufferLenBE;
