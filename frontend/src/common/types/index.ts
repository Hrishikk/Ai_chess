/**
 * @module chess
 * Barrel re-export for the chess engine.
 * Allows importing from `@/lib/chess` without knowing the internal file structure.
 */

export type {
  Piece,
  Square,
  Move,
  GameState,
  CastlingRights,
} from './types';

export { getPieceSymbol } from './types';
export { createInitialState } from './board';
export { isSquareAttacked, isInCheck } from './attacks';
export { getLegalMoves, getAllLegalMoves, makeMove, getGameStatus } from './game';
