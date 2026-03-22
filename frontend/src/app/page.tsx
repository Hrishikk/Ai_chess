'use client';

import { GameResult, GameStatus, PieceColor } from '@/common/enums/commom.enum';
/**
 * @module app/page
 * Main chess game page — renders the board, status bar, controls,
 * and game-over overlay. All game logic is delegated to the `useChessGame` hook.
 */

import ChessBoard from '@/components/ChessBoard';
import { useChessGame } from '@/hooks/useChessGame';

/** Root page component for the AI Chess application. */
export default function ChessPage() {
  const {
    gameState,
    selectedSquare,
    legalMoves,
    kingInCheck,
    isGameOver,
    handleSquareClick,
    handleNewGame,
    getStatusMessage,
    statusClass,
  } = useChessGame();

  return (
    <div className="chess-page">
      {/* Header */}
      <header className="chess-header">
        <h1 className="chess-title">
          <span className="title-icon">♔</span>
          AI Chess
        </h1>
        <p className="chess-subtitle">Human vs Computer • Classic Rules</p>
      </header>

      {/* Status bar */}
      <div className={`status-bar ${statusClass()}`}>
        <span className="status-text">{getStatusMessage()}</span>
      </div>

      {/* Board */}
      <ChessBoard
        board={gameState.board}
        selectedSquare={selectedSquare}
        legalMoves={legalMoves}
        kingInCheck={kingInCheck}
        lastMove={gameState.lastMove}
        onSquareClick={handleSquareClick}
      />

      {/* Controls */}
      <div className="controls">
        <button className="new-game-btn" onClick={handleNewGame}>
          ↻ New Game
        </button>
      </div>

      {/* Game over overlay */}
      {isGameOver && (
        <div className="game-over-overlay" onClick={handleNewGame}>
          <div className="game-over-card" onClick={(e) => e.stopPropagation()}>
            <div className="game-over-icon">
              {gameState.status === GameStatus.CHECKMATE
                ? gameState.turn === PieceColor.WHITE ? '♚' : '♔'
                : '½'}
            </div>
            <h2 className="game-over-title">
              {gameState.status === GameStatus.CHECKMATE
                ? gameState.turn === PieceColor.WHITE ? GameStatus.CHECKMATE : GameStatus.CHECKMATE
                : GameStatus.STALEMATE}
            </h2>
            <p className="game-over-subtitle">
              {gameState.status === GameStatus.CHECKMATE
                ? gameState.turn === PieceColor.WHITE
                  ? GameResult.COMPUTER_WINS_MESSAGE
                  : GameResult.HUMAN_WINS_MESSAGE
                : GameResult.DRAW_MESSAGE}
            </p>
            <button className="new-game-btn game-over-btn" onClick={handleNewGame}>
              ↻ Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
