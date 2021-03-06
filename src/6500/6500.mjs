"use strict"

import * as emulator from "../emulator.mjs";

/** Disassembler address mode constants */
const Mode =
{
	Abs: 0,
	AbsX: 1,
	AbsY: 2,
	Imm: 3,
	Imp: 4,
	Ind: 5,
	IndX: 6,
	IndY: 7,
	Rel: 8,
	ZPg: 9,
	ZPgX: 10,
	ZPgY: 11
}

/** Disassembler mnemonics */
const Mnemonics =
[
	// 0x
	{ mode: Mode.Imp, op: "brk" },
	{ mode: Mode.IndX, op: "ora" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.ZPg, op: "ora" },
	{ mode: Mode.ZPg, op: "asl" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "php" },
	{ mode: Mode.Imm, op: "ora" },
	{ mode: Mode.Imp, op: "asl" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "nop" },
	{ mode: Mode.Abs, op: "ora" },
	{ mode: Mode.Abs, op: "asl" },
	{ mode: Mode.Abs, op: "nop" },

	// 1x
	{ mode: Mode.Rel, op: "bpl" },
	{ mode: Mode.IndY, op: "ora" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "ora" },
	{ mode: Mode.ZPgX, op: "asl" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "clc" },
	{ mode: Mode.AbsY, op: "ora" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "ora" },
	{ mode: Mode.AbsX, op: "asl" },
	{ mode: Mode.AbsX, op: "nop" },

	// 2x
	{ mode: Mode.Abs, op: "jsr" },
	{ mode: Mode.IndX, op: "and" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "bit" },
	{ mode: Mode.ZPg, op: "and" },
	{ mode: Mode.ZPg, op: "rol" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "plp" },
	{ mode: Mode.Imm, op: "and" },
	{ mode: Mode.Imp, op: "rol" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "bit" },
	{ mode: Mode.Abs, op: "and" },
	{ mode: Mode.Abs, op: "rol" },
	{ mode: Mode.Abs, op: "nop" },

	// 3x
	{ mode: Mode.Rel, op: "bmi" },
	{ mode: Mode.IndY, op: "and" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "and" },
	{ mode: Mode.ZPgX, op: "rol" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "sec" },
	{ mode: Mode.AbsY, op: "and" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "and" },
	{ mode: Mode.AbsX, op: "rol" },
	{ mode: Mode.AbsX, op: "nop" },

	// 4x
	{ mode: Mode.Imp, op: "rti" },
	{ mode: Mode.IndX, op: "eor" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.ZPg, op: "eor" },
	{ mode: Mode.ZPg, op: "lsr" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "pha" },
	{ mode: Mode.Imm, op: "eor" },
	{ mode: Mode.Imp, op: "lsr" },
	{ mode: Mode.Abs, op: "nop" },
	{ mode: Mode.Abs, op: "jmp" },
	{ mode: Mode.Abs, op: "eor" },
	{ mode: Mode.Abs, op: "lsr" },
	{ mode: Mode.Abs, op: "nop" },

	// 5x
	{ mode: Mode.Rel, op: "bvc" },
	{ mode: Mode.IndY, op: "eor" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "eor" },
	{ mode: Mode.ZPgX, op: "lsr" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "cli" },
	{ mode: Mode.AbsY, op: "eor" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "eor" },
	{ mode: Mode.AbsX, op: "lsr" },
	{ mode: Mode.AbsX, op: "nop" },

	// 6x
	{ mode: Mode.Imp, op: "rts" },
	{ mode: Mode.IndX, op: "adc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.ZPg, op: "adc" },
	{ mode: Mode.ZPg, op: "ror" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "pla" },
	{ mode: Mode.Imm, op: "adc" },
	{ mode: Mode.Imp, op: "ror" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Ind, op: "jmp" },
	{ mode: Mode.Abs, op: "adc" },
	{ mode: Mode.Abs, op: "ror" },
	{ mode: Mode.Abs, op: "nop" },

	// 7x
	{ mode: Mode.Rel, op: "bvs" },
	{ mode: Mode.IndY, op: "adc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "adc" },
	{ mode: Mode.ZPgX, op: "ror" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "sei" },
	{ mode: Mode.AbsY, op: "adc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "adc" },
	{ mode: Mode.AbsX, op: "ror" },
	{ mode: Mode.AbsX, op: "nop" },

	// 8x
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.IndX, op: "sta" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "sty" },
	{ mode: Mode.ZPg, op: "sta" },
	{ mode: Mode.ZPg, op: "stx" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "dey" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Imp, op: "txa" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "sty" },
	{ mode: Mode.Abs, op: "sta" },
	{ mode: Mode.Abs, op: "stx" },
	{ mode: Mode.Abs, op: "nop" },

	// 9x
	{ mode: Mode.Rel, op: "bcc" },
	{ mode: Mode.IndY, op: "sta" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "sty" },
	{ mode: Mode.ZPgX, op: "sta" },
	{ mode: Mode.ZPgY, op: "stx" },
	{ mode: Mode.ZPgY, op: "nop" },
	{ mode: Mode.Imp, op: "tya" },
	{ mode: Mode.AbsY, op: "sta" },
	{ mode: Mode.Imp, op: "txs" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "sta" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },

	// Ax
	{ mode: Mode.Imm, op: "ldy" },
	{ mode: Mode.IndX, op: "lda" },
	{ mode: Mode.Imm, op: "ldx" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "ldy" },
	{ mode: Mode.ZPg, op: "lda" },
	{ mode: Mode.ZPg, op: "ldx" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "tay" },
	{ mode: Mode.Imm, op: "lda" },
	{ mode: Mode.Imp, op: "tax" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "ldy" },
	{ mode: Mode.Abs, op: "lda" },
	{ mode: Mode.Abs, op: "ldx" },
	{ mode: Mode.Abs, op: "nop" },

	// Bx
	{ mode: Mode.Rel, op: "bcs" },
	{ mode: Mode.IndY, op: "lda" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "ldy" },
	{ mode: Mode.ZPgX, op: "lda" },
	{ mode: Mode.ZPgY, op: "ldx" },
	{ mode: Mode.ZPgY, op: "nop" },
	{ mode: Mode.Imp, op: "clv" },
	{ mode: Mode.AbsY, op: "lda" },
	{ mode: Mode.Imp, op: "tsx" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "ldy" },
	{ mode: Mode.AbsX, op: "lda" },
	{ mode: Mode.AbsY, op: "ldx" },
	{ mode: Mode.AbsY, op: "nop" },

	// Cx
	{ mode: Mode.Imm, op: "cpy" },
	{ mode: Mode.IndX, op: "cmp" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "cpy" },
	{ mode: Mode.ZPg, op: "cmp" },
	{ mode: Mode.ZPg, op: "dec" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "iny" },
	{ mode: Mode.Imm, op: "cmp" },
	{ mode: Mode.Imp, op: "dex" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "cpy" },
	{ mode: Mode.Abs, op: "cmp" },
	{ mode: Mode.Abs, op: "dec" },
	{ mode: Mode.Abs, op: "nop" },

	// Dx
	{ mode: Mode.Rel, op: "bne" },
	{ mode: Mode.IndY, op: "cmp" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "cmp" },
	{ mode: Mode.ZPgX, op: "dec" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "cld" },
	{ mode: Mode.AbsY, op: "cmp" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "cmp" },
	{ mode: Mode.AbsX, op: "dec" },
	{ mode: Mode.AbsX, op: "nop" },

	// Ex
	{ mode: Mode.Imm, op: "cpx" },
	{ mode: Mode.IndX, op: "sbc" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.IndX, op: "nop" },
	{ mode: Mode.ZPg, op: "cpx" },
	{ mode: Mode.ZPg, op: "sbc" },
	{ mode: Mode.ZPg, op: "inc" },
	{ mode: Mode.ZPg, op: "nop" },
	{ mode: Mode.Imp, op: "inx" },
	{ mode: Mode.Imm, op: "sbc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.Imm, op: "nop" },
	{ mode: Mode.Abs, op: "cpx" },
	{ mode: Mode.Abs, op: "sbc" },
	{ mode: Mode.Abs, op: "inc" },
	{ mode: Mode.Abs, op: "nop" },

	// Fx
	{ mode: Mode.Rel, op: "beq" },
	{ mode: Mode.IndY, op: "sbc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.IndY, op: "nop" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.ZPgX, op: "sbc" },
	{ mode: Mode.ZPgX, op: "inc" },
	{ mode: Mode.ZPgX, op: "nop" },
	{ mode: Mode.Imp, op: "sed" },
	{ mode: Mode.AbsY, op: "sbc" },
	{ mode: Mode.Imp, op: "nop" },
	{ mode: Mode.AbsY, op: "nop" },
	{ mode: Mode.AbsX, op: "nop" },
	{ mode: Mode.AbsX, op: "sbc" },
	{ mode: Mode.AbsX, op: "inc" },
	{ mode: Mode.AbsX, op: "nop" }
];

/** Disassembled code */
export class Disassembly
{
	/**
	 * Disassemble a single instruction
	 * @constructor
	 * @param {DataView} ram - RAM buffer
	 * @param {number} offset - Offset into the buffer
	*/
	constructor(ram, offset = 0)
	{		
		this.start = offset;
		let op = ram.getUint8(offset++);
		this.code = Mnemonics[op].op;

		switch (Mnemonics[op].mode)
		{
			case Mode.Imm:
				this.code += " #$" + ram.getUint8(offset++).toString(16).toUpperCase();
				break;
			case Mode.ZPg:
				this.code += " $" + ram.getUint8(offset++).toString(16).toUpperCase();
				break;
			case Mode.ZPgX:
				this.code += " $" + ram.getUint8(offset++).toString(16).toUpperCase() + ", x";
				break;
			case Mode.ZPgY:
				this.code += " $" + ram.getUint8(offset++).toString(16).toUpperCase() + ", y";
				break;
			case Mode.IndX:
				this.code += " ($" + ram.getUint8(offset++).toString(16).toUpperCase() + ", x)";
				break;
			case Mode.IndY:
				this.code += " ($" + ram.getUint8(offset++).toString(16).toUpperCase() + ", y)";
				break;
			case Mode.Abs:
				this.code += " $" + ram.getUint16(offset, true).toString(16).toUpperCase();
				offset += 2;
				break;
			case Mode.AbsX:
				this.code += " $" + ram.getUint16(offset, true).toString(16).toUpperCase() + ", x";
				offset += 2;
				break;
			case Mode.AbsY:
				this.code += " $" + ram.getUint16(offset, true).toString(16).toUpperCase() + ", y";
				offset += 2;
				break;
			case Mode.Ind:
				this.code += " ($" + ram.getUint16(offset, true).toString(16).toUpperCase() + ')';
				offset += 2;
				break;
			case Mode.Rel:
				let rel = ram.getInt8(offset++);
				this.code += " $" + rel.toString(16).toUpperCase() + " [$" +
					(offset + rel).toString(16).toUpperCase().padStart(4, '0') + ']';
			default: ; // implied takes no operands
		}

		this.end = offset;
	}
}

/** State flags */
const Flag =
{
	// carry	
	C: 1,

	// zero
	Z: 2,

	// disable interrupts
	I: 4,

	// decimal mode
	D: 8,

	// break
	B: 16,

	// undefined
	U: 32,

	// overflow
	V: 64,

	// negative
	N: 128
}

/** Opcodes */
class Opcodes
{
	/**
	 * @constructor
	 * @param {MOS6500} cpu - the calling CPU
	*/
	constructor(cpu)
	{
		this.table =
		[
			// 0x
			{ cycles: 7, mode: cpu._imp.bind(cpu), op: cpu._brk.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._asl.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._imp.bind(cpu), op: cpu._php.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._asl.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._asl.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// 1x
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bpl.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._asl.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._clc.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._ora.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._asl.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },

			// 2x
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._jsr.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._bit.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._rol.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._imp.bind(cpu), op: cpu._plp.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._rol.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._bit.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._rol.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// 3x
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bmi.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._rol.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._sec.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._and.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._rol.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },

			// 4x
			{ cycles: 6, mode: cpu._imp.bind(cpu), op: cpu._rti.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._lsr.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._imp.bind(cpu), op: cpu._pha.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._lsr.bind(cpu) },
			{ cycles: 2, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._abs.bind(cpu), op: cpu._jmp.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._lsr.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// 5x
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bvc.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._lsr.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._cli.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._eor.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._lsr.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },

			// 6x
			{ cycles: 6, mode: cpu._imp.bind(cpu), op: cpu._rts.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._ror.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._imp.bind(cpu), op: cpu._pla.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._ror.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 5, mode: cpu._ind.bind(cpu), op: cpu._jmp.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._ror.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// 7x
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bvs.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._ror.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._sei.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._adc.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._ror.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },

			// 8x
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._sty.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._stx.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._dey.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._txa.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._sty.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._stx.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// 9x
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bcc.bind(cpu) },
			{ cycles: 6, mode: cpu._indY.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 6, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._sty.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgY.bind(cpu), op: cpu._stx.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._tya.bind(cpu) },
			{ cycles: 5, mode: cpu._absY.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._txs.bind(cpu) },
			{ cycles: 5, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 5, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 5, mode: cpu._absX.bind(cpu), op: cpu._sta.bind(cpu) },
			{ cycles: 6, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 5, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },

			// Ax
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._ldy.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._ldx.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._ldy.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._ldx.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._tay.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._tax.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._ldy.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._ldx.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// Bx
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bcs.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._ldy.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgY.bind(cpu), op: cpu._ldx.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._clv.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._tsx.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._ldy.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._lda.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._ldx.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },

			// Cx
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._cpy.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._cpy.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._dec.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._iny.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._dex.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._cpy.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._dec.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// Dx
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._bne.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._dec.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._cld.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._cmp.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._dec.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },

			// Ex
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._cpx.bind(cpu) },
			{ cycles: 6, mode: cpu._indX.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 8, mode: cpu._indX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._cpx.bind(cpu) },
			{ cycles: 3, mode: cpu._zpg.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._inc.bind(cpu) },
			{ cycles: 5, mode: cpu._zpg.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._inx.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imm.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._cpx.bind(cpu) },
			{ cycles: 4, mode: cpu._abs.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._inc.bind(cpu) },
			{ cycles: 6, mode: cpu._abs.bind(cpu), op: cpu._nop.bind(cpu) },

			// Fx
			{ cycles: 2, mode: cpu._rel.bind(cpu), op: cpu._beq.bind(cpu) },
			{ cycles: 5, mode: cpu._indY.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 0, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._indY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._zpgX.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._inc.bind(cpu) },
			{ cycles: 6, mode: cpu._zpgX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._sed.bind(cpu) },
			{ cycles: 4, mode: cpu._absY.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 2, mode: cpu._imp.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 7, mode: cpu._absY.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) },
			{ cycles: 4, mode: cpu._absX.bind(cpu), op: cpu._sbc.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._inc.bind(cpu) },
			{ cycles: 7, mode: cpu._absX.bind(cpu), op: cpu._nop.bind(cpu) }
		];
	}
}

