"use strict"

/**
 * Dumps a hex view to console
 * @param {DataView} data - Data to be displayed
 * @param {number} offset - Optional offset
*/
export function hexdump(data, offset = 0)
{
	var output = "";
	for (var y = 0; y < data.byteLength >> 4; y++)
	{
		// offset
		output += ((y << 4) + offset).toString(16).toUpperCase().padStart(4, '0') + ": ";

		// byte content
		for (var x = 0; x < 16; x++)
			output += data.getUint8((y << 4) + x).toString(16).toUpperCase().padStart(2, '0') + ' ';
		output += '\t';

		// ASCII
		for (var x = 0; x < 16; x++)
		{
			var b = data.getUint8((y << 4) + x);

			// ensure it's printable
			if (!(b >= 32 && b <= 127))
				b = 46; // '.'

			var c = String.fromCharCode(b);
			output += c;
		}
		output += '\n';
	}

	return output;
}

/** The bus is the main hub for all connected devices. */
export class Bus
{
	/**
	 * Constructs a bus with no connected devices
	 * @constructor
	 * @param {number} maxOffset - How much RAM does this bus have?
	*/
	constructor(maxOffset)
	{
		this._ram = new DataView(new ArrayBuffer(maxOffset));
	}

	/**
	 * Retrieves a signed byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	*/
	getInt8(offset)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getInt8(offset);
	}

	/**
	 * Retrieves a signed word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {boolean} littleEndian - Do we read the bytes in little endian order?
	*/
	getInt16(offset, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getInt16(offset, littleEndian);
	}

	/**
	 * Retrieves a signed double word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {boolean} littleEndian - Do we read the bytes in little endian order?
	*/
	getInt32(offset, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getInt32(offset, littleEndian);
	}

	/**
	 * Retrieves an unsigned byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	*/
	getUint8(offset)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getUint8(offset);
	}

	/**
	 * Retrieves an unsigned word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {boolean} littleEndian - Do we read the bytes in little endian order?
	 */
	getUint16(offset, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getUint16(offset, littleEndian);
	}

	/**
	 * Retrieves an unsigned double word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {boolean} littleEndian - Do we read the bytes in little endian order?
	 */
	getUint32(offset, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		return this._ram.getUint32(offset, littleEndian);
	}

	/** Loads a buffer into RAM */
	load(buffer, offset = 0)
	{
		for (let i = 0; i < buffer.length; i++)
			this._ram.setUint8(i + offset, buffer[i]);
	}

	/** Retrns a reference to RAM */
	get ram()
	{
		return this._ram;
	}

	/**
	 * Stores a signed byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 */
	setInt8(offset, data)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setInt8(offset, data);
	}

	/**
	 * Stores a signed word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 * @param {boolean} littleEndian - Do we write the bytes in little endian order?
	 */
	setInt16(offset, data, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setInt16(offset, data, littleEndian);
	}

	/**
	 * Stores a signed double word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 * @param {boolean} littleEndian - Do we write the bytes in little endian order?
	 */
	setInt32(offset, data, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setInt32(offset, data, littleEndian);
	}

	/**
	 * Stores an unsigned byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 */
	setUint8(offset, data)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setUint8(offset, data);
	}

	/**
	 * Stores an unsigned word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 * @param {boolean} littleEndian - Do we write the bytes in little endian order?
	 */
	setUint16(offset, data, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setUint16(offset, data, littleEndian);
	}

	/**
	 * Stores an unsigned double word in the bus's memory storage
	 * @param {number} offset - Offset into memory
	 * @param {number} data - A single byte of data
	 * @param {boolean} littleEndian - Do we write the bytes in little endian order?
	 */
	setUint32(offset, data, littleEndian = true)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this._ram.byteLength)
			throw new Error("Offset out of bus's memory range (" + this._ram.byteLength + ')');

		this._ram.setUint32(offset, data, littleEndian);
	}
}
