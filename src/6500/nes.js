"use strict"

const emulator = require("../emulator");
const mos6500 = require("./6500");

const MapInfo =
{
	MirrorVertical: 1,
	BatteryBackedRAM: 2,
	Trainer: 4,
	FourScreenVRAMLayout: 8,
	VSSystemCart: 256
}

/** An NES program cart */
class ROM
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
class PPU2C02
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

		this._status = 0;
		this._mask = 0;
		this._ctrl = 0;
	}

	/** Returns a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Loads a CHR bank into bus RAM
	 * @param {ArrayBuffer} chr - CHR bank
	*/
	loadChr(chr)
	{
		this._bus.addRam(0, chr);
	}
}

/** NES system */
class NES
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

exports.ROM = ROM;
exports.NES = NES;