/** The central processor unit of the MOS 6500 series */
export class MOS6500
{
	/**
	 * Initialises and connects the CPU to a bus
	 * @constructor
	 * @param {emulator.Bus} bus - The bus to connect to
	*/
	constructor(bus)
	{
		this._ops = new Opcodes(this);
		this._bus = bus;
		
		// stack pointer
		this._s = 253;

		// last absolute address
		this._absAddr = 0;

		this._pc = 0;

		// last relative address
		this._relAddr = 0;

		// last opcode
		this._op = 0;

		// byte data cache
		this._cache = 0;

		// cycle count
		this._cycles = 8;

		// accumulator
		this._a = 0;

		// general purpose registers
		this._x = 0;
		this._y = 0;

		// state
		this._p = Flag.U;
	}

	/** Return the accumulator value */
	get accumulator()
	{
		return this._a;
	}

	/** Return a reference to the bus */
	get bus()
	{
		return this._bus;
	}

	/** Execute one instruction cycle */
	clock()
	{
		if (this._cycles == 0)
		{
			this._setState(Flag.U, true); // always set

			// get next opcode
			this._op = this._getRomByte();

			// set cycles and see if any additional cycles are needed
			this._cycles = this._ops.table[this._op].cycles;
			let extra1 = this._ops.table[this._op].mode(this);
			let extra2 = this._ops.table[this._op].op(this);
			this._cycles += extra1 & extra2;

			this._setState(Flag.U, true); // always set
		}

		this._cycles--;
	}

