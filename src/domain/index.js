import { Sudoku } from '../node_modules/@sudoku/sudoku_pack.js';
import { Game } from '../node_modules/@sudoku/Game_pack.js';

function createEmptyGrid() {
	return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function assertGame(game) {
	if (!(game instanceof Game)) {
		throw new Error('Expected Game instance');
	}

	return game;
}

export function createSudoku(grid) {
	return new Sudoku(grid);
}
 
export function createSudokuFromJSON(json) {
	const sudoku = new Sudoku();
	sudoku.fromJSON(json);
	return sudoku;
}

export function createGame({ sudoku } = {}) {
	return new Game(sudoku);
}

export function createGameFromJSON(json) {
	const game = new Game();
	game.fromJSON(json);
	return game;
}

export function cloneGame(game) {
	return createGameFromJSON(assertGame(game).toJSON());
}

export function getGameSnapshot(game) {
	if (!game) {
		return {
			grid: createEmptyGrid(),
			initGrid: createEmptyGrid(),
		};
	}

	const sudoku = assertGame(game).getSudoku();
	const { grid, initGrid } = sudoku.toJSON();

	return {
		grid: grid.map(row => [...row]),
		initGrid: initGrid ? initGrid.map(row => [...row]) : createEmptyGrid(),
	};
}

export function isValidGamePosition(pos) {
	return Number.isInteger(pos?.x) && Number.isInteger(pos?.y) && pos.x >= 0 && pos.x < 9 && pos.y >= 0 && pos.y < 9;
}

export function isEditableCell(game, pos) {
	if (!game || !isValidGamePosition(pos)) {
		return false;
	}

	const { initGrid } = getGameSnapshot(game);
	return initGrid[pos.y][pos.x] === 0;
}

export function canApplyGameHint(game, pos) {
	if (!game || !isValidGamePosition(pos) || !isEditableCell(game, pos)) {
		return false;
	}

	const { grid } = getGameSnapshot(game);
	return grid[pos.y][pos.x] === 0;
}

export function projectGame(game) {
	const { grid, initGrid } = getGameSnapshot(game);
	const editableGrid = initGrid.map(row => row.map(cell => cell === 0));

	return {
		grid,
		editableGrid,
		canUndo: canUndoGame(game),
		canRedo: canRedoGame(game),
		isWon: isGameWon(game),
		isExploring: isGameExploring(game),
		isFailed: isGameFailed(game),
		isBlacklisted: isGameBlacklisted(game),
	};
}

export function guessGame(game, move) {
	return assertGame(game).guess(move);
}

export function undoGame(game) {
	assertGame(game).undo();
	return game;
}

export function redoGame(game) {
	assertGame(game).redo();
	return game;
}

export function canUndoGame(game) {
	return game ? assertGame(game).canUndo() : false;
}

export function canRedoGame(game) {
	return game ? assertGame(game).canRedo() : false;
}

export function isGameWon(game) {
	return game ? assertGame(game).getSudoku().isSolved() : false;
}

export function findSelectHint(game, pos) {
	if (!game || !isValidGamePosition(pos) || !isEditableCell(game, pos)) {
		return null;
	}

	const result = game.numbers_to_select(pos);
	return result.length > 0 ? result : null;
}

export function findNextStepHint(game) {
	return game.next_step_hint();
}

export function beginExplorationGame(game) {
	return assertGame(game).begin_exploration();
}

export function acceptExplorationGame(game) {
	return assertGame(game).accept_exploration();
}

export function rejectExplorationGame(game) {
	return assertGame(game).reject_exploration();
}

export function canBeginExploration(game) {
	return game ? assertGame(game).can_explore() : false;
}

export function isGameExploring(game) {
	return game ? assertGame(game).is_exploring() : false;
}

export function isGameFailed(game) {
	return game ? assertGame(game).is_failed() : false;
}

export function isGameBlacklisted(game) {
	return game ? assertGame(game).is_blacklisted() : false;
}


 
export { Sudoku, Game }; 