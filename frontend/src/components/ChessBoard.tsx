'use client';

/**
 * @module components/ChessBoard
 * Renders the 8×8 chessboard with pieces, selection highlights,
 * legal-move indicators, check glow, and last-move markers.
 */

import type { Piece, Square, Move } from '@/common/types';
import { getPieceSymbol } from '@/common/types';

/** Props accepted by the `ChessBoard` component. */
interface ChessBoardProps {
  /** 8×8 array of pieces (or null for empty squares). */
  board: (Piece | null)[][];
  /** The currently selected square, or null if nothing is selected. */
  selectedSquare: Square | null;
  /** Legal destination moves for the selected piece. */
  legalMoves: Move[];
  /** Square of the king that is in check, or null. */
  kingInCheck: Square | null;
  /** The last move made (for subtle highlighting), or null. */
  lastMove: Move | null;
  /** Callback fired when any square is clicked. */
  onSquareClick: (square: Square) => void;
}

/**
 * Renders an interactive chessboard.
 *
 * Features:
 * - Classic light/dark square coloring
 * - Gold highlight on the selected piece
 * - Dot overlays for legal move destinations
 * - Red radial glow on a king in check
 * - Subtle highlight on the last-move squares
 */
export default function ChessBoard({
  board, selectedSquare, legalMoves, kingInCheck, lastMove, onSquareClick,
}: ChessBoardProps) {
  const isLegalTarget = (row: number, col: number) =>
    legalMoves.some((m) => m.to.row === row && m.to.col === col);

  const isSelected = (row: number, col: number) =>
    selectedSquare !== null && selectedSquare.row === row && selectedSquare.col === col;

  const isKingInCheck = (row: number, col: number) =>
    kingInCheck !== null && kingInCheck.row === row && kingInCheck.col === col;

  const isLastMoveSquare = (row: number, col: number) =>
    lastMove !== null &&
    ((lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col));

  return (
    <div className="chess-board-wrapper">
      {/* Rank labels (1–8) */}
      <div className="rank-labels">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((rank) => (
          <div key={rank} className="rank-label">{rank}</div>
        ))}
      </div>

      <div className="chess-board-container">
        <div className="chess-board">
          {board.map((rowArr, row) =>
            rowArr.map((piece, col) => {
              const isLight = (row + col) % 2 === 0;
              const selected = isSelected(row, col);
              const legalTarget = isLegalTarget(row, col);
              const inCheck = isKingInCheck(row, col);
              const lastHighlight = isLastMoveSquare(row, col);

              let cls = `square ${isLight ? 'light' : 'dark'}`;
              if (selected) cls += ' selected';
              if (inCheck) cls += ' in-check';
              if (lastHighlight) cls += ' last-move';

              return (
                <div key={`${row}-${col}`} className={cls} onClick={() => onSquareClick({ row, col })}>
                  {piece && <span className={`piece ${piece.color}`}>{getPieceSymbol(piece)}</span>}
                  {legalTarget && <div className={`legal-dot ${piece ? 'capture' : ''}`} />}
                </div>
              );
            }),
          )}
        </div>

        {/* File labels (a–h) */}
        <div className="file-labels">
          {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((file) => (
            <div key={file} className="file-label">{file}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
