# bin-file

Binary file manipulation helper. Read and write content from and to binary files.

## Install

```
npm install bin-file
```

## Usage

```js
var BinFile = require('bin-file');

// write to file
var file = File.open('file.bin', 'w+', function(err, file) {
	if (err) return console.log(err);

	var struct = file.createWriteStruct(0)
		.uintLE(123, 1)
		.uint(321, 2)
		.string('Hello')
		.stringLen('Hello World!', 2)
		.write((err, written) => {
			if (err) return console.log(err);
			console.log('wrote ' + written + ' bytes');
		});
});

// read from file
var file = File.open('file.bin', 'r+', function(err, file) {
	if (err) return console.log(err);

	var struct = file.createReadStruct(0)
		.uintLE('code', 1)
		.uint('op', 2)
		.string('title', 5)
		.stringLen('content', 2)
		.read((err, res) => {
			if (err) return console.log(err);
			console.log('result:', res);
		});
});

```

## Methods (TBA)
