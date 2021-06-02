import AI from '@tictactoe/AI';
import Game from '@tictactoe/Game';
import { Player } from '@tictactoe/Player';

describe('AI', () => {
    let ai: AI;

    beforeEach(() => {
        ai = new AI();
    });

    it.each`
        rows                     | maxDepth     | score  | move
        ${['o x', 'xx ', 'o x']} | ${undefined} | ${100} | ${5}
        ${['x o', 'oo ', 'x o']} | ${undefined} | ${99}  | ${5}
        ${['  x', ' ox', ' o ']} | ${undefined} | ${99}  | ${1}
        ${['  x', '  x', ' o ']} | ${undefined} | ${95}  | ${8}
        ${['  o', 'ox ', 'xox']} | ${undefined} | ${97}  | ${0}
    `(
        'should compute minimax algorithm with rows $rows and max depth of $maxDepth',
        ({ rows, maxDepth, score, move }) => {
            const game = new Game();

            // Construct a fake board
            rows.forEach((row: string, rowIndex: number) => {
                [...row].forEach((cell: string, colIndex: number) => {
                    game.updateBoard(
                        cell === 'x' ? Player.First : cell === 'o' ? Player.Second : Player.None,
                        rowIndex * row.length + colIndex
                    );
                });
            });

            if (maxDepth) {
                ai.maxDepth = maxDepth;
            }

            const operate = ai.operate(game, Player.Second);
            expect(operate.score).toBe(score);
            expect(operate.move).toBe(move);
        }
    );
});
