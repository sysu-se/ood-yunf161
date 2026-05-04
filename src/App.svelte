<script>
	import { onMount } from 'svelte';
	import { validateSencode } from '@sudoku/sencode';
	import { modal } from '@sudoku/stores/modal';
	import { gameStore, gameView, gameWon } from '@sudoku/gamestore';
	import Board from './components/Board/index.svelte';
	import HintSidebar from './components/HintSidebar.svelte';
	import Controls from './components/Controls/index.svelte';
	import Header from './components/Header/index.svelte';
	import Modal from './components/Modal/index.svelte';
	import { pauseGame, resumeGame } from '@sudoku/game';

	let lastExploreAlertKey = null;

	gameWon.subscribe(won => {
		if (won) {
			pauseGame();
			modal.show('gameover');
		}
	});

	$: exploreAlertKey = $gameView.isExploring && $gameView.isFailed
		? `${$gameView.isBlacklisted ? 'blacklisted' : 'failed'}:${JSON.stringify($gameView.grid)}`
		: null;

	$: if (!exploreAlertKey) {
		lastExploreAlertKey = null;
	}

	$: if (exploreAlertKey && exploreAlertKey !== lastExploreAlertKey && $modal === 'none') {
		lastExploreAlertKey = exploreAlertKey;
		pauseGame();
		modal.show('confirm', {
			title: $gameView.isBlacklisted ? '命中失败分支' : '当前探索已失败',
			text: $gameView.isBlacklisted
				? '当前盘面已经在失败黑名单里，建议直接回退到本次探索的起点。'
				: '当前盘面已经没有合法延展，建议直接回退到本次探索的起点。',
			button: '回退到探索起点',
			onHide: resumeGame,
			callback: () => {
				gameStore.rejectExploration();
			}
		});
	}

	onMount(() => {
		let hash = location.hash;

		if (hash.startsWith('#')) {
			hash = hash.slice(1);
		}

		let sencode;
		if (validateSencode(hash)) {
			sencode = hash;
		}
		
		modal.show('welcome', { onHide: resumeGame, sencode });
	});
</script>

<!-- Timer, Menu, etc. -->
<header>
	<Header />
</header>

<!-- Sudoku Field -->
<section>
	<Board />
</section>

<HintSidebar />

<!-- Keyboard -->
<footer>
	<Controls />
</footer>

<Modal />

<style global>
	@import "./styles/global.css";
</style>