/** Color of a chess piece. */
export enum PieceColor {
    WHITE = 'white',
    BLACK = 'black',
}

/** Type of a chess piece. */
export enum PieceType {
    PAWN = 'pawn',
    ROOK = 'rook',
    KNIGHT = 'knight',
    BISHOP = 'bishop',
    QUEEN = 'queen',
    KING = 'king',
}

/** Current status of the game for the active player. */
export enum GameStatus {
    PLAYING = 'playing',
    CHECK = 'check',
    CHECKMATE = 'checkmate',
    STALEMATE = 'stalemate',
}

export enum GameResult {
    COMPUTER_WINS_MESSAGE = 'The computer wins this time.',
    HUMAN_WINS_MESSAGE = 'Congratulations — you win!',
    DRAW_MESSAGE = 'The game ends in a draw.',
    COMPUTER_CHECKMATE = '♚ Checkmate — Computer wins!',
    HUMAN_CHECKMATE = '♔ Checkmate — You win!',
    DRAW_STALEMATE = '½ Draw',
}

export enum GameStatusClass {
    COMPUTER_WINS = 'status-computer-wins',
    HUMAN_WINS = 'status-human-wins',
    DRAW = 'status-draw',
    CHECK = 'status-check',
    PLAYING = 'status-playing',
    THINKING = 'status-thinking',
    THINKING_MESSAGE = '♟ Computer thinking…',
    CHECK_MESSAGE = '⚠ Check! Your king is under attack',
    YOUR_TURN_MESSAGE = '♙ Your turn — select a piece to move',
}