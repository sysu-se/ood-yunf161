<script>
	import { candidates } from '@sudoku/stores/candidates';
	import { gameStore, gameView } from '@sudoku/gamestore';
	import { pauseGame, resumeGame } from '@sudoku/game';
	import { modal } from '@sudoku/stores/modal';
	import { cursor } from '@sudoku/stores/cursor';
	import { hintPanel } from '@sudoku/stores/hintPanel';
	import { hints } from '@sudoku/stores/hints';
	import { notes } from '@sudoku/stores/notes';
	import { settings } from '@sudoku/stores/settings';
	import { keyboardDisabled } from '@sudoku/stores/keyboard';
	import { gamePaused } from '@sudoku/gamestore';

	$: hasSelection = $cursor.x !== null && $cursor.y !== null;
	$: hintsAvailable = $hints > 0;
	$: currentCellValue =
		$cursor.x === null || $cursor.y === null
			? null
			: $gameView.grid[$cursor.y][$cursor.x];
	$: selectHint = hasSelection && $gameView ? gameStore.getSelectHint($cursor) : null;
	$: nextStepHint = $gameView ? gameStore.getNextStepHint() : null;
	$: canUndo = !$gamePaused && $gameView.canUndo;
	$: canRedo = !$gamePaused && $gameView.canRedo;
	$: canHint = !$keyboardDisabled && hintsAvailable && currentCellValue !== null && gameStore.canHint($cursor);
	$: canShowSelectHint = !$gamePaused && hasSelection;
	$: isExploring = $gameView?.isExploring ?? false;
	$: canStartExploration = !$gamePaused && !isExploring && gameStore.canBeginExploration();
	$: canFinishExploration = !$gamePaused && isExploring;

	function handleUndo() {
		if (canUndo) {
			gameStore.undo();
		}
	}

	function handleRedo() {
		if (canRedo) {
			gameStore.redo();
		}
	}

	function handleHint() {
		if (canHint) {
			if ($candidates.hasOwnProperty($cursor.x + ',' + $cursor.y)) {
				candidates.clear($cursor);
			}

			gameStore.applyHint($cursor);
		}
	}

	function handleSelectHint() {
		if (canShowSelectHint) {
			hintPanel.showSelectHint($cursor, selectHint);
		}
	}

	function handleNextStepHint() {
		if (!$gamePaused) {
			hintPanel.showNextStepHint(nextStepHint);
		}
	}

	function handleExploration() {
		if (canStartExploration) {
			gameStore.beginExploration();
			return;
		}

		if (!canFinishExploration) {
			return;
		}

		pauseGame();
		modal.show('exploreDecision', {
			title: '结束探索模式',
			text: '你可以接受当前探索结果，或者放弃这次探索并回到起点。',
			acceptButton: '接受当前结果',
			rejectButton: '放弃本次探索',
			onHide: resumeGame,
			onAccept: () => {
				gameStore.acceptExploration();
			},
			onReject: () => {
				gameStore.rejectExploration();
			}
		});
	}
</script>

<div class="action-buttons space-x-3">

	<button class="btn btn-round" disabled={!canUndo} on:click={handleUndo} title="Undo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={!canRedo} on:click={handleRedo} title="Redo">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
		</svg>
	</button>

	<button class="btn btn-round" on:click={handleNextStepHint} title="Show next step hint">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m0 0l-4-4m4 4l-4 4" />
		</svg>
	</button>

	<button class="btn btn-round" disabled={!canShowSelectHint} on:click={handleSelectHint} title="Show selected cell hint">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h12M4 18h8" />
		</svg>
	</button>

	<button class="btn btn-round btn-badge" disabled={!canStartExploration && !canFinishExploration} on:click={handleExploration} title={isExploring ? '结束探索模式' : '开始探索模式'}>
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h7l2 3h7M6 17l4-4-4-4m8 8l4-4-4-4" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={isExploring}>{isExploring ? 'EXP' : 'TRY'}</span>
	</button>

	<button class="btn btn-round btn-badge" disabled={!canHint} on:click={handleHint} title="Hints ({$hints})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
		</svg>

		{#if $settings.hintsLimited}
			<span class="badge" class:badge-primary={hintsAvailable}>{$hints}</span>
		{/if}
	</button>

	<button class="btn btn-round btn-badge" on:click={notes.toggle} title="Notes ({$notes ? 'ON' : 'OFF'})">
		<svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
		</svg>

		<span class="badge tracking-tighter" class:badge-primary={$notes}>{$notes ? 'ON' : 'OFF'}</span>
	</button>

</div>


<style>
	.action-buttons {
		@apply flex flex-wrap justify-evenly self-end;
	}

	.btn-badge {
		@apply relative;
	}

	.badge {
		min-height: 20px;
		min-width:  20px;
		@apply p-1 rounded-full leading-none text-center text-xs text-white bg-gray-600 inline-block absolute top-0 left-0;
	}

	.badge-primary {
		@apply bg-primary;
	}
</style>