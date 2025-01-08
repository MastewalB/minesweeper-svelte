<script lang="ts">
	import { icons } from './icons.ts';
	type State = 'start' | 'playing' | 'paused' | 'won' | 'lost';

	let state: State = 'start';
	let mineCount: number = 10;
	let boardSize: number = 100;
	let board: (string | number)[][] = createBoard();
	let opened = new Set<string>();

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
			arr[+i][+j] = icons[0];
		}
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
	}

	function gameWon() {
		state = 'won';
	}

	$: boardSize - opened.size == mineCount && gameWon();
	$: console.log(opened);
</script>

{#if state == 'start'}
	<h1>Minesweeper Game</h1>
	<button on:click={() => (state = 'playing')}>Play</button>
{/if}

{#if state == 'playing'}
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
		gap: 0.4rem;
	}

	.card {
		height: 80px;
		width: 80px;
		font-size: 2rem;
		background-color: var(--bg-2);
		transform-style: preserve-3d;

		&.opened .back {
			opacity: 1;
			font-size: 2.5rem;
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
			border-radius: 8px;
			position: absolute;
			backface-visibility: hidden;
			top: 0;
			left: 0;
			z-index: 2; /* Cover stays above the hidden item */
			transition: opacity 0.5s ease; /* Smooth fade-out animation */
		}
	}
	.card:hover {
		transform: scale(1.1);
	}
</style>
