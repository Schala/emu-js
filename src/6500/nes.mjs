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
		let code = [];

		
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

/** Mapper base class */
class Mapper
{
	/**
	 * @constructor
	 * @param {number} prgBanks - Number of ROM's PRG banks
	 * @param {number} chrBanks - Number of ROM's CHR banks
	*/
	constructor(prgBanks, chrBanks)
	{
		this._prgBanks = prgBanks;
		this._chrBanks = chrBanks;
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	getCpuByte(addr)
	{
		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	setCpuByte(addr)
	{
		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	getPpuByte(addr)
	{
		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	setPpuByte(addr)
	{
		return { address: addr, mapped: false };
	}
}

/** Mapper 000 */
class NROM extends Mapper
{
	/**
	 * @constructor
	 * @param {number} prgBanks - Number of ROM's PRG banks
	 * @param {number} chrBanks - Number of ROM's CHR banks
	*/
	constructor(prgBanks, chrBanks)
	{
		super(prgBanks, chrBanks);
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	getCpuByte(addr)
	{
		if (addr >= 32768 && addr <= 65535)
		{
			addr = addr & (this._prgBanks > 1 ? 32767 : 16383);
			return { address: addr, mapped: true };
		}

		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	setCpuByte(addr)
	{
		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	getPpuByte(addr)
	{
		if (addr >= 0 && addr <= 16383)
		{
			// no mapping needed
			return { address: addr, mapped: true };
		}

		return { address: addr, mapped: false };
	}

	/** Returns a boolean/mapped address pair. The boolean indicates if it is within the mapped boundary */
	setPpuByte(addr)
	{
		return { address: addr, mapped: false };
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

const INESMagic = 0x4E45531A; // 'NES'\x1A

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
			if (view.getUint32(i, false) !== INESMagic)
				throw new Error("Not a valid NES ROM");

		this._nes = nes;
		this._prgPages = view.getUint8(4);
		this._chrPages = view.getUint8(5);

		// flags
		this._mapFlags = (view.getUint8(6) & 255) | ((view.getUint8(7) & 255) << 8) | ((view.getUint8(9) & 255) << 16) |
			((view.getUint8(10) & 255) << 24);
		this._mapId = ((mapFlags & MapInfo.TypeHi) << 4) | (mapFlags & MapInfo.TypeLo);
		this._mapper = null;

		switch (this._mapId)
		{
			case 0: this._mapper = new NROM(this._prgPages, this._chrPages); break;
			default: ;
		}

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

	/** Returns the mapper flags */
	get flags()
	{
		return this._mapFlags;
	}

	/** Fetches a mapped byte from the CPU's RAM */
	getCpuByte(addr)
	{
		let mapped = this._mapper.getCpuByte(addr);

		if (mapped.mapped)
			return this._nes.cpu.getByte(mapped.address);
		return 0;
	}

	/** Fetches a mapped byte from the PPU's RAM */
	getPpuByte(addr)
	{
		let mapped = this._mapper.getPpuByte(addr);

		if (mapped.mapped)
			return this._nes.ppu.getByte(mapped.address);
		return 0;
	}

	/** Returns the integrity hash */
	get hash()
	{
		return this._hash;
	}

	/** Writes to a mapped address on the CPU's RAM */
	setCpuByte(addr, data)
	{
		let mapped = this._mapper.setCpuByte(addr);

		if (mapped.mapped)
			this._nes.cpu.setByte(mapped.address, data);
	}

	/** Writes to a mapped address on the PPU's RAM */
	setPpuByte(addr, data)
	{
		let mapped = this._mapper.setPpuByte(addr);

		if (mapped.mapped)
			this._nes.cpu.setByte(mapped.address, data);
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
		this._frameDone = false;

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

		/** Gets a byte from PPU RAM */
	getByte(addr)
	{
		if (addr >= 0 && addr <= 8191)
			// MSB + remaining bits
			return this._bus.getByte(((addr & 4095) >> 12) * 64 + (addr & 4095));
		else if (addr >= 16128 && addr <= 16383)
		{
			addr %= 32;
			switch (addr)
			{
				case 20: addr = 4; break;
				case 24: addr = 8; break;
				case 28: addr = 12; break;
				default: addr = 0;
			}
			return this._bus.getByte(addr);
		}
		else
			return 0;
	}

	/** Gets data on the CPU RAM */
	getCpuByte(addr)
	{
		addr %= 8;
		let data = 0;

		switch (addr)
		{
			case 2:
				data = (this.status & 224) | (this._cache & 31);
				this.status &= ~Status.VBlank;
				this._addrLatch = false;
				break;
			case 7:
				data = this._cache;
				this._cache = this.getByte(this._lastAddr);
				if (this._lastAddr > 16128) data = this._cache;
				this._lastAddr++;
				break;
			default: ;
		}

		return data;
	}

	/** Gets a byte from PPU RAM */
	getByte(addr)
	{
		if (addr >= 0 && addr <= 8191)
			// MSB + remaining bits
			return this._bus.getByte(((addr & 4095) >> 12) * 64 + (addr & 4095));
		else if (addr >= 16128 && addr <= 16383)
		{
			addr %= 32;
			switch (addr)
			{
				case 20: addr = 4; break;
				case 24: addr = 8; break;
				case 28: addr = 12; break;
				default: addr = 0;
			}
			return this._bus.getByte(addr);
		}
		else
			return 0;
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

	/** Resets the PPU */
	reset()
	{
		this._frameDone = false;
		this._addrLatch = false;
		this.addr = 0;
		this.status = 0;
		this.mask = 0;
		this.ctrl = 0;
		this._cache = 0;
		this._x = 0;
		this._y = 0;
		this._bus.reset();
	}

	/** Gets the scroll register */
	get scroll()
	{
		return this._nes.getByte(8197);
	}

	/** Writes a byte to PPU RAM */
	setByte(addr, data)
	{
		if (addr >= 0 && addr <= 8191)
			// MSB + remaining bits
			this._bus.setByte(((addr & 4095) >> 12) * 64 + (addr & 4095), data);
		else if (addr >= 16128 && addr <= 16383)
		{
			addr %= 32;
			switch (addr)
			{
				case 20: addr = 4; break;
				case 24: addr = 8; break;
				case 28: addr = 12; break;
				default: addr = 0;
			}
			this._bus.setByte(addr, data);
		}
	}

	/** Writes data on the CPU RAM */
	setCpuByte(addr, data)
	{
		addr %= 8;

		switch (addr)
		{
			case 0: this.ctrl = data & 255; break;
			case 1: this.mask = data & 255; break;
			case 6: // remember to write hi byte on latch, lo byte otherwise
				if (this._addrLatch)
				{
					this.addr = (this.addr & 255) | ((data & 255) << 8);
					this._addrLatch = false;
				}
				else
				{
					this.addr = (this.addr & 65280) | (data & 255);
					this._addrLatch = true;
				}
			case 7:
				this.data = data & 255;
				this.addr++;
				break;
			default: ;
		}
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
	 * @param {ArrayBuffer} buffer - ROM data buffer
	*/
	loadRom(buffer)
	{
		this._rom = new ROM(this, buffer);
	}

	/** Returns a reference to the PPU */
	get ppu()
	{
		return this._ppu;
	}

	/** Resets the system */
	reset()
	{
		this.ppu.reset();
		this.cpu.reset();
		this.bus.reset();
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
