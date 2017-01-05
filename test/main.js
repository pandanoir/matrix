const assert = require('assert');
const M = require('../dist/matrix.js');
const UNDEFINED_OPERATION = /undefined operation/;

describe('Matrix', () => {
    describe('Matrix', () => {
        it('.inverse()', () => {
            assert.ok(new M.Matrix([[1, 3, 2], [2, 1, 3], [1, 4, 2]]).inverse().equals(
                new M.Matrix([[-10, 2, 7], [-1, 0, 1], [7, -1, -5]])
            ));
            assert.throws(() => {
                new M.Matrix([[1, 2, 3], [2, 3, 4], [1, 1, 1]]).inverse();
            }, UNDEFINED_OPERATION);
        })
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
    describe('BlockMatrix', () => {
        const A = new M.BlockMatrix([
                [new M.RowVector([1, 2, 3])],
                [new M.RowVector([2, 3, 4])],
                [new M.RowVector([1, 1, 1])]
            ]),
            B = new M.BlockMatrix([[
                new M.ColumnVector([1, 2, 1]),
                new M.ColumnVector([2, 3, 1]),
                new M.ColumnVector([3, 4, 1])
            ]]);
        it('.add()', () => {
            assert.ok(A.add(B).equals(new M.Matrix([
                [2, 4, 6],
                [4, 6, 8],
                [2, 2, 2]
            ])));
            assert.ok(A.add(A).equals(new M.BlockMatrix([
                [new M.RowVector([2, 4, 6])],
                [new M.RowVector([4, 6, 8])],
                [new M.RowVector([2, 2, 2])]
            ])));
        });
        it('.equals()', () => {
            assert.ok(!A.equals(B));
            assert.ok(A.equals(A));
            assert.ok(B.equals(B));
        });
        it('.flatten()', () => {
            assert.ok(A.flatten().equals(new M.Matrix([
                [1, 2, 3],
                [2, 3, 4],
                [1, 1, 1]
            ])));
            assert.ok(B.flatten().equals(new M.Matrix([
                [1, 2, 3],
                [2, 3, 4],
                [1, 1, 1]
            ])));
            assert.ok(new M.BlockMatrix([
                [new M.Matrix([[1, 2], [2, 3]]), new M.ColumnVector([3, 4])],
                [new M.RowVector([1, 1]), new M.Matrix([[1]])]
            ]).flatten().equals(new M.Matrix([
                [1, 2, 3],
                [2, 3, 4],
                [1, 1, 1]
            ])));
        });
        it('.hasSameBlock()', () => {
            assert.ok(!A.hasSameBlock(B));
            assert.ok(!B.hasSameBlock(A));
            assert.ok(A.hasSameBlock(A));
            assert.ok(B.hasSameBlock(B));
            assert.ok(new M.BlockMatrix([
                [new M.Matrix([[1, 2], [2, 3]]), new M.ColumnVector([3, 4])],
                [new M.RowVector([1, 1]), new M.Matrix([[1]])]
            ]).hasSameBlock(new M.BlockMatrix([
                [new M.Matrix([[2, 3], [3, 4]]), new M.ColumnVector([4, 5])],
                [new M.RowVector([2, 2]), new M.Matrix([[2]])]
            ])));
        });
        it('.multiple()', () => {
            assert.ok(A.multiple(2).equals(new M.BlockMatrix([
                [new M.RowVector([2, 4, 6])],
                [new M.RowVector([4, 6, 8])],
                [new M.RowVector([2, 2, 2])]
            ])));
            assert.ok(new M.BlockMatrix([
                [new M.Matrix([[1, 2], [2, 3]]), new M.ColumnVector([3, 4])],
                [new M.RowVector([1, 1]), new M.Matrix([[1]])]
            ]).multiple(2).equals(new M.BlockMatrix([
                [new M.Matrix([[2, 4], [4, 6]]), new M.ColumnVector([6, 8])],
                [new M.RowVector([2, 2]), new M.Matrix([[2]])]
            ])));
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
    describe('RowVector', () => {
        it('constructor', () => {
            assert.ok(new M.RowVector([1, 2, 3]).equals(new M.Matrix([[1, 2, 3]])));
            assert.ok(new M.RowVector([2, 3, 4]).equals(new M.Matrix([[2, 3, 4]])));
            assert.ok(new M.RowVector([1, 1]).equals(new M.Matrix([[1, 1]])));
        });
    });
    describe('ColumnVector', () => {
        it('constructor', () => {
            assert.ok(new M.ColumnVector([3, 4]).equals(new M.Matrix([[3], [4]])));
        });
    });
});
