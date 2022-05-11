"use strict"

import * as emulator from "../emulator";
import * as mos6500 from "6500";

/** Raw casette tape */
export class RawTape
{
	/**
	 * @constructor
	 * @param {C64} c64 - Commodore 64 instance
	 * @param {ArrayBuffer} buffer - Tape buffer
	*/
	constructor(c64, buffer)
	{
		let data = new DataView(buffer);
		let sig = [];
		for (let i = 0; i < 12; i++)
			sig.push(data.getUint8(i));
		
		let version = data.getUint8(12);
		let size = data.getUint32(13);

		this._ptr = 20;
		this._data = new Uint8Array(buffer.slice(this._ptr));
	}

	/** Calculate the next pulse value */
	pulse()
	{
		// Predominantly PAL, so we go with that format's cycle amount.
		// NTSC is almost the same, so shouldn't have issues.
		return (this._data.getUint8(this._ptr++) * 8) / 985248;
	}
}

const C64SType =
{
	Free: 0,
	Normal: 1,
	UncompressedMemorySnapshot: 2,
	MemorySnapshot: 3
}

const FileType =
{
	Frz: 0,
	Seq: 129,
	Prg: 130
}

class TapeEntry
{
	/**
	 * @constructor
	 * @param {ArrayBuffer} buffer - Tape buffer
	*/
	constructor(buffer)
	{
		let data = new DataView(buffer);

		this._c64sType = data.getUint8(0);
		this._fileType = data.getUint8(1);
		this._start = data.getUint16(2, true);
		this._end = data.getUint16(4, true);
		this._offset = data.getUint32(8, true);

		this._name = "";
		for (let i = 0; i < 16; i++)
			this._name += String.fromCharCode(data.getUint8(16 + i));
	}

	/** Returns the end offset */
	get end()
	{
		return this._end;
	}

	/** Returns the entry name */
	get name()
	{
		return this._name;
	}

	/** Returns the data offset */
	get offset()
	{
		return this._offset;
	}

	/** Returns the start offset */
	get start()
	{
		return this._start;
	}
}

const T64_MAGIC = 0x433634; // 'C64'

/** Casette tape */
export class Tape
{
	/**
	 * @constructor
	 * @param {C64} c64 - Commodore 64 instance
	 * @param {ArrayBuffer} buffer - Tape buffer
	*/
	constructor(c64, buffer)
	{
		let data = new DataView(buffer);
		let sig = (data.getUint8(0) << 16) | (data.getUint8(1) << 8) | data.getUint8(2);

		if (sig !== T64_MAGIC)
			throw new Error("Not a valid C64 ROM");

		this._ver = data.getUint16(32);
		this._maxEntries = data.getUint16(34, true);
		this._usedEntries = data.getUint16(36, true);

		this._name = "";
		for (let i = 0; i < 24; i++)
			this._name += String.fromCharCode(data.getUint8(40 + i));
		
		let ptr = 64;
		this._entries = [];
		for (let i = 0; i < this._usedEntries; i++)
		{
			this._entries.push(new TapeEntry(buffer.slice(ptr, ptr + 32)));
			ptr += 32;
		}
	}
}

/** Commodore 64 system */
export class C64
{
}