/**
 * @module chess/board
 * Board representation helpers and initial position setup.
 */

import type { Piece, Square, GameState } from './types';
import { GameStatus, PieceColor, PieceType } from '../enums/commom.enum';

// ─── Board Utilities ──────────────────────────────────────────────────────────

/**
 * Checks whether a (row, col) coordinate is within the 8×8 board.
 * @param row - Row index (0–7).
 * @param col - Column index (0–7).
 */
export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

/**
 * Creates a deep clone of the board array (pieces are shallow-copied).
 * @param board - The board to clone.
 */
export function cloneBoard(board: (Piece | null)[][]): (Piece | null)[][] {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

/**
 * Returns `true` if two squares refer to the same position.
 * @param a - First square.
 * @param b - Second square.
 */
export function squaresEqual(a: Square, b: Square): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Finds the position of the king of the given color.
 * @param board - Current board state.
 * @param color - Color of the king to find.
 * @returns The square containing the king.
 */
export function findKing(board: (Piece | null)[][], color: PieceColor): Square {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'king' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  // Should never happen in a valid game
  return { row: 0, col: 0 };
}

// ─── Initial Position ─────────────────────────────────────────────────────────

/**
 * Creates and returns the standard starting game state with all pieces
 * in their initial positions, full castling rights, and white to move.
 */
export function createInitialState(): GameState {
  const board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array(8).fill(null),
  );

  const backRank: PieceType[] = [
    PieceType.ROOK, PieceType.KNIGHT, PieceType.BISHOP, PieceType.QUEEN, PieceType.KING, PieceType.BISHOP, PieceType.KNIGHT, PieceType.ROOK,
  ];

  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRank[c], color: PieceColor.BLACK };
    board[1][c] = { type: PieceType.PAWN, color: PieceColor.BLACK };
    board[6][c] = { type: PieceType.PAWN, color: PieceColor.WHITE };
    board[7][c] = { type: backRank[c], color: PieceColor.WHITE };
  }

  return {
    board,
    turn: PieceColor.WHITE,
    castlingRights: {
      whiteKingside: true,
      whiteQueenside: true,
      blackKingside: true,
      blackQueenside: true,
    },
    enPassantTarget: null,
    status: GameStatus.PLAYING,
    lastMove: null,
  };
}
