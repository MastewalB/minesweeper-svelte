<script lang="ts">
	import { Icons } from './icons.ts';
	type State = 'start' | 'playing' | 'paused' | 'won' | 'lost';

	let state: State = 'start';
	let mineCount: number = 10;
	let boardSize: number = 100;
	let minePositions = new Set<string>();
	let board: (string | number)[][] = createBoard();
	let N = board.length,
		M = board[0].length;
	let opened = new Set<string>();
	let timerId: number | null = null;
	let time = 0;

	function createBoard() {
		let mineSet = new Set<string>();
		let arr: (string | number)[][] = [];
		for (let i = 0; i < 10; i++) {
			arr.push(Array.from({ length: 10 }, () => 0));
		}
		while (mineSet.size < mineCount) {
			mineSet.add([Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)].join(''));
		}
		for (let [i, j] of mineSet) {
			arr[+i][+j] = Icons.Explode;
		}
		minePositions = mineSet;
		return calculateDistance(arr);
		// return ([] as (string | number)[]).concat(...calculateDistance(arr))
	}

	function calculateDistance(arr: (string | number)[][]) {
		let N = arr.length,
			M = arr[0].length;
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
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
		for (let i = 0; i < 10; i++) {
			for (let j = 0; j < 10; j++) {
				if (arr[i][j] == 0) {
					arr[i][j] = '';
				}
			}
		}
		return arr;
	}

	function openCard(location: string) {
		opened = opened.add(location);
		if (board[+location[0]][+location[1]] == '') {
			dfs(location);
		} else if (minePositions.has(location)) {
			state = 'lost'
			for (let mineLoc of minePositions) {
				opened.add(mineLoc);
			} 
		}
	}

	function gameWon() {
		state = 'won';
		for (let mineLoc of minePositions) {
			opened.add(mineLoc);
			let [i, j] = mineLoc
			board[+i][+j] = Icons.Flag
		} 
	}

	function dfs(index: string) {
		let [i, j] = index;
		if (typeof board[+i][+j] == 'number') {
			return;
		}
		let DIR = [-1, 0, 1, 0, -1, -1, 1, 1, -1];

		for (let d = 0; d < 8; d++) {
			let ni = +i + DIR[d],
				nj = +j + DIR[d + 1];
			if (ni >= 0 && nj >= 0 && ni < N && nj < M && !opened.has([ni, nj].join(''))) {
				opened.add([ni, nj].join(''));
				dfs([ni, nj].join(''));
			}
		}
	}

	function reset() {
		opened = new Set<string>();
		minePositions = new Set<string>();
		board = createBoard();
		timerId && clearInterval(timerId);
		timerId = null;
		time = 0;
		state = 'playing'
	}

	function startGameTimer() {
		function timer() {
			state == 'playing' && (time += 1);
		}
		timerId = setInterval(timer, 1000);
	}

	function getFormattedTime(t: number) {
		const minutes = Math.floor(t / 60);
		const seconds = t % 60;
		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

	}

	$: if (state === 'playing') {
		!timerId && startGameTimer();
	}

	$: boardSize - opened.size == mineCount && gameWon();
</script>

{#if state == 'start'}
	<h1>Minesweeper Game</h1>
	<button on:click={() => (state = 'playing')}>Play</button>
{/if}

{#if state == 'playing' || state == 'won' || state == 'lost'}
{@const isPlaying = (state == 'playing')}
<div class="header">
	<h2 class="mineCount">{Icons.Mine} : {mineCount}</h2>

	<h2 class="flagButton">
		<button on:click={() => !isPlaying && reset()}>
			{#if !isPlaying}
				{Icons.Reload}
			{:else} {Icons.Flag}
			{/if}
		</button>
	</h2>

	<h2 class="timer">
		{getFormattedTime(time)}
	</h2>
</div>
	
	<div class="cards">
		{#each board as row, rowIndex}
			{#each row as card, cardIndex}
				{@const isOpened = opened.has([rowIndex, cardIndex].join(''))}

				<button
					class="card"
					class:opened={isOpened}
					on:click={() => openCard([rowIndex, cardIndex].join(''))}
				>
					<div class="back" class:opened>{card}</div>
				</button>
			{/each}
		{/each}
	</div>
{/if}


<style>
	.cards {
		display: grid;
		grid-template-columns: repeat(10, 1fr);
		gap: 0.5rem;
	}

	.card {
		height: 1rem;
		width: 1rem;
		font-size: 2rem;
		background-color: var(--bg-2);
		transform-style: preserve-3d;

		&.opened .back {
			opacity: 1;
			font-size: 2rem;
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
      width: 100%; /* Adjust as needed */
	  margin-bottom: 2rem;
    }

	.header .flagButton {
		font-size: 10px;
		border-radius: 4px;
		border: 1px solid var(--border);
	}
</style>
