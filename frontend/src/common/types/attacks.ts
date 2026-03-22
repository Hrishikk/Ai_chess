/**
 * @module chess/attacks
 * Attack detection — determines whether a square is under attack
 * and whether a king is in check.
 */

import type { Piece, Square } from './types';
import { inBounds, findKing } from './board';
import { PieceColor } from '../enums/commom.enum';

// ─── Directional constants ───────────────────────────────────────────────────

const KNIGHT_OFFSETS: [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const STRAIGHT_DIRS: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const DIAGONAL_DIRS: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

// ─── Square attack detection ─────────────────────────────────────────────────

/**
 * Checks whether any piece of `attackerColor` attacks the given square.
 * Used for check detection and castling validation.
 *
 * @param board - The current board state.
 * @param target - The square to check for attacks.
 * @param attackerColor - The color of the potential attackers.
 * @returns `true` if the square is under attack.
 */
export function isSquareAttacked(
  board: (Piece | null)[][],
  target: Square,
  attackerColor: PieceColor,
): boolean {
  const { row: tr, col: tc } = target;

  // Pawn attacks
  const pawnDir = attackerColor === 'white' ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = tr + pawnDir;
    const pc = tc + dc;
    if (inBounds(pr, pc)) {
      const p = board[pr][pc];
      if (p && p.type === 'pawn' && p.color === attackerColor) return true;
    }
  }

  // Knight attacks
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const nr = tr + dr;
    const nc = tc + dc;
    if (inBounds(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === 'knight' && p.color === attackerColor) return true;
    }
  }

  // King attacks (one square in any direction)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const kr = tr + dr;
      const kc = tc + dc;
      if (inBounds(kr, kc)) {
        const p = board[kr][kc];
        if (p && p.type === 'king' && p.color === attackerColor) return true;
      }
    }
  }

  // Sliding: rook / queen along ranks & files
  if (checkSlidingAttack(board, tr, tc, attackerColor, STRAIGHT_DIRS, ['rook', 'queen'])) {
    return true;
  }

  // Sliding: bishop / queen along diagonals
  if (checkSlidingAttack(board, tr, tc, attackerColor, DIAGONAL_DIRS, ['bishop', 'queen'])) {
    return true;
  }

  return false;
}

/**
 * Checks a set of sliding directions for an attacking piece.
 * @internal
 */
function checkSlidingAttack(
  board: (Piece | null)[][],
  tr: number,
  tc: number,
  attackerColor: PieceColor,
  directions: [number, number][],
  pieceTypes: string[],
): boolean {
  for (const [dr, dc] of directions) {
    let r = tr + dr;
    let c = tc + dc;
    while (inBounds(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === attackerColor && pieceTypes.includes(p.type)) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return false;
}

// ─── Check detection ──────────────────────────────────────────────────────────

/**
 * Returns `true` if the king of the given color is currently in check.
 * @param board - The current board state.
 * @param color - The color of the king to check.
 */
export function isInCheck(board: (Piece | null)[][], color: PieceColor): boolean {
  const kingPos = findKing(board, color);
  const opponent: PieceColor = color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  return isSquareAttacked(board, kingPos, opponent);
}
