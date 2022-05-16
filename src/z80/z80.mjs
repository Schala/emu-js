"use strict"

import * as emulator from "../emulator.mjs";

/** State flags */
const Flag =
{
	// sign
	S: 1,

	// zero
	Z: 2,
	
	// adjust
	H: 8,

	// parity/overflow
	PV: 32,

	// negative
	N: 64,

	// carry
	C: 128
}

/** CPU of the Z80 */
export class Z80
{
	/**
	 * Initialises and connects the CPU to a bus
	 * @constructor
	 * @param {emulator.Bus} bus - The bus to connect to
	*/
	constructor(bus)
	{
		this._pc = 0;

		// accumulator
		this._a = 0;

		// flags
		this._f = 0;

		// general purpose
		this._b = 0;
		this._c = 0;
		this._d = 0;
		this._e = 0;
		this._h = 0;
		this._l = 0;

		// index
		this._x = 0;
		this._y = 0;
		
		// stack pointer
		this._s = 0;

		// misc
		this._i = 0; // interrupt vector
		this._r = 0; // refresh counter
	}

	/** Return the accumulator value */
	get accumulator()
	{
		return this._a;
	}

	/** Return a 16-bit value of the accumulator and flags */
	get af()
	{
		return ((this._a & 255) << 8) | (this._f & 255);
	}

	/** Return the B value */
	get b()
	{
		return this._b;
	}

	/** Return a 16-bit value of B and C */
	get bc()
	{
		return ((this._b & 255) << 8) | (this._c & 255);
	}

	/** Return a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Return the C value */
	get c()
	{
		return this._c;
	}

	/** Return the program counter */
	get counter()
	{
		return this._pc;
	}

	/** Return the D value */
	get d()
	{
		return this._d;
	}

	/** Return a 16-bit value of D and E */
	get de()
	{
		return ((this._d & 255) << 8) | (this._e & 255);
	}

	/** Return the E value */
	get e()
	{
		return this._e;
	}

	/** Return the H value */
	get h()
	{
		return this._h;
	}

	/** Return a 16-bit value of H and L */
	get hl()
	{
		return ((this._h & 255) << 8) | (this._l & 255);
	}

	/** Return the interrupt vector */
	get interrupt()
	{
		return this._i;
	}

	/** Returns the state's carry bit as a boolean */
	get isCarry()
	{
		return this._checkState(Flag.C);
	}

	/** Returns the state's negative bit as a boolean */
	get isNegative()
	{
		return this._checkState(Flag.N);
	}

	/** Returns the state's overflow bit as a boolean */
	get isOverflow()
	{
		return this._checkState(Flag.PV);
	}

	/** Returns the state's zero bit as a boolean */
	get isZero()
	{
		return this._checkState(Flag.Z);
	}

	/** Return the L value */
	get l()
	{
		return this._l;
	}

	/** Return the refresh counter */
	get refresh()
	{
		return this._r;
	}

	/** Returns the stack pointer */
	get stackPtr()
	{
		return this._s;
	}

	/** Return the X value */
	get x()
	{
		return this._x;
	}

	/** Return the Y value */
	get y()
	{
		return this._y;
	}

	/** Check's the status register for the specified flag being set */
	_checkState(flag)
	{
		return (this._f & flag) != 0;
	}
}
