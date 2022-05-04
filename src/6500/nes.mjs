"use strict"

import * as emulator from "../emulator";
import * as mos6500 from "6500";

/** GameGenie character map */
const Char =
{
	'A': 0,
	'P': 1,
	'Z': 2,
	'L': 3,
	'G': 4,
	'I': 5,
	'T': 6,
	'Y': 7,
	'E': 8,
	'O': 9,
	'X': 10,
	'U': 11,
	'K': 12,
	'S': 13,
	'V': 14,
	'N': 15
}

/** GameGenie comparison code record */
class Compare
{
	/**
	 * @constructor
	 * @param {number} cmp - Comparison byte
	 * @param {number} data - Byte to write
	*/
	constructor(cmp, data)
	{
		this.cmp = cmp;
		this.data = data;
	}
}

/** Game Genie device */
export class GameGenie
{
	/**
	 * @constructor
	 * @param {Bus} bus - Bus instance
	 * @param {ROM} rom - ROM instance
	*/
	constructor(bus, rom)
	{
		this._rom = rom;
		this._intercepts = new Map();
		this._compares = new Map();
		this._enc = new TextEncoder();
	}

	/** Convert and add a cheat */
	addCheat(cheat)
	{
		var code = [];

		
	}

	/**
	 * Add a comparison (8 digit) code
	 * @param {number} addr - Address of the affected byte
	 * @param {number} cmp - Comparison byte
	 * @param {number} data - Byte to write
	*/
	addCompare(addr, cmp, data)
	{
		this._compares[addr] = new Compare(cmp, data);
	}
}

const MapInfo =
{
	MirrorVertical: 1,
	BatteryBackedRAM: 2,
	Trainer: 4,
	FourScreenVRAMLayout: 8,
	VSSystemCart: 256
}

/** An NES program cart */
export class ROM
{
	/**
	 * Load a ROM from a filepath
	 * @constructor
	 * @param {NES} nes - NES instance
	 * @param {string} path - ROM file path
	*/
	constructor(nes, path)
	{
		this._nes = nes;
		this._prgPages =
		this._chrPages =

		// program memory
		this._prg = new ArrayBuffer(16384);
		nes.bus.addRam(32768, this._prg);
		if (this._prgPages == 1)
			nes.bus.addRam(49152, this._prg); // mirrored

		// graphics memory
		this._chr = new ArrayBuffer(8192);
		nes.ppu.loadChr(this._chr);
		this._mapFlags =
		this._mapId =

		// integrity check checksum
		this._hash = 0xDEADBEEF;
		for (let b of this._prg)
			this._hash = ((this._hash << 1) | (this._hash & 0x80000000) ? 1 : 0) ^ b;
		for (let b of this._chr)
			this._hash = ((this._hash << 1) | (this._hash & 0x80000000) ? 1 : 0) ^ b;
	}

	/** Returns the integrity hash */
	get hash()
	{
		return this._hash;
	}
}

/** PPU status flags */
const Status =
{
	Overflow: 32,
	ZeroHit: 64,

	// when our cycles are > 240 and <= 261 (off screen), good time for for CPU manipulation of PPU,
	// otherwise we'd get graphical artifacts
	VBlank: 128
}

/** PPU mask flags */
const Mask =
{
	Grayscale: 1,
	RenderBGLeft: 2,
	RenderFGLeft: 4,
	RenderBG: 8,
	RenderFG: 16,
	EnhanceRed: 32,
	EnhanceGreen: 64,
	EnhanceBlue: 128
}

/** PPU control flags */
const Control =
{
	NameTableX: 1,
	NameTableY: 2,
	Increment: 4,
	PatternFG: 8,
	PatternBG: 16,
	SpriteSize: 32,
	Slave: 64, // unused
	NMI: 128
}

/** Picture processing unit */
export class PPU2C02
{
	/**
	 * @constructor
	 * @param {NES} nes - NES instance
	*/
	constructor(nes)
	{
		this._nes = nes;
		this._bus = new emulator.Bus(16384);

		// Is the current frame done rendering?
		this._frameDone = true;

		// Are the remaining 6 bits of the address register pending a read?
		this._addrLatch = false;

		this._cache = 0;
		this._lastAddr = 0;
		this._x = 0;
		this._y = 0;
	}

	/** Gets the address register */
	get addr()
	{
		return this._nes.bus.getUint8(8198);
	}

	/** Sets the address register. This requires two calls, as the address is 14 bits. Only 8 bits at a time can be set. */
	set addr(value)
	{
		// mirror across RAM
		for (let i = 8198; i < 16384; i += 8)
			this._nes.bus.setUint8(i, value);
	}

	/** Returns a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Gets the control register */
	get ctrl()
	{
		return this._nes.bus.getUint8(8192);
	}

	/** Sets the control register */
	set ctrl(value)
	{
		// mirror across RAM
		for (let i = 8192; i < 16384; i += 8)
			this._nes.bus.setUint8(i, value);
	}

	/** Gets the data register */
	get data()
	{
		return this._nes.bus.getUint8(8199);
	}

	/** Sets the data register */
	set data(value)
	{
		// mirror across RAM
		for (let i = 8199; i < 16384; i += 8)
			this._nes.bus.setUint8(i, value);
	}

	/** Gets the OAM DMA register */
	get dma()
	{
		return this._nes.bus.getUint8(16404);
	}

	/** Loads a CHR bank into bus RAM
	 * @param {ArrayBuffer} chr - CHR bank
	*/
	loadChr(chr)
	{
		this._bus.addRam(0, chr);
	}

	/** Gets the mask register */
	get mask()
	{
		return this._nes.bus.getUint8(8193);
	}

	/** Sets the mask register */
	set mask(value)
	{
		// mirror across RAM
		for (let i = 8193; i < 16384; i += 8)
			this._nes.bus.setUint8(i, value);
	}

	/** Gets the OAM address register */
	get oamAddr()
	{
		return this._nes.bus.getUint8(8195);
	}

	/** Gets the OAM data register */
	get oamData()
	{
		return this._nes.bus.getUint8(8196);
	}

	/** Gets the scroll register */
	get scroll()
	{
		return this._nes.bus.getUint8(8197);
	}

	/** Gets the status register */
	get status()
	{
		return this._nes.bus.getUint8(8194);
	}

	/** Sets the status register */
	set status(value)
	{
		// mirror across RAM
		for (let i = 8194; i < 16384; i += 8)
			this._nes.bus.setUint8(i, value);
	}
}

/** NES system */
export class NES
{
	constructor()
	{
		this._bus = new emulator.Bus(65536);
		this._cpu = new mos6500.MOS6500(this._bus, 8192, 0);
		this._ppu = new PPU2C02(this);
		this._rom = null;
		this._cycles = 0;
	}

	/** Returns a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Returns a reference to the CPU */
	get cpu()
	{
		return this._cpu;
	}

	/**
	 * Loads a ROM
	 * @param {string} path - File path of the ROM
	*/
	loadRom(path)
	{
		this._rom = new ROM(this, path);
	}

	/** Returns a reference to the PPU */
	get ppu()
	{
		return this._ppu;
	}

	/** Returns a reference to the ROM */
	get rom()
	{
		return this._rom;
	}
}
