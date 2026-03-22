'use client';

/**
 * @module hooks/useChessGame
 * Custom hook encapsulating all chess game state, user interaction logic,
 * computer move scheduling, and status computation.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  createInitialState,
  getLegalMoves,
  getAllLegalMoves,
  makeMove,
  type GameState,
  type Square,
  type Move,
} from '@/common/types';
import { GameResult, GameStatus, GameStatusClass, PieceColor, PieceType } from '@/common/enums/commom.enum';

/** Return type of the `useChessGame` hook. */
export interface ChessGameControls {
  gameState: GameState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  kingInCheck: Square | null;
  isComputerThinking: boolean;
  isGameOver: boolean;
  handleSquareClick: (square: Square) => void;
  handleNewGame: () => void;
  getStatusMessage: () => string;
  statusClass: () => string;
}

/**
 * Manages the complete chess game lifecycle:
 * - Board state and turn tracking
 * - Piece selection and legal move highlighting
 * - Move execution with validation
 * - Computer opponent (random legal move with delay)
 * - Game-over detection
 *
 * @returns Controls and state for rendering the chess game UI.
 */
export function useChessGame(): ChessGameControls {
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const computerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (computerTimerRef.current) clearTimeout(computerTimerRef.current);
    };
  }, []);

  // Determine king-in-check square for red highlight
  const kingInCheck: Square | null = (() => {
    if (gameState.status === GameStatus.CHECK || gameState.status === GameStatus.CHECKMATE) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = gameState.board[r][c];
          if (p && p.type === PieceType.KING && p.color === gameState.turn) {
            return { row: r, col: c };
          }
        }
      }
    }
    return null;
  })();

  /** Schedules the computer to play a random legal move after a short delay. */
  const triggerComputerMove = useCallback((state: GameState) => {
    setIsComputerThinking(true);
    computerTimerRef.current = setTimeout(() => {
      const moves = getAllLegalMoves(state, PieceColor.BLACK);
      if (moves.length > 0) {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        setGameState(makeMove(state, randomMove));
      }
      setIsComputerThinking(false);
    }, 300 + Math.random() * 200);
  }, []);

  /** Handles clicking any square on the board. */
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (isComputerThinking) return;
      if (gameState.status === GameStatus.CHECKMATE || gameState.status === GameStatus.STALEMATE) return;
      if (gameState.turn !== PieceColor.WHITE) return;

      const piece = gameState.board[square.row][square.col];

      if (selectedSquare) {
        // Same piece → deselect
        if (selectedSquare.row === square.row && selectedSquare.col === square.col) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        // Legal destination → execute move
        const move = legalMoves.find(
          (m) => m.to.row === square.row && m.to.col === square.col,
        );
        if (move) {
          const newState = makeMove(gameState, move);
          setGameState(newState);
          setSelectedSquare(null);
          setLegalMoves([]);
          if (newState.status !== GameStatus.CHECKMATE && newState.status !== GameStatus.STALEMATE) {
            triggerComputerMove(newState);
          }
          return;
        }

        // Another friendly piece → re-select
        if (piece && piece.color === PieceColor.WHITE) {
          setSelectedSquare(square);
          setLegalMoves(getLegalMoves(gameState, square));
          return;
        }

        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // No selection → select a white piece
      if (piece && piece.color === PieceColor.WHITE) {
        setSelectedSquare(square);
        setLegalMoves(getLegalMoves(gameState, square));
      }
    },
    [gameState, selectedSquare, legalMoves, isComputerThinking, triggerComputerMove],
  );

  /** Resets the game to the starting position. */
  const handleNewGame = useCallback(() => {
    if (computerTimerRef.current) clearTimeout(computerTimerRef.current);
    setGameState(createInitialState());
    setSelectedSquare(null);
    setLegalMoves([]);
    setIsComputerThinking(false);
  }, []);

  /** Returns a human-readable status message. */
  const getStatusMessage = useCallback((): string => {
    if (gameState.status === GameStatus.CHECKMATE) {
      return gameState.turn === PieceColor.WHITE ? GameResult.COMPUTER_CHECKMATE : GameResult.HUMAN_CHECKMATE;
    }
    if (gameState.status === GameStatus.STALEMATE) return GameResult.DRAW_STALEMATE;
    if (isComputerThinking) return GameStatusClass.THINKING_MESSAGE;
    if (gameState.status === GameStatus.CHECK) return GameStatusClass.CHECK_MESSAGE;
    return GameStatusClass.YOUR_TURN_MESSAGE;
  }, [gameState.status, gameState.turn, isComputerThinking]);

  /** Returns a CSS class name suffix for the status bar. */
  const statusClass = useCallback((): string => {
    if (gameState.status === GameStatus.CHECKMATE) {
      return gameState.turn === PieceColor.WHITE ? GameStatusClass.COMPUTER_WINS : GameStatusClass.HUMAN_WINS;
    }
    if (gameState.status === GameStatus.STALEMATE) return GameStatusClass.DRAW;
    if (gameState.status === GameStatus.CHECK) return GameStatusClass.CHECK;
    if (isComputerThinking) return GameStatusClass.THINKING;
    return '';
  }, [gameState.status, gameState.turn, isComputerThinking]);

  const isGameOver = gameState.status === GameStatus.CHECKMATE || gameState.status === GameStatus.STALEMATE;

  return {
    gameState,
    selectedSquare,
    legalMoves,
    kingInCheck,
    isComputerThinking,
    isGameOver,
    handleSquareClick,
    handleNewGame,
    getStatusMessage,
    statusClass,
  };
}
