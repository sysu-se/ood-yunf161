import { describe, expect, it } from 'vitest'
import { loadDomainApi, makePuzzle, normalizeGrid } from './helpers/domain-api.js'

function makeFailedPuzzle() {
  return [
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    [9, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
}

describe('HW3 exploration mode', () => {
  it('detects a failed board with no legal candidate', async () => {
    const { createGame, createSudoku } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makeFailedPuzzle()) })

    expect(game.is_blacklisted()).toBe(false)
    expect(game.is_failed()).toBe(true)
  })

  it('rejecting a non-failed exploration restores the base board without blacklisting it', async () => {
    const { createGame, createSudoku } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makePuzzle()) })
    const baseGrid = normalizeGrid(game.getSudoku().getGrid())

    expect(game.begin_exploration()).toBe(true)
    expect(game.guess({ row: 0, col: 2, value: 4 })).toBe(true)

    const failedBranch = game.getSudoku().toJSON()

    expect(game.reject_exploration()).toBe(true)
    expect(game.is_exploring()).toBe(false)
    expect(game.getSudoku().getGrid()).toEqual(baseGrid)
    expect(game.is_in_failed_cases(failedBranch)).toBe(false)

    expect(game.guess({ row: 0, col: 2, value: 4 })).toBe(true)
    expect(game.is_blacklisted()).toBe(false)
  })

  it('rejecting a failed exploration records the failed branch in blacklist', async () => {
    const { createGame, createSudoku } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makeFailedPuzzle()) })

    expect(game.begin_exploration()).toBe(true)

    const failedBranch = game.getSudoku().toJSON()

    expect(game.reject_exploration()).toBe(true)
    expect(game.is_exploring()).toBe(false)
    expect(game.is_in_failed_cases(failedBranch)).toBe(true)

    expect(game.is_blacklisted()).toBe(true)
    expect(game.is_failed()).toBe(true)
  })

  it('accepting exploration keeps the explored board', async () => {
    const { createGame, createSudoku } = await loadDomainApi()
    const game = createGame({ sudoku: createSudoku(makePuzzle()) })

    expect(game.begin_exploration()).toBe(true)
    expect(game.guess({ row: 0, col: 2, value: 4 })).toBe(true)
    expect(game.accept_exploration()).toBe(true)

    expect(game.is_exploring()).toBe(false)
    expect(game.getSudoku().getGrid()[0][2]).toBe(4)
  })
})