declare namespace emulator
{
	function hexdump(data: DataView, offset: number): void;

	class Bus
	{
		constructor(maxOffset: number);
		getInt8(offset: number): number;
		getInt16(offset: number): number;
	}
}