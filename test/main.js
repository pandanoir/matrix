const assert = require('assert');
const M = require('../dist/matrix.js');

describe('Matrix', () => {
    describe('Matrix', () => {
        it('constructor', () => {
            assert.ok(new M.Matrix([[1, 3, 2], [2, 1, 3], [1, 4, 2]]).inverse().equals(new M.Matrix([[-10, 2, 7], [-1, 0, 1], [7, -1, -5]])));
            assert.equal(new M.Matrix([[1, 2, 3], [2, 3, 4], [1, 1, 1]]).inverse(), null);
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
    });
    describe('ZeroMatrix', () => {
        it('.getDeterminant()', () => {
            assert.equal(new M.ZeroMatrix(1, 1).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(2, 2).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(3, 3).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(4, 4).getDeterminant(), 0);
            assert.equal(new M.ZeroMatrix(5, 5).getDeterminant(), 0);

            assert.equal(new M.ZeroMatrix(1, 2).getDeterminant(), null);
            assert.equal(new M.ZeroMatrix(2, 1).getDeterminant(), null);
            assert.equal(new M.ZeroMatrix(3, 2).getDeterminant(), null);
        })
    })
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
        })
    })
});
