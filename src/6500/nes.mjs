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
	FourScreenVRAM: 8,
	TypeLo: 240,
	VSSystemCart: 256,
	PlayChoice: 512,
	NES2_0: 3072,
	TypeHi: 61440,
	PAL: 65536,
	TVSystem: 50331648,
	PRGRAM: 268435456,
	BusConflicts: 536870912
}

const INESMagic = 0x4E45531A; // NES\x1A

/** An NES program cart */
export class ROM
{
	/**
	 * Load a ROM from a buffer
	 * @constructor
	 * @param {NES} nes - NES instance
	 * @param {ArrayBuffer} buffer - ROM data buffer
	*/
	constructor(nes, buffer)
	{
		let view = new DataView(buffer);

		for (let i = 0; i < 4; i++)
			if (view.getUint8(i) !== INESMagic[i])
				throw new Error("Not a valid NES ROM");

		this._nes = nes;
		this._prgPages = view.getUint8(4);
		this._chrPages = view.getUint8(5);

		// flags
		this._mapFlags = (view.getUint8(6) & 255) | ((view.getUint8(7) & 255) << 8) | ((view.getUint8(9) & 255) << 16) |
			((view.getUint8(10) & 255) << 24);
		this._mapId = ((mapFlags & MapInfo.TypeHi) << 4) | (mapFlags & MapInfo.TypeLo);

		this._prgRamSize = view.getUint8(8);

		// trainer, if present
		this._trainer = [];
		let ptr = 16;
		if (this._mapFlags & MapInfo.Trainer == MapInfo.Trainer)
		{
			for (let i = 16; i < 528; i++)
				this._trainer.push(view.getUint8(i));
			nes.bus.load(this._trainer, 28672);
			ptr += 512;
		}

		// PRG
		this._prg = [];
		for (let i = ptr; i < (ptr + (this._prgPages * 16384)); i++)
			this._prg.push(view.getUint8(i));
		this.switchPrg(0);
		ptr += this._prgPages * 16384;

		// CHR
		this._chr = [];
		for (let i = ptr; i < (ptr + (this._chrPages * 8192)); i++)
			this._chr.push(view.getUint8(i));
		this.switchChr(0);

		// integrity check checksum
		this._hash = 0xDEADBEEF;
		for (let b of this._prg)
			this._hash = ((this._hash << 1) | (this._hash & 0x80000000) ? 1 : 0) ^ b;
		for (let b of this._chr)
			this._hash = ((this._hash << 1) | (this._hash & 0x80000000) ? 1 : 0) ^ b;
	}

	/**
	 * Switch the CHR ROM bank
	 * @param {number} bank - 0-based bank index to use
	*/
	switchChr(bank)
	{
		if (bank >= this._chrPages)
			return;
		
		nes.bus.load(this._chr.slice((bank + 1) * 8192));
	}

	/**
	 * Switch the PRG ROM bank
	 * @param {number} bank - 0-based bank index to use
	*/
	switchPrg(bank)
	{
		if (bank >= this._prgPages)
			return;
		
		nes.bus.load(this._prg.slice((bank + 1) * 16384));
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
		return this._nes.getByte(8198);
	}

	/** Sets the address register. This requires two calls, as the address is 14 bits. Only 8 bits at a time can be set. */
	set addr(value)
	{
		this._nes.setByte(8198, value);
	}

	/** Returns a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Gets the control register */
	get ctrl()
	{
		return this._nes.getByte(8192);
	}

	/** Sets the control register */
	set ctrl(value)
	{
		this._nes.setByte(8192, value);
	}

	/** Gets the data register */
	get data()
	{
		return this._nes.getByte(8199);
	}

	/** Sets the data register */
	set data(value)
	{
		this._nes.setByte(8199, value);
	}

	/** Gets the OAM DMA register */
	get dma()
	{
		return this._nes.bus.getUint8(16404);
	}

	/** Loads a CHR bank into bus RAM
	 * @param {ArrayBuffer} chr - CHR bank
	 * @param {number} offset - Offset of the bank in CHR memory
	*/
	loadChr(chr, ofset = 0)
	{
		this._bus.load(chr, 0);
	}

	/** Gets the mask register */
	get mask()
	{
		return this._nes.getByte(8193);
	}

	/** Sets the mask register */
	set mask(value)
	{
		this._nes.setByte(8193, value);
	}

	/** Gets the OAM address register */
	get oamAddr()
	{
		return this._nes.getByte(8195);
	}

	/** Gets the OAM data register */
	get oamData()
	{
		return this._nes.getByte(8196);
	}

	/** Gets the scroll register */
	get scroll()
	{
		return this._nes.getByte(8197);
	}

	/** Gets the status register */
	get status()
	{
		return this._nes.getByte(8194);
	}

	/** Sets the status register */
	set status(value)
	{
		this._nes.setByte(8194, value);
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

	/** Retrieve a single byte from the specified address */
	getByte(addr)
	{
		// CPU RAM
		if (addr >= 0 && addr < 8192)
			return this.bus.getUint8(addr & 2048);
		
		// PPU RAM
		if (addr >= 8192 && addr < 16384)
			return this.bus.getUint8((addr & 8) + 8192);
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

	/** Writes a single byte to the specified address */
	setByte(addr, data)
	{
		// CPU RAM
		if (addr >= 0 && addr < 8192)
		{
			// mirror the write
			addr &= 2048
			for (; addr < 8192; addr += 2048)
				this.bus.setUint8(addr, data);
			return;
		}
		
		// PPU RAM
		if (addr >= 8192 && addr < 16384)
		{
			// mirror the write
			addr = (addr & 8) + 8192;
			for (; addr < 16384; addr += 8)
				this.bus.setUint8(addr, data);
			return;
		}
	}
}
