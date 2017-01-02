const assert = require('assert');
const M = require('../dist/matrix.js');
const UNDEFINED_OPERATION = /undefined operation/;

describe('Matrix', () => {
    describe('Matrix', () => {
        it('constructor', () => {
            assert.ok(new M.Matrix([[1, 3, 2], [2, 1, 3], [1, 4, 2]]).inverse().equals(
                new M.Matrix([[-10, 2, 7], [-1, 0, 1], [7, -1, -5]])
            ));
            assert.throws(() => {
                new M.Matrix([[1, 2, 3], [2, 3, 4], [1, 1, 1]]).inverse();
            }, UNDEFINED_OPERATION);
            assert.ok(new M.Matrix([
                new M.Matrix([[1, 2, 3]]),
                new M.Matrix([[2, 3, 4]]),
                new M.Matrix([[1, 1, 1]])
            ]).flatten().equals(new M.Matrix([
                [1, 2, 3],
                [2, 3, 4],
                [1, 1, 1]
            ])));
            assert.ok(new M.Matrix([
                [new M.Matrix([[1, 2], [2, 3]]), new M.Matrix([[3], [4]])],
                [new M.Matrix([[1, 1]]), new M.Matrix([[1]])]
            ]).flatten().equals(new M.Matrix([
                [1, 2, 3],
                [2, 3, 4],
                [1, 1, 1]
            ])));
        });
        it('.transpose()', () => {
            assert.ok(new M.Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).transpose().equals(
            new M.Matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
            ));
            assert.throws(() => {
                new M.Matrix([[1, 2, 3], [4, 5, 6]]).transpose();
            }, UNDEFINED_OPERATION);
        });
        it('.getTrace()', () => {
            assert.equal(new M.Matrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).getTrace(), 15);
            assert.throws(() => {
                new M.Matrix([[1, 2, 3], [4, 5, 6]]).getTrace();
            }, UNDEFINED_OPERATION);
        });
        it('.getRank()', () => {
            assert.equal(new M.Matrix([[4, 2, 1], [5, 4, 1], [1, 2, 0]]).getRank(), 2);
            assert.equal(new M.Matrix([[1, 1, -3], [-1, 0, 5], [0, 3, 6]]).getRank(), 2);
            assert.equal(new M.Matrix([[2, 3, -4, 1], [1, 2, -3, -1], [-2, -4, 9, 5]]).getRank(), 3);
        });
    });
    describe('ZeroMatrix', () => {
        it('.getDeterminant()', () => {
            assert.equal(new M.ZeroMatrix(1, 1).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(2, 2).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(3, 3).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(4, 4).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(5, 5).getDeterminant(), 0);

            assert.throws(() => {
                new M.ZeroMatrix(1, 2).getDeterminant();
            }, UNDEFINED_OPERATION);
            assert.throws(() => {
                new M.ZeroMatrix(2, 1).getDeterminant();
            }, UNDEFINED_OPERATION);
            assert.throws(() => {
                new M.ZeroMatrix(3, 2).getDeterminant();
            }, UNDEFINED_OPERATION);
        });
    });
    describe('IdentityMatrix', () => {
        it('.getDeterminant()', () => {
            assert.ok(new M.IdentityMatrix(1).equals(new M.Matrix([[1]])));
            assert.ok(new M.IdentityMatrix(2).equals(
                new M.Matrix([[1, 0], [0, 1]])));
            assert.ok(new M.IdentityMatrix(3).equals(
                new M.Matrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])));
            assert.ok(new M.IdentityMatrix(4).equals(
                new M.Matrix([
                    [1, 0, 0, 0],
                    [0, 1, 0, 0],
                    [0, 0, 1, 0],
                    [0, 0, 0, 1]
                ])
            ));
            assert.ok(new M.IdentityMatrix(5).equals(
                new M.Matrix([
                    [1, 0, 0, 0, 0],
                    [0, 1, 0, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 0, 1, 0],
                    [0, 0, 0, 0, 1]
                ])
            ));
        });
        it('.getDeterminant()', () => {
            assert.equal(new M.IdentityMatrix(1).getDeterminant(), 1);
            assert.equal(new M.IdentityMatrix(2).getDeterminant(), 1);
            assert.equal(new M.IdentityMatrix(3).getDeterminant(), 1);
            assert.equal(new M.IdentityMatrix(4).getDeterminant(), 1);
            assert.equal(new M.IdentityMatrix(5).getDeterminant(), 1);
        });
    });
});
