"use strict"

/**
 * Dumps a hex view to console
 * @param {DataView} data - Data to be displayed
 * @param {number?} offset - Optional offset
*/
export function hexdump(data, offset = 0)
{
	for (var y = 0; y < data.byteLength >> 4; y++)
	{
		// offset
		process.stdout.write(((y << 4) + offset).toString(16).toUpperCase().padStart(4, '0') + ": ");

		// byte content
		for (var x = 0; x < 16; x++)
			process.stdout.write(data.getUint8((y << 4) + x).toString(16).toUpperCase()
				.padStart(2, '0') + ' ');
		process.stdout.write('\t');

		// ASCII
		for (var x = 0; x < 16; x++)
		{
			var b = data.getUint8((y << 4) + x);

			// ensure it's printable
			if (!(b >= 32 && b <= 127))
				b = 46; // '.'

			var c = String.fromCharCode(b);
			process.stdout.write(c);
		}
		console.log('');
	}
}

/** A bus's random access memory */
export class RAM
{
	/**
	 * Creates a new RAM association
	 * @constructor
	 * @param {number} offset - Offset address of the memory
	 * @param {ArrayBuffer} data - Memory buffer
	*/
	constructor(bus, offset, data)
	{
		this.bus = bus;

		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= bus.maxOffset)
			throw new Error("Offset exceeds bus's maximum allowable offset (" + bus.maxOffset + ')');
		
		this.offset = offset;
		this.data = new DataView(data);
	}

	/** Dumps a hex view to console */
	hexdump()
	{
		hexdump(this.data, this.offset);
	}
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
		this._ramMap = [];
		this.devices = [];
		this.maxOffset = maxOffset;
	}

	/**
	 * Adds a RAM entry to the bus's RAM map
	 * @param {number} offset - Offset in bus's RAM
	 * @param {ArrayBuffer} data - RAM buffer
	*/
	addRam(offset, data)
	{
		this._ramMap.push(new RAM(this, offset, data));
	}

	/**
	 * Retrieves a signed byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	*/
	getInt8(offset)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getInt8(offset - ram.offset);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getInt16(offset - ram.offset, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getInt32(offset - ram.offset, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
	}

	/**
	 * Retrieves an unsigned byte in the bus's memory storage
	 * @param {number} offset - Offset into memory
	*/
	getUint8(offset)
	{
		if (offset < 0)
			throw new Error("Offset must be greater than or equal to 0");
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getUint8(offset - ram.offset);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getUint16(offset - ram.offset, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.getUint32(offset - ram.offset, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
	}

	/**
	 * Removes a RAM entry by reference
	 * @param {ArrayBuffer} data - Data reference to find
	*/
	removeRam(data)
	{
		var i = this._ramMap.findIndex(elem => elem.buffer === data);
		this._ramMap.splice(i, i);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setInt8(offset - ram.offset, data);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setInt16(offset - ram.offset, data, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setInt32(offset - ram.offset, data, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setUint8(offset - ram.offset, data);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setUint16(offset - ram.offset, data, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
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
		if (offset >= this.maxOffset)
			throw new Error("Offset out of bus's memory range (" + this.maxOffset + ')');

		for (let ram of this._ramMap)
			if (offset >= ram.offset && offset < (ram.offset + ram.data.byteLength))
				return ram.data.setUint32(offset - ram.offset, data, littleEndian);
		
		throw new Error("There is no addressable memory at offset " + offset);
	}
}