	/** Return the program counter */
	get counter()
	{
		return this._pc;
	}

	/** Return the amount of cycles */
	get cycles()
	{
		return this._cycles;
	}

	/** Returns the value of the entry vector */
	get entry()
	{
		return this._bus.getUint16(65532);
	}

	/** Sets the entry vector's value */
	set entry(value)
	{
		this._bus.setUint16(65532, value);
	}

	/** Returns the state's disable interrupts bit as a boolean */
	get hasInterrupts()
	{
		return !this._checkState(Flag.I);
	}

	/** Returns the value of the interrupt request vector */
	get irq()
	{
		return this._bus.getUint16(65534);
	}

	/** Sets the interrupt request vector's value */
	set irq(value)
	{
		this._bus.setUint16(65534, value);
	}

	/** Returns the state's break bit as a boolean */
	get isBreak()
	{
		return this._checkState(Flag.B);
	}

	/** Returns the state's carry bit as a boolean */
	get isCarry()
	{
		return this._checkState(Flag.C);
	}

	/** Returns the state's decimal mode bit as a boolean */
	get isDecimal()
	{
		return this._checkState(Flag.D);
	}

	/** Returns the state's negative bit as a boolean */
	get isNegative()
	{
		return this._checkState(Flag.N);
	}

	/** Returns the state's overflow bit as a boolean */
	get isOverflow()
	{
		return this._checkState(Flag.V);
	}

	/** Returns the state's undefined bit as a boolean */
	get isUndefined()
	{
		return this._checkState(Flag.U);
	}

	/** Returns the state's zero bit as a boolean */
	get isZero()
	{
		return this._checkState(Flag.Z);
	}

	/** Returns the last absolute address processed */
	get lastAbsAddr()
	{
		return this._absAddr;
	}

	/** Returns the mnemonic of the last opcode processed */
	get lastMnemonic()
	{
		return Mnemonics[this._op].op;
	}

	/** Returns the last opcode processed */
	get lastOp()
	{
		return this._op;
	}

	/** Returns the last relative address offset processed */
	get lastRelAddr()
	{
		return this._relAddr;
	}

	/** Returns the value of the non-maskable interrupt vector */
	get nmi()
	{
		return this._bus.getUint16(65530);
	}

	/** Sets the non-maskable interrupt vector's value */
	set nmi(value)
	{
		this._bus.setUint16(65530, value);
	}

	/** Resets the CPU state */
	reset()
	{
		// stack pointer
		this._s = 253;

		// last absolute address
		this._absAddr = 0;

		// program counter, initialised to the value of the entry vector
		this._pc = this.entry;

		// last relative address
		this._relAddr = 0;

		// last opcode
		this._op = 0;

		// byte data cache
		this._cache = 0;

		// cycle count
		this._cycles = 8;

		// accumulator
		this._a = 0;

		// general purpose registers
		this._x = 0;
		this._y = 0;

		// state
		this._p = Flag.U;
	}

