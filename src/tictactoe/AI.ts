import GameEntity from '@bot/channel/GameEntity';
import { Player } from '@tictactoe/Player';
import Game from '@tictactoe/Game';
import localize from '@config/localize';

/**
 * Operate the AI behavior (using the minimax alghorithm).
 *
 * @author Utarwyn <maximemalgorn@gmail.com>
 * @since 2.0.0
 */
export default class AI implements GameEntity {
    /**
     * Identifier of the AI is always "AI"
     */
    id = 'AI';
    /**
     * Display name of an AI
     */
    displayName = localize.__('game.ai');
    /**
     * Maximum depth of the Minimax algorithm
     */
    maxDepth = -1;

    /**
     * Generates the string representation of the AI in a Discord text channel.
     */
    public toString(): string {
        return this.displayName;
    }

    public maxAlphaBeta(game: Game, alpha = -2, beta = 2): AIComputeResult {
        let score = -2;
        let move = undefined;

        // Compute winning scores
        const winner = game.winner;
        switch (winner) {
            case Player.First:
                return { score: -1, move: 0 };
            case Player.Second:
                return { score: 1, move: 0 };
            case undefined:
                return { score: 0, move: 0 };
        }

        // Go through all empty cells if no winner for now
        game.board.forEach((cell, index) => {
            if (cell === Player.None) {
                const cloned = game.clone();
                cloned.updateBoard(Player.Second, index);
                const minCompute = this.minAlphaBeta(cloned, alpha, beta);

                if (minCompute.score > score) {
                    score = minCompute.score;
                    move = index;
                }

                if (score >= beta) {
                    return { score, move: index };
                }
                if (score > alpha) {
                    alpha = score;
                }
            }
        });

        return { score, move };
    }

    public minAlphaBeta(game: Game, alpha = -2, beta = 2): AIComputeResult {
        let score = 2;
        let move = undefined;

        // Compute winning scores
        const winner = game.winner;
        switch (winner) {
            case Player.First:
                return { score: -1, move: 0 };
            case Player.Second:
                return { score: 1, move: 0 };
            case undefined:
                return { score: 0, move: 0 };
        }

        // Go through all empty cells if no winner for now
        game.board.forEach((cell, index) => {
            if (cell === Player.None) {
                const cloned = game.clone();
                cloned.updateBoard(Player.First, index);
                const maxCompute = this.maxAlphaBeta(cloned, alpha, beta);

                if (maxCompute.score < score) {
                    score = maxCompute.score;
                    move = index;
                }

                if (score <= alpha) {
                    return { score, move: index };
                }
                if (score < beta) {
                    beta = score;
                }
            }
        });

        return { score, move };
    }
}

/**
 * Represents a result of an AI computation.
 */
export interface AIComputeResult {
    /**
     * Poosition where the AI has decided to play. Can be empty if none found.
     */
    move?: number;
    /**
     * Score computed by the algorithm to find the best move to play.
     */
    score: number;
}
