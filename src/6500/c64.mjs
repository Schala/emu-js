"use strict"

import * as emulator from "../emulator";
import * as mos6500 from "6500";

/** Raw casette tape */
export class RawTape
{
	/**
	 * @constructor
	 * @param {C64} c64 - Commodore 64 instance
	 * @param {string} path - File path to tape
	*/
	constructor(c64, path)
	{
	}

	/** Calculate the next pulse value */
	pulse()
	{

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
	Seq: 129,
	Prg: 130
}

class TapeEntry
{
	constructor()
	{
		this._c64sType
		this._fileType
		this._start
		this._end
		this._offset
		this._name
	}
}

/** Casette tape */
export class Tape
{
	constructor()
	{
		this._ver
		this._maxEntries
		this._usedEntries
		this._name
		this._entries = [];
	}
}

/** Commodore 64 system */
export class C64
{
}