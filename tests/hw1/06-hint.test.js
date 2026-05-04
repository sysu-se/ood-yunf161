import { describe, expect, it } from 'vitest'
import { loadDomainApi, makePuzzle } from './helpers/domain-api.js'

function makeSingleCandidatePuzzle() {
  return [
    [5, 3, 0, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9],
  ]
}

function makeScreenshotLikePuzzle() {
  return [
    [0, 0, 9, 0, 0, 0, 0, 0, 0],
    [6, 5, 0, 0, 7, 0, 0, 8, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 6, 0, 0, 0, 4, 0, 0],
    [0, 0, 1, 3, 0, 0, 9, 0, 5],
    [0, 3, 0, 0, 5, 2, 0, 0, 0],
    [0, 0, 0, 4, 9, 5, 0, 0, 6],
    [0, 0, 0, 1, 2, 8, 0, 0, 7],
    [0, 0, 0, 7, 6, 0, 0, 2, 4],
  ]
}

describe('HW3 hint behavior', () => {
  it('returns candidate numbers for a selected editable cell', async () => {
    const { createGame, createSudoku, findSelectHint } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makePuzzle()) })

    const candidates = findSelectHint(game, { x: 2, y: 0 })

    expect(candidates).toEqual([1, 2, 4])
  })

  it('returns only a forced single-candidate next step', async () => {
    const { createGame, createSudoku, findNextStepHint } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makeSingleCandidatePuzzle()) })

    const hint = findNextStepHint(game)

    expect(hint).toEqual({ x: 2, y: 0, value: 4, type: 'naked-single' })
  })

  it('finds the naked single from the screenshot-like board', async () => {
    const { createGame, createSudoku, findNextStepHint } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makeScreenshotLikePuzzle()) })

    const hint = findNextStepHint(game)

    expect(hint).toEqual({ x: 5, y: 8, value: 3, type: 'naked-single' })
  })
})