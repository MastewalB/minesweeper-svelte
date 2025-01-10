<script lang="ts">
	import { type GameMode, Icons, GameState, easyMode, mediumMode, hardMode } from './constants.ts';
	import { browser } from '$app/environment';

	let state: GameState = GameState.START;
	let mode: GameMode = easyMode;
	let boardSize: number = mode.width * mode.height;
	let minePositions = new Set<string>();
	let board: (string | number)[][] = createBoard();
	let N = board.length,
		M = board[0].length;
	let opened = new Set<string>();
	let timerId: number | null = null;
	let time = 0;

	function createBoard() {
		let mineSet = new Set<string>();
		let h = mode.width,
			v = mode.height;
		let arr: (string | number)[][] = [];
		for (let i = 0; i < v; i++) {
			arr.push(Array.from({ length: h }, () => 0));
		}
		while (mineSet.size < mode.mineCount) {
			mineSet.add([Math.floor(Math.random() * v), Math.floor(Math.random() * h)].join(','));
		}
		for (let s of mineSet) {
			let [i, j] = strToInt(s);
			arr[i][j] = Icons.Explode;
		}
		minePositions = mineSet;
		return calculateDistance(arr);
		// return ([] as (string | number)[]).concat(...calculateDistance(arr))
	}

	function calculateDistance(arr: (string | number)[][]) {
		let N = arr.length,
			M = arr[0].length;
		for (let i = 0; i < N; i++) {
			for (let j = 0; j < M; j++) {
				if (typeof arr[i][j] == 'string') {
					continue;
				}
				let DIR = [-1, 0, 1, 0, -1, -1, 1, 1, -1];

				for (let d = 0; d < 8; d++) {
					let ni = i + DIR[d],
						nj = j + DIR[d + 1];
					if (ni >= 0 && nj >= 0 && ni < N && nj < M && typeof arr[ni][nj] == 'string') {
						arr[i][j] = (arr[i][j] as number) + 1;
					}
				}
			}
		}
		for (let i = 0; i < N; i++) {
			for (let j = 0; j < M; j++) {
				if (arr[i][j] == 0) {
					arr[i][j] = '';
				}
			}
		}
		return arr;
	}

	function openCard(location: string) {
		opened = opened.add(location);
		let [i, j] = strToInt(location);
		if (board[i][j] == '') {
			dfs(location);
		} else if (minePositions.has(location)) {
			state = GameState.LOST;
			for (let mineLoc of minePositions) {
				opened.add(mineLoc);
			}
		}
	}

	function gameWon() {
		state = GameState.WON;
		for (let mineLoc of minePositions) {
			opened.add(mineLoc);
			let [i, j] = strToInt(mineLoc);
			board[i][j] = Icons.Flag;
		}
	}

	function dfs(index: string) {
		let [i, j] = strToInt(index);
		if (typeof board[i][j] == 'number') {
			return;
		}
		let DIR = [-1, 0, 1, 0, -1, -1, 1, 1, -1];

		for (let d = 0; d < 8; d++) {
			let ni = i + DIR[d],
				nj = j + DIR[d + 1];
			if (ni >= 0 && nj >= 0 && ni < N && nj < M && !opened.has([ni, nj].join(','))) {
				opened.add([ni, nj].join(','));
				dfs([ni, nj].join(','));
			}
		}
	}

	function reset() {
		opened = new Set<string>();
		minePositions = new Set<string>();
		board = createBoard();
		(N = board.length), (M = board[0].length);
		boardSize = N * M;
		timerId && clearInterval(timerId);
		timerId = null;
		time = 0;
		updateCellSize();
		state = GameState.PLAYING;
	}

	function startGameTimer() {
		function timer() {
			state == GameState.PLAYING && (time += 1);
		}
		timerId = setInterval(timer, 1000);
	}

	function getFormattedTime(t: number) {
		const minutes = Math.floor(t / 60);
		const seconds = t % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	function strToInt(loc: string): Array<number> {
		let indices = loc.split(',').map((x) => +x);
		return indices;
	}

	let cellSize: number = 1;
	function updateCellSize() {
		if (browser) {
			cellSize = Math.min(
				window.innerWidth / (mode.width * 26), // Width-based size
				window.innerHeight / (mode.height * 26)
			);
		}
	}

	$: if (state === GameState.PLAYING) {
		reset();
		!timerId && startGameTimer();
	}

	$: boardSize - opened.size == mode.mineCount && gameWon();
</script>

{#if state == GameState.START}
	<h1>Minesweeper Game</h1>
	<div class="selectMode">
		<button
			on:click={() => {
				state = GameState.PLAYING;
				mode = easyMode;
			}}>{easyMode.name} - {easyMode.width} x {easyMode.height}</button
		>
		<button
			on:click={() => {
				state = GameState.PLAYING;
				mode = mediumMode;
			}}>{mediumMode.name} - {mediumMode.width} x {mediumMode.height}</button
		>
		<button
			on:click={() => {
				state = GameState.PLAYING;
				mode = hardMode;
			}}>{hardMode.name} - {hardMode.width} x {hardMode.height}</button
		>
	</div>
{/if}

{#if state == GameState.PLAYING || state == GameState.WON || state == GameState.LOST}
	{@const isPlaying = state == GameState.PLAYING}
	<div class="header">
		<button class="homeButton" on:click={() => (state = GameState.START)}>
			{Icons.HOME}
		</button>
		<h2 class="mineCount">{Icons.Mine} : {mode.mineCount}</h2>

		<h2 class="flagButton">
			<button on:click={() => !isPlaying && reset()}>
				<span>
					{#if !isPlaying}
						{Icons.Reload}
					{:else}
						{Icons.Flag}
					{/if}
				</span>
			</button>
		</h2>

		<h2 class="timer">
			{getFormattedTime(time)}
		</h2>
	</div>

	<div class="grid-container" style="--cell-size: {cellSize + 'rem'}">
		<div class="cards" style="grid-template-columns: repeat({mode.width}, 1fr);">
			{#each board as row, rowIndex}
				{#each row as card, cardIndex}
					{@const isOpened = opened.has([rowIndex, cardIndex].join(','))}

					<button
						class="card"
						class:opened={isOpened}
						on:click={() => openCard([rowIndex, cardIndex].join(','))}
					>
						<div class="back" class:opened>{card}</div>
					</button>
				{/each}
			{/each}
		</div>
	</div>
{/if}

<style>
	.grid-container {
		display: flex;
		padding: 0;
		justify-content: center;
		align-items: center;
	}
	.cards {
		display: grid;
		gap: calc(var(--cell-size) / 8);
		padding: 0;
		align-items: center;
		justify-items: center;
	}

	.card {
		height: var(--cell-size);
		width: var(--cell-size);
		padding: 0;
		font-size: calc(var(--cell-size) * 0.6);
		background-color: var(--bg-2);
		transform-style: preserve-3d;

		&.opened .back {
			opacity: 1;
			font-size: calc(var(--cell-size) * 0.6);
			pointer-events: none;
			place-content: center;
			backface-visibility: visible;
			background-color: var(--bg-1);
			transition: opacity 0.3s ease-out;
		}

		& .back {
			opacity: 0;
			width: 100%;
			height: 100%;
			background-color: var(--bg-2);
			border-radius: 2px;
			position: absolute;
			backface-visibility: hidden;
			top: 0;
			left: 0;
			z-index: 2; /* Cover stays above the hidden item */
			transition: opacity 0s ease; /* Smooth fade-out animation */
		}
	}
	.card:hover {
		transform: scale(1.1);
	}

	.timer {
		transition: color 0.3s ease;
		min-width: 80px;
	}

	.mineCount {
		font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
	}

	.header {
		display: flex; /* Flexbox to align items in a row */
		justify-content: space-between; /* Even spacing between items */
		align-items: center; /* Center items vertically */
		width: 40%; /* Adjust as needed */
		margin: 0 auto;
		margin-bottom: 1rem;

		& .flagButton {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			text-align: center;
			border-radius: 4px;
			/* border: 1px solid var(--border); */
		}

		& .flagButton span {
			font-size: 1.6rem;
		}

		& .homeButton {
			display: inline-flex;
			align-items: center;
			font-size: 2rem;
		}
	}

	.selectMode {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 0 auto;
		margin-top: 1.5rem;
		width: 50%;

		& button {
			font-size: 1.6rem;
			font-family: 'Poppins';
			padding: 1.5rem;
			margin: 0.5rem;
			width: max-content;
			border: 2px solid var(--border);
		}
	}
</style>
