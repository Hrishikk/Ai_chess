/**
 * @module chess/game
 * High-level game operations: legal move filtering, move execution,
 * and game status detection (check, checkmate, stalemate).
 */

import type { Piece, Square, Move, GameState } from './types';
import { PieceColor, GameStatus, PieceType } from '../enums/commom.enum';
import { cloneBoard } from './board';
import { isInCheck } from './attacks';
import { getPseudoLegalMoves } from './moves';

// ─── Legal Move Filtering ────────────────────────────────────────────────────

/**
 * Returns all **legal** moves for the piece at `from`.
 * Filters pseudo-legal moves by simulating each and verifying
 * the player's own king is not left in check.
 *
 * @param state - The current game state.
 * @param from - The square containing the piece to move.
 */
export function getLegalMoves(state: GameState, from: Square): Move[] {
  const piece = state.board[from.row][from.col];
  if (!piece) return [];

  return getPseudoLegalMoves(state, from).filter((move) => {
    const newBoard = cloneBoard(state.board);

    // En passant: remove captured pawn
    if (move.isEnPassant) {
      newBoard[from.row][move.to.col] = null;
    }

    // Move the piece
    newBoard[move.to.row][move.to.col] = newBoard[from.row][from.col];
    newBoard[from.row][from.col] = null;

    // Castling: also move the rook
    if (move.isCastling) {
      if (move.to.col === from.col + 2) {
        newBoard[from.row][from.col + 1] = newBoard[from.row][7];
        newBoard[from.row][7] = null;
      } else {
        newBoard[from.row][from.col - 1] = newBoard[from.row][0];
        newBoard[from.row][0] = null;
      }
    }

    return !isInCheck(newBoard, piece.color);
  });
}

/**
 * Returns all legal moves for every piece of the given color.
 * Used for computer move selection and checkmate/stalemate detection.
 *
 * @param state - The current game state.
 * @param color - The color to generate moves for.
 */
export function getAllLegalMoves(state: GameState, color: PieceColor): Move[] {
  const allMoves: Move[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece && piece.color === color) {
        allMoves.push(...getLegalMoves(state, { row: r, col: c }));
      }
    }
  }
  return allMoves;
}

// ─── Move Execution ──────────────────────────────────────────────────────────

/**
 * Applies a move to the game state **immutably** and returns the new state.
 * Handles captures, en passant, castling, pawn promotion (auto-queen),
 * castling rights updates, and turn toggling.
 *
 * @param state - The current game state.
 * @param move - The move to apply.
 * @returns A new `GameState` with the move applied and status updated.
 */
export function makeMove(state: GameState, move: Move): GameState {
  const newBoard = cloneBoard(state.board);
  const piece = newBoard[move.from.row][move.from.col]!;
  const newCastling = { ...state.castlingRights };

  // En passant capture
  if (move.isEnPassant) {
    newBoard[move.from.row][move.to.col] = null;
  }

  // Move the piece
  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;

  // Castling: also move the rook
  if (move.isCastling) {
    if (move.to.col === move.from.col + 2) {
      newBoard[move.from.row][move.from.col + 1] = newBoard[move.from.row][7];
      newBoard[move.from.row][7] = null;
    } else {
      newBoard[move.from.row][move.from.col - 1] = newBoard[move.from.row][0];
      newBoard[move.from.row][0] = null;
    }
  }

  // Auto-promote to queen
  if (move.isPromotion) {
    newBoard[move.to.row][move.to.col] = { type: PieceType.QUEEN, color: piece.color };
  }

  // En passant target for the next move
  let enPassantTarget: Square | null = null;
  if (piece.type === PieceType.PAWN && Math.abs(move.to.row - move.from.row) === 2) {
    enPassantTarget = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
  }

  // Update castling rights
  updateCastlingRights(newCastling, piece, move);

  const nextTurn: PieceColor = state.turn === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

  const newState: GameState = {
    board: newBoard,
    turn: nextTurn,
    castlingRights: newCastling,
    enPassantTarget,
    status: GameStatus.PLAYING,
    lastMove: move,
  };

  newState.status = getGameStatus(newState);
  return newState;
}

/**
 * Updates castling rights after a move — called internally by `makeMove`.
 * @internal
 */
function updateCastlingRights(
  rights: GameState['castlingRights'],
  piece: Piece,
  move: Move,
): void {
  if (piece.type === PieceType.KING) {
    if (piece.color === PieceColor.WHITE) { rights.whiteKingside = false; rights.whiteQueenside = false; }
    else { rights.blackKingside = false; rights.blackQueenside = false; }
  }
  if (piece.type === PieceType.ROOK) {
    if (piece.color === PieceColor.WHITE) {
      if (move.from.row === 7 && move.from.col === 7) rights.whiteKingside = false;
      if (move.from.row === 7 && move.from.col === 0) rights.whiteQueenside = false;
    } else {
      if (move.from.row === 0 && move.from.col === 7) rights.blackKingside = false;
      if (move.from.row === 0 && move.from.col === 0) rights.blackQueenside = false;
    }
  }
  // Captured rook loses its castling right
  if (move.to.row === 0 && move.to.col === 0) rights.blackQueenside = false;
  if (move.to.row === 0 && move.to.col === 7) rights.blackKingside = false;
  if (move.to.row === 7 && move.to.col === 0) rights.whiteQueenside = false;
  if (move.to.row === 7 && move.to.col === 7) rights.whiteKingside = false;
}

// ─── Game Status Detection ───────────────────────────────────────────────────

/**
 * Determines the current game status for the player whose turn it is.
 *
 * @param state - The current game state.
 * @returns `'checkmate'` | `'stalemate'` | `'check'` | `'playing'`
 */
export function getGameStatus(state: GameState): GameStatus {
  const inCheck = isInCheck(state.board, state.turn);
  const hasLegalMoves = getAllLegalMoves(state, state.turn).length > 0;

  if (inCheck && !hasLegalMoves) return GameStatus.CHECKMATE;
  if (!inCheck && !hasLegalMoves) return GameStatus.STALEMATE;
  if (inCheck) return GameStatus.CHECK;
  return GameStatus.PLAYING;
}
