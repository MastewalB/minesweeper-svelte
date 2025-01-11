export function parseIndexString(loc: string): Array<number> {
	let indices = loc.split(',').map((x) => +x);
	return indices;
}

export function stringifyIndexList(i: number, j: number): string {
	return [i, j].join(',');
}
