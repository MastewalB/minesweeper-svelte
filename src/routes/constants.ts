export enum Icons {
	Mine = '💣',
	Explode = '💥',
	Flag = '🚩',
	Reload = '⟳',
	HOME = '⌂'
}

export enum GameState {
	START = 'start',
	PLAYING = 'playing',
	PAUSED = 'paused',
	WON = 'won',
	LOST = 'lost'
}

export enum BoardSize {
	TEN = 10,
	TWENTY = 20
}

export type GameMode = {
	name: string;
	mineCount: number;
	width: number;
	height: number;
};

export const easyMode: GameMode = {
	name: 'Easy',
	mineCount: 10,
	width: 10,
	height: 10
};

export const mediumMode: GameMode = {
	name: 'Medium',
	mineCount: 40,
	width: 16,
	height: 16
};

export const hardMode: GameMode = {
	name: 'Hard',
	mineCount: 100,
	width: 30,
	height: 16
};
