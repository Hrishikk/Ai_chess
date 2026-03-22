/**
 * @module chess/moves
 * Pseudo-legal move generation for each piece type.
 * These moves do not account for leaving own king in check —
 * that filtering happens in the `game` module.
 */
import type { Piece, Square, Move, CastlingRights, GameState } from './types';
import { PieceColor } from '../enums/commom.enum';
import { inBounds } from './board';
import { isSquareAttacked } from './attacks';

/** Generates pseudo-legal pawn moves including forward, captures, and en passant. */
export function getPawnMoves(
  board: (Piece | null)[][], row: number, col: number,
  color: PieceColor, enPassantTarget: Square | null,
): Move[] {
  const moves: Move[] = [];
  const dir = color === 'white' ? -1 : 1;
  const startRow = color === 'white' ? 6 : 1;
  const oneR = row + dir;
  if (inBounds(oneR, col) && !board[oneR][col]) {
    const isPromotion = oneR === 0 || oneR === 7;
    moves.push({ from: { row, col }, to: { row: oneR, col }, isPromotion });
    const twoR = row + 2 * dir;
    if (row === startRow && inBounds(twoR, col) && !board[twoR][col]) {
      moves.push({ from: { row, col }, to: { row: twoR, col } });
    }
  }
  for (const dc of [-1, 1]) {
    const cr = row + dir;
    const cc = col + dc;
    if (!inBounds(cr, cc)) continue;
    const target = board[cr][cc];
    if (target && target.color !== color) {
      const isPromotion = cr === 0 || cr === 7;
      moves.push({ from: { row, col }, to: { row: cr, col: cc }, isPromotion });
    }
    if (enPassantTarget && enPassantTarget.row === cr && enPassantTarget.col === cc) {
      moves.push({ from: { row, col }, to: { row: cr, col: cc }, isEnPassant: true });
    }
  }
  return moves;
}

/** Generates sliding moves along given directions until blocked. @internal */
function getSlidingMoves(
  board: (Piece | null)[][], row: number, col: number,
  color: PieceColor, directions: [number, number][],
): Move[] {
  const moves: Move[] = [];
  for (const [dr, dc] of directions) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c)) {
      const target = board[r][c];
      if (target) {
        if (target.color !== color) moves.push({ from: { row, col }, to: { row: r, col: c } });
        break;
      }
      moves.push({ from: { row, col }, to: { row: r, col: c } });
      r += dr; c += dc;
    }
  }
  return moves;
}

/** Generates rook moves (horizontal + vertical sliding). */
export function getRookMoves(board: (Piece | null)[][], row: number, col: number, color: PieceColor): Move[] {
  return getSlidingMoves(board, row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
}

/** Generates bishop moves (diagonal sliding). */
export function getBishopMoves(board: (Piece | null)[][], row: number, col: number, color: PieceColor): Move[] {
  return getSlidingMoves(board, row, col, color, [[-1, -1], [-1, 1], [1, -1], [1, 1]]);
}

/** Generates queen moves (all 8 sliding directions). */
export function getQueenMoves(board: (Piece | null)[][], row: number, col: number, color: PieceColor): Move[] {
  return getSlidingMoves(board, row, col, color, [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]);
}

/** Generates knight moves (L-shaped jumps). */
export function getKnightMoves(board: (Piece | null)[][], row: number, col: number, color: PieceColor): Move[] {
  const moves: Move[] = [];
  const offsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
  for (const [dr, dc] of offsets) {
    const nr = row + dr, nc = col + dc;
    if (inBounds(nr, nc)) {
      const target = board[nr][nc];
      if (!target || target.color !== color) moves.push({ from: { row, col }, to: { row: nr, col: nc } });
    }
  }
  return moves;
}

/**
 * Generates king moves including castling.
 * Castling requires: king & rook unmoved, king not in check,
 * king doesn't pass through or land on attacked squares.
 */
export function getKingMoves(
  board: (Piece | null)[][], row: number, col: number,
  color: PieceColor, castlingRights: CastlingRights,
): Move[] {
  const moves: Move[] = [];
  const opponent: PieceColor = color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr, nc = col + dc;
      if (inBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color !== color) moves.push({ from: { row, col }, to: { row: nr, col: nc } });
      }
    }
  }
  if (!isSquareAttacked(board, { row, col }, opponent)) {
    addCastlingMoves(board, row, col, color, opponent, castlingRights, moves);
  }
  return moves;
}

/** Appends castling moves if conditions are met. @internal */
function addCastlingMoves(
  board: (Piece | null)[][], row: number, col: number,
  color: PieceColor, opponent: PieceColor, rights: CastlingRights, moves: Move[],
): void {
  const canKingside = color === 'white' ? rights.whiteKingside : rights.blackKingside;
  if (canKingside && !board[row][col + 1] && !board[row][col + 2]) {
    if (!isSquareAttacked(board, { row, col: col + 1 }, opponent) &&
      !isSquareAttacked(board, { row, col: col + 2 }, opponent)) {
      moves.push({ from: { row, col }, to: { row, col: col + 2 }, isCastling: true });
    }
  }
  const canQueenside = color === 'white' ? rights.whiteQueenside : rights.blackQueenside;
  if (canQueenside && !board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3]) {
    if (!isSquareAttacked(board, { row, col: col - 1 }, opponent) &&
      !isSquareAttacked(board, { row, col: col - 2 }, opponent)) {
      moves.push({ from: { row, col }, to: { row, col: col - 2 }, isCastling: true });
    }
  }
}

/** Returns all pseudo-legal moves for the piece at the given square (no king-safety filter). */
export function getPseudoLegalMoves(state: GameState, from: Square): Move[] {
  const piece = state.board[from.row][from.col];
  if (!piece) return [];
  const { board } = state;
  const { row, col } = from;
  switch (piece.type) {
    case 'pawn': return getPawnMoves(board, row, col, piece.color, state.enPassantTarget);
    case 'rook': return getRookMoves(board, row, col, piece.color);
    case 'knight': return getKnightMoves(board, row, col, piece.color);
    case 'bishop': return getBishopMoves(board, row, col, piece.color);
    case 'queen': return getQueenMoves(board, row, col, piece.color);
    case 'king': return getKingMoves(board, row, col, piece.color, state.castlingRights);
    default: return [];
  }
}