	/** Returns a reference to the stack */
	get stack()
	{
		return this._bus.ram.buffer.splice(0, 256);
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

	// --- internal helper functions ---

	/** Common functionality for branching */
	_branch()
	{
		this._cycles++;
		this._absAddr = this._pc + this._relAddr;

		// need additional cycle if different page
		if ((this._absAddr & 0xFF00) != (this._pc & 0xFF00))
			this._cycles++;
		
		// jump
		this._pc = this._absAddr;
	}

	/**
	 * Check the address mode, either assigning to accumulator, or writing to cached address.
	 * @param {number} value - Value to store
	*/
	_checkMode(value)
	{
		if (this._ops.table[this._op].mode == this._imp)
			this._a = value & 255;
		else
			this._setLastByte(value & 255);
	}

	/** Check's the status register for the specified flag being set */
	_checkState(flag)
	{
		return (this._p & flag) != 0;
	}

	/** Fetch and caches a byte from the last read address */
	_fetchByte()
	{
		if (this._ops.table[this._op].mode !== this._imp)
			this._cache = this._getLastByte();
		return this._cache;
	}

	/** Fetch a word from the last read address, caching the higher byte */
	_fetchWord()
	{
		return this._fetchByte() | (this._fetchByte() << 8);
	}

	/** Retrieve a byte from the last read address */
	_getLastByte()
	{
		return this._bus.getUint8(this._absAddr);
	}

	/** Retrieve a word from the last read address */
	_getLastWord()
	{
		return this._bus.getUint16(this._absAddr);
	}

	/** Retrieve a byte from ROM */
	_getRomByte(relative = false)
	{
		return relative ? this._bus.getInt8(this._pc++) : this._bus.getUint8(this._pc++);
	}

	/** Retrieve a word from ROM */
	_getRomWord()
	{
		return this._getRomByte() | (this._getRomByte() << 8);
	}

	/** Retrieve a byte from the stack */
	_getStackByte()
	{
		return this._getUint8(this._s++ % 256);
	}

	/** Retrieve a word from the stack */
	_getStackWord()
	{
		return this._getStackByte() | (this._getStackByte() << 8);
	}

	/**
	 * Common interrupt functionality
	 * @param {number} newAddr - The address to jump to
	 * @param {number} newCycles - The cycle count to set
	 */
	_interrupt(newAddr, newCycles)
	{
		// write the current counter value to the stack
		this._setStackUint16(this._pc);

		// set and write state to stack too
		this._setState(Flag.B, false);
		this._sei();
		this._setState(Flag.U, true);
		this._setStackByte(this._p);

		// get new counter
		this._absAddr = newAddr;
		this._pc = this._fetchWord();

		this._cycles = newCycles;
	}

	/** Sets the carry, negative and zero states
	 * @param {number} value - Value to check
	*/
	_setCNZ(value)
	{
		this._setState(Flag.C, value > 255);
		this._setNZ(value);
	}

	/** Sets a state flag
	 * @param {number} flag - Flag to set
	 * @param {boolean} condition - The boolean condition
	*/
	_setState(flag, condition)
	{
		if (condition == true)
			this._p |= flag;
		else
			this._p &= ~flag;
	}

	/** Store a byte to the last read address */
	_setLastByte(data)
	{
		this._bus.setUint8(this._absAddr, data);
	}

	/** Store a word to the last read address */
	_setLastWord()
	{
		this._bus.setUint16(this._absAddr, data);
	}

	/** Sets the negative and zero states after checking a value
	 * @param {number} value - Value to check
	*/
	_setNZ(value)
	{
		this._setState(Flag.Z, (value & 255) == 0);
		this._setState(Flag.N, value & 128);
	}

	/** Store a byte to the stack */
	_setStackByte(data)
	{
		this._bus.setUint8(this._s--, data);
	}

	/** Store a word to the stack */
	_setStackWord(data)
	{
		this._setStackByte(data & 255);
		this._setStackByte((data & 0xFF00) >> 8);
	}


	// --- Address modes ---

	/** Absolute address */
	_abs()
	{
		this._absAddr = this._getRomWord();
		return 0;
	}

	/** Absolute address with X offset */
	_absX()
	{
		let addr = this._getRomWord();
		this._absAddr += this._x;
		return (this._absAddr & 0xFF00) == (addr & 0xFF00) ? 0 : 1;
	}

	/** Absolute address with Y offset */
	_absY()
	{
		let addr = this._getRomWord();
		this._absAddr += this._y;
		return (this._absAddr & 0xFF00) == (addr & 0xFF00) ? 0 : 1;
	}

	/** Immediate address */
	_imm()
	{
		this._absAddr = this._pc++;
		return 0;
	}

	/** Implied address */
	_imp()
	{
		this._cache = this._a;
		return 0;
	}

	/** Indirect address */
	_ind()
	{
		let ptr = this._getRomWord();

		if ((ptr & 255) == 0)
			// emulate page boundary bug
			this._absAddr = this._bus.getUint16(ptr);
		else
			// normal behavior
			this._absAddr = this._bus.getUint16(ptr + 1);
		
		return 0;
	}

	/** Indirect address with X offset */
	_indX()
	{
		let t = this._getRomWord();
		let lo = this._bus.getUint8((t + this._x) & 255);
		let hi = this._bus.getUint8((t + this._x + 1) & 255);
		this._absAddr = (hi << 8) | lo;
		return 0;
	}

	/** Indirect address with Y offset */
	_indY()
	{
		let t = this._getRomWord();
		let lo = this._bus.getUint8(t & 255);
		let hi = this._bus.getUint8((t + 1) & 255);
		this._absAddr = (hi << 8) | lo + this._y;

		return this._absAddr == (hi << 8) ? 0 : 1;
	}

	/** Relative address */
	_rel()
	{
		this._relAddr = this._getRomByte(true);
		return 0;
	}

	/** Zero page address */
	_zpg()
	{
		this._absAddr = this._getRomByte();
		return 0;
	}

	/** Zero page address with X offset */
	_zpgX()
	{
		this._absAddr = (this._getRomByte() + this._x) & 255;
		return 0;
	}

	/** Zero page address with Y offset */
	_zpgY()
	{
		this._absAddr = (this._getRomByte() + this._y) & 255;
		return 0;
	}


	// --- instructions ---

	/** Add with carry */
	_adc()
	{
		let tmp = this._a + this._fetchByte() + (this.isCarry ? 1 : 0);
		this._setCNZ(tmp);
		this._setState(Flag.V, ~((this._a ^ this._cache) & (this._a ^ tmp) & 128));
		this._a = tmp & 255;
		return 1;
	}

	/** And */
	_and()
	{
		this._a &= this._fetchByte();
		this._setNZ(this._a);
		return 1;
	}

	/** Arithmetical shift left */
	_asl()
	{
		let tmp = this._fetchByte() << 1;
		this._setCNZ(tmp);
		this._checkMode(tmp);
		return 0;
	}

	/** Branch if not carry */
	_bcc()
	{
		if (!this.isCarry)
			this._branch();
		return 0;
	}

	/** Branch if carry */
	_bcs()
	{
		if (this.isCarry)
			this._branch();
		return 0;
	}

	/** Branch if zero */
	_beq()
	{
		if (this.isZero)
			this._branch();
		return 0;
	}

	/** Test bit */
	_bit()
	{
		this._setState(Flag.Z, ((this._a & this._fetchByte()) & 255) == 0);
		this._setState(Flag.N, this._cache & 128);
		this._setState(Flag.V, this._cache & 64);
		return 0;
	}

	/** Branch if negative */
	_bmi()
	{
		if (this.isNegative)
			this._branch();
		return 0;
	}

	/** Branch if not zero */
	_bne()
	{
		if (!this.isZero)
			this._branch();
		return 0;
	}

	/** Branch if positive */
	_bpl()
	{
		if (!this.isNegative)
			this._branch();
		return 0;
	}

	/** Break */
	_brk()
	{
		this._sei();
		this._setStackWord(++this._pc);
		this._setState(Flag.B, true);
		this._setStackByte(this._p);
		this._setState(Flag.B, false);
		this._pc = this._bus.getUint16(65534);
		return 0;
	}

	/** Branch if not overflow */
	_bvc()
	{
		if (!this.isOverflow)
			this._branch();
		return 0;
	}

	/** Branch if overflow */
	_bvs()
	{
		if (this.isOverflow)
			this._branch();
		return 0;
	}

	/** Clear carry */
	_clc()
	{
		this._setState(Flag.C, false);
		return 0;
	}

	/** Clear decimal mode */
	_cld()
	{
		this._setState(Flag.D, false);
		return 0;
	}

	/** Clear disable interrupts */
	_cli()
	{
		this._setState(Flag.I, false);
		return 0;
	}

	/** Clear overflow */
	_clv()
	{
		this._setState(Flag.V, false);
		return 0;
	}

	/** Compare accumulator */
	_cmp()
	{
		let tmp = this._a - this._fetchByte();
		if (this._a >= this._cache)
			this._sec();
		this._setNZ(tmp);
		return 1;
	}

	/** Compare X */
	_cpx()
	{
		let tmp = this._x - this._fetchByte();
		if (this._x >= this._cache)
			this._sec();
		this._setNZ(tmp);
		return 1;
	}

	/** Compare Y */
	_cpy()
	{
		let tmp = this._y - this._fetchByte();
		if (this._y >= this._cache)
			this._sec();
		this._setNZ(tmp);
		return 1;
	}

	/** Decrement operand */
	_dec()
	{
		let tmp = this._fetchByte() - 1;
		this._setLastByte(tmp);
		this._setNZ(tmp);
		return 0;
	}

	/** Decrement X */
	_dex()
	{
		this._setNZ(--this._x);
		return 0;
	}

	/** Decrement Y */
	_dey()
	{
		this._setNZ(--this._y);
		return 0;
	}

	/** Exclusive or */
	_eor()
	{
		this._a ^= this._fetchByte();
		this._setNZ(this._a);
		return 1;
	}

	/** Increment operand */
	_inc()
	{
		let tmp = (this._fetchByte() + 1) & 255;
		this._setLastByte(tmp);
		this._setNZ(tmp);
		return 0;
	}

	/** Increment X */
	_inx()
	{
		this._setNZ(++this._x);
		return 0;
	}

	/** Increment Y */
	_iny()
	{
		this._setNZ(++this._y);
		return 0;
	}

	/** Request interrupt */
	_irq()
	{
		if (this.hasInterrupts)
			this._interrupt(65534, 7);
		return 0;
	}

	/** Jump to address */
	_jmp()
	{
		this._pc = this._absAddr;
		return 0;
	}

	/** Jump to subroutine */
	_jsr()
	{
		this._setStackWord(this._pc);
		return this._jmp();
	}

	/** Load accumulator */
	_lda()
	{
		this._a = this._fetchByte();
		this._setNZ(this._a);
		return 1;
	}

	/** Load X */
	_ldx()
	{
		this._x = this._fetchByte();
		this._setNZ(this._x);
		return 1;
	}

	/** Load Y */
	_ldy()
	{
		this._y = this._fetchByte();
		this._setNZ(this._y);
		return 1;
	}

	/** Logical shift right */
	_lsr()
	{
		if ((this._fetchByte() & 1) != 0)
			this._sec();
		let tmp = this._cache >> 1;
		this._setNZ(tmp);
		this._checkMode(tmp);
		return 0;
	}

	/** Non-maskable interrupt */
	_nmi()
	{
		this._interrupt(65530, 8);
		return 0;
	}

	/** No operation */
	_nop()
	{
		switch (this._op)
		{
			case 28:
			case 60:
			case 92:
			case 124:
			case 220:
			case 252:
				return 1;
			default:
				return 0; 
		}
	}

	/** Arithmetical or */
	_ora()
	{
		this._a |= this._fetchByte();
		this._setNZ(this._a);
		return 1;
	}

	/** Push accumulator to stack */
	_pha()
	{
		this._setStackByte(this._a);
		return 0;
	}

	/** Push status to stack */
	_php()
	{
		this._setState(Flag.B, true);
		this._setState(Flag.U, true);
		this._setStackByte(this._p);
		this._setState(Flag.B, false);
		this._setState(Flag.U, false);
		return 0;
	}

	/** Pop accumulator from stack */
	_pla()
	{
		this._a = this._getStackByte();
		this._setNZ(this._a);
		return 0;
	}

	/** Pop status from stack */
	_plp()
	{
		this._p = this._getStackByte();
		return 0;
	}

	/** Rotate left */
	_rol()
	{
		let tmp = (this._fetchByte() << 1) | (this.isCarry ? 1 : 0);
		this._setCNZ(tmp);
		this._checkMode(tmp);
		return 0;
	}

	/** Rotate right */
	_ror()
	{
		this._fetchByte();
		let tmp = (this._cache << 7) | (this._cache >> 1);
		if ((this._cache & 1) != 0)
			this._sec();
		this._checkMode(tmp);
		return 0;
	}

	/** Return from interrupt */
	_rti()
	{
		// restore state
		this._p = this._getStackByte();
		this._setState(Flag.B, false);
		this._setState(Flag.U, false);

		// same code, so let's reuse
		return this._rts();
	}

	/** Return from subroutine */
	_rts()
	{
		this._pc = this._getStackWord();
		return 0;
	}

	/** Subtract with carry */
	_sbc()
	{
		let value = this._fetchByte() ^ 255; // invert
		let tmp = this._a + this._fetchByte() + (this.isCarry ? 1 : 0);
		this._setCNZ(tmp);
		this._setState(Flag.V, (tmp ^ this._a) & ((tmp ^ value) & 128));
		this._a = tmp & 255;
		return 1;
	}

	/** Set carry */
	_sec()
	{
		this._setState(Flag.C, true);
		return 0;
	}

	/** Set decimal mode */
	_sed()
	{
		this._setState(Flag.D, true);
		return 0;
	}

	/** Set disable interrupts */
	_sei()
	{
		this._setState(Flag.I, true);
		return 0;
	}

	/** Store accumulator */
	_sta()
	{
		this._setLastByte(this._a);
		return 0;
	}

	/** Store X */
	_stx()
	{
		this._setLastByte(this._x);
		return 0;
	}

	/** Store Y */
	_sty()
	{
		this._setLastByte(this._y);
		return 0;
	}

	/** Copy accumulator to X */
	_tax()
	{
		this._x = this._a;
		this._setNZ(this._x);
		return 0;
	}

	/** Copy accumulator to Y */
	_tay()
	{
		this._y = this._a;
		this._setNZ(this._y);
		return 0;
	}

	/** Copy stack pointer to X */
	_tsx()
	{
		this._x = this._s;
		this._setNZ(this._x);
		return 0;
	}

	/** Copy X to accumulator */
	_txa()
	{
		this._a = this._x;
		this._setNZ(this._a);
		return 0;
	}

	/** Copy X to stack pointer */
	_txs()
	{
		this._s = this._x;
		return 0;
	}

	/** Copy Y to accumulator */
	_tya()
	{
		this._a = this._y;
		this._setNZ(this._a);
		return 0;
	}
}
