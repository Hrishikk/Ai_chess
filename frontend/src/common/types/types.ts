/**
 * @module chess/types
 * Core type definitions for the chess engine.
 */

// ─── Piece Types ──────────────────────────────────────────────────────────────

import { PieceColor, PieceType } from "../enums/commom.enum";

/** Represents a single chess piece on the board. */
export interface Piece {
  type: PieceType;
  color: PieceColor;
}

// ─── Board Types ──────────────────────────────────────────────────────────────

/**
 * Represents a position on the board.
 * Row 0 = rank 8 (top), row 7 = rank 1 (bottom).
 * Col 0 = a-file (left), col 7 = h-file (right).
 */
export interface Square {
  row: number;
  col: number;
}

/**
 * Represents a chess move from one square to another,
 * with optional flags for special move types.
 */
export interface Move {
  from: Square;
  to: Square;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isPromotion?: boolean;
}

// ─── Game State Types ─────────────────────────────────────────────────────────

/** Current status of the game for the active player. */
export type GameStatus = 'playing' | 'check' | 'checkmate' | 'stalemate';

/** Tracks which castling moves are still available. */
export interface CastlingRights {
  whiteKingside: boolean;
  whiteQueenside: boolean;
  blackKingside: boolean;
  blackQueenside: boolean;
}

/** Complete snapshot of a chess game at a given point. */
export interface GameState {
  board: (Piece | null)[][];
  turn: PieceColor;
  castlingRights: CastlingRights;
  enPassantTarget: Square | null;
  status: GameStatus;
  lastMove: Move | null;
}

// ─── Piece Symbols ────────────────────────────────────────────────────────────

/** Unicode chess symbols mapped by color and piece type. */
const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  white: { king: '♔', queen: '♕', rook: '♖', bishop: '♗', knight: '♘', pawn: '♙' },
  black: { king: '♚', queen: '♛', rook: '♜', bishop: '♝', knight: '♞', pawn: '♟' },
};

/**
 * Returns the Unicode symbol for a given piece.
 * @param piece - The piece to get the symbol for.
 * @returns A Unicode chess character (e.g. '♔', '♟').
 */
export function getPieceSymbol(piece: Piece): string {
  return PIECE_SYMBOLS[piece.color][piece.type];
}
