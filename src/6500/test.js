"use strict"

const mos6500 = require("./6500");

var ram = new DataView(new Uint8Array([169,0,162,100,149,200,202,208,251,149,200,160,1,192,101,176,
	18,152,201,101, 176,10,170,254,0,2,132,1,101,1,144,242,200,208,234,162,100,189,0,2,41,1,157,0,
	2,202,208,245]).buffer);

var ptr = 0;
var disasm = [];

while (ptr < ram.byteLength)
{
	var rec = new mos6500.Disassembly(ram, ptr);
	ptr = rec.end;
	disasm.push(rec);
}

for (var d of disasm)
	console.log(d.start.toString(16).toUpperCase().padStart(4, '0') + ": " + d.code);
