'use strict';
import {DIFFERENT_TYPE_PRODUCT, INVALID_MATRIX, UNDEFINED_OPERATION, EXPECTED_BLOCK_MATRIX} from './errorMessages.js';
const isFlattenMatrix = matrix => {
    if (!Array.isArray(matrix))
        throw new Error(INVALID_MATRIX);
    if (matrix.length === 0)
        throw new Error(INVALID_MATRIX);

    // all elements are not Matrix.
    let errorCaused = false;
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        if (!Array.isArray(matrix[i])) {
            if (!(matrix[i] instanceof Matrix))
                throw new Error(INVALID_MATRIX);
            errorCaused = true;
            break;
        }
        if (matrix[0].length !== matrix[i].length)
            throw new Error(INVALID_MATRIX);
        for (let j = 0, _j = matrix[i].length; j < _j; j++) {
            if (matrix[i][j] instanceof Matrix) return false;
        }
    }
    return !errorCaused;
}
const assertMatrix = matrix => {
    if (!Array.isArray(matrix))
        throw new Error(INVALID_MATRIX);
    if (matrix.length === 0)
        throw new Error(INVALID_MATRIX);

    // all elements are Matrix
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        if (!(matrix[i][0] instanceof Matrix)) throw new Error(INVALID_MATRIX);
        for (let j = 0, _j = matrix[i].length; j < _j; j++) {
            if (!(matrix[i][j] instanceof Matrix))
                throw new Error(INVALID_MATRIX);
            if (matrix[0][j].column !== matrix[i][j].column) throw new Error(INVALID_MATRIX);
            if (matrix[i][0].row !== matrix[i][j].row) throw new Error(INVALID_MATRIX);
        }
    }
};

class Matrix {
    constructor(matrix) {
        if (!isFlattenMatrix(matrix)) throw new Error('expected flatten matrix.');
        this.elements = matrix;
        this.rows = matrix;
        this.row = matrix.length;
        this.column = matrix[0].length;
    }
    inverse() {
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        const I = new IdentityMatrix(this.row).elements;
        let matrix = new Matrix(this.rows.map((row, i) => row.concat(I[i])));

        const abs = a => a > 0 ? a : -a;
        // Gaussian elimination
        for (let k = 0; k < this.column; k++) {
            const res = matrix.rowReduction(k, k);
            if (res == null) throw new Error(UNDEFINED_OPERATION);

            matrix = res;
            let pivot = 0;
            for (;pivot < res.row; pivot++) if (res.rows[pivot][k] !== 0) break;
            const m = matrix.elements[pivot][k];
            matrix.rows[pivot] = matrix.rows[pivot].map(element => element / m);
            [matrix.rows[pivot], matrix.rows[k]] = [matrix.rows[k], matrix.rows[pivot]]; // swap line `pivot` and line `k`
        }
        const res = new Matrix(matrix.rows.map(row => row.slice(this.column)));
        return res;
    }
    transpose() {
        const matrix = [];
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                if (!matrix[j]) matrix[j] = [];
                matrix[j][i] = this.elements[i][j];
            }
        }
        const res = new Matrix(matrix);
        return res;
    }
    add(matrix) {
        if (!this.isSameSize(matrix)) throw new Error('given matrix and this matrix are not same size.');
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                _matrix[i][j] = this.elements[i][j] + matrix.elements[i][j];
            }
        }
        const res = new Matrix(_matrix);
        return res;
    }
    substract(matrix) {
        return this.add(matrix.multiple(-1));
    }
    multiple(k) {
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                _matrix[i][j] = this.elements[i][j] * k;
            }
        }
        const res = new Matrix(_matrix);
        return res;
    }
    product(matrix) {
        if (this.column !== matrix.row)
            throw new Error(DIFFERENT_TYPE_PRODUCT);
        const _res = [];

        for (let i = 0; i < this.row; i++) {
            _res.push([]);
            for (let j = 0; j < matrix.column; j++) {
                _res[i][j] = 0;
                for (let k = 0; k < this.column; k++) {
                    _res[i][j] += this.elements[i][k] * matrix.elements[k][j];
                }
            }
        }
        const res = new Matrix(_res);
        return res;
    }
    pow(n) {
        if (n === 1) return this;
        if (n % 2 === 1) return this.product(this).pow(0 | n / 2).product(this);
        return this.product(this).pow(0 | n / 2);
    }
    isSameSize(matrix) {
        for (let i = 0, _i = this.row; i < _i; i++) {
            if (this.rows[i] instanceof Matrix) {
                if (!this.rows[i].isSameSize(matrix.rows[i])) return false;
            } else if (Array.isArray(this.rows[i])) {
                if (this.rows[i].length !== matrix.rows[i].length) return false;
            }
        }
        return true;
    }
    isSquare() {
        return this.row === this.column;
    }
    getTrace() {
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        let res = 0;
        for (let i = 0; i < this.row; i++) {
            res += this.elements[i][i];
        }
        return res;
    }
    getRank() {
        let matrix = this;
        if (matrix.row === 1) return matrix.rows[0].some(element => element !== 0) ? 1 : 0;
        while (matrix.row > 0) {
            let found = false;
            for (let i = 0; i < matrix.row; i++) {
                if (matrix.elements[i][0] !== 0) {
                    found = true;
                    break;
                }
            }
            if (found) {
                const res = matrix.rowReduction(0);
                let i = 0;
                for (; i < res.row; i++) {
                    if (res.rows[i][0] !== 0) break;
                }
                [res.rows[i], res.rows[0]] = [res.rows[0], res.rows[i]];
                return 1 + new Matrix(res.rows.slice(1).map(row => row.slice(1))).getRank();
            }
            matrix = new Matrix(matrix.rows.slice(1));
        }
        return rank;
    }
    getDeterminant() {
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        if (this.row === 1) return this.elements[0][0];
        if (this.row === 2) {
            return this.elements[0][0] * this.elements[1][1] - this.elements[0][1] * this.elements[1][0];
        }
        const res = this.rowReduction(0);
        if (res == null) return 0;
        let i = 0;
        for (; i < res.row; i++) {
            if (res.elements[i][0] !== 0) break;
        }
        [res.rows[i], res.rows[0]] = [res.rows[0], res.rows[i]];
        const m = res.elements[0][0];
        return m * res.rows.slice(1).map(row => row.slice(1)).getDeterminant();
    }
    flatten() {
        return this;
    }
    split(m, n) {
        // m and n are the lists of points where the matrix is split.
        // m splits row.
        // n splits column.
        // m == [1] then [[1, 2, 3]] will [[[1], [2, 3]]]
        const uniq = (res, x) => res[res.length - 1] === x ? res : res.concat(x);
        const row = this.row;
        const column = this.column;
        m = [0, row].concat(m).map(x => row >= x ? x >= 0 ? x : 0 : row).sort().reduce(uniq, []);
        n = [0, column].concat(n).map(x => column >= x ? x >= 0 ? x : 0 : column).sort().reduce(uniq, []);
        const res = [];
        for (let i = 1, _i = m.length; i < _i; i++) {
            res.push([]);
            for (let j = 1, _j = n.length; j < _j; j++) {
                const rows = this.rows.slice(m[i - 1], m[i]);
                res[i - 1][j - 1] = new Matrix(rows.map(row => row.slice(n[j - 1], n[j])));
            }
        }
        return new BlockMatrix(res);
    }
    equals(m) {
        const A = this, B = m;
        if (A.row !== B.row || A.column !== B.column) return false;
        for (let i = 0; i < A.row; i++) {
            for (let j = 0; j < A.column; j++) {
                if (A.elements[i][j] !== B.elements[i][j]) return false;
            }
        }
        return true;
    }
    rowReduction(k, start = 0) {
        const matrix = this.rows.map(row => row.concat());
        const abs = a => a > 0 ? a : -a;
        // Gaussian elimination
        let next_i = -1;
        for (let i = start, _i = matrix.length, min = Math.Infinity; i < _i; i++) {
            if (matrix[i][k] === 0) {
                continue;
            }
            if (abs(matrix[i][k]) === 1) {
                next_i = i;
                break;
            }
            if (next_i === -1 || min > Math.min(abs(matrix[i][k] - 1), abs(matrix[i][k] + 1))) {
                next_i = i;
                min = Math.min(abs(matrix[i][k] - 1), abs(matrix[i][k] + 1));
            }
        }
        if (next_i === -1) return null;

        const i = next_i;

        for (let j = 0; j < matrix.length; j++) {
            if (j === i) continue;
            const m = -matrix[j][k] / matrix[i][k];
            matrix[j] = matrix[j].map((element, index) => element + matrix[i][index] * m);
        }
        return new Matrix(matrix);
    }
    toArray() {
        return this.rows.map(row => {
            if (row instanceof Matrix) return row.toArray();
            return row.map(element => element instanceof Matrix ? element.toArray() : element);
        });
    }
}
Matrix.fromFunction = (f, row, column) => {
    const res = [];
    for (let i = 0; i < row; i++) {
        res[i] = [];
        for (let j = 0; j < column; j++) {
            res[i][j] = f(i, j);
        }
    }
    return new Matrix(res);
}
class ZeroMatrix extends Matrix {
    constructor(n, m) {
        super([...Array(n)].map(() => Array(m).fill(0)));
    }
    getDeterminant() {
        if (this.row === this.column) return 0;
        throw new Error(UNDEFINED_OPERATION);
    }
}
class IdentityMatrix extends Matrix {
    constructor(n) {
        super([...Array(n)].map((row, i) => (row = Array(n).fill(0), row[i] = 1, row)));
    }
    inverse() {
        return this;
    }
    getDeterminant() {
        return 1;
    }
}
class BlockMatrix extends Matrix {
    constructor(matrix) {
        assertMatrix(matrix);
        super([[]]);
        this.elements = matrix;
        this.rows = matrix;
        this.row = matrix.length;
        this.column = matrix[0].length;
        this.__flatten__ = null;
    }
    flatten() {
        if (this.__flatten__ !== null) return this.__flatten__;
        const matrix = [];
        for (let i = 0, rowLen = 0, deltaRow = 1; i < this.row; i++) {
            deltaRow = 1;
            for (let j = 0, columnLen = 0; j < this.column; j++) {
                const flattenMatrix = this.elements[i][j];
                for (let i = 0; i < flattenMatrix.row; i++) {
                    for (let j = 0; j < flattenMatrix.column; j++) {
                        if (!matrix[rowLen + i]) matrix[rowLen + i] = [];
                        matrix[rowLen + i][columnLen + j] = flattenMatrix.elements[i][j];
                    }
                }
                deltaRow = flattenMatrix.row;
                columnLen += flattenMatrix.column;
            }
            rowLen += deltaRow;
        }
        const res = new Matrix(matrix);
        return this.__flatten__ = res;
    }
    inverse() {
        return this.flatten().inverse();
    }
    transpose() {
        return this.flatten().transpose();
    }
    add(blockMatrix) {
        if (!this.isSameSize(blockMatrix)) throw new Error('given matrix and this matrix are not same size.');
        if (!this.hasSameBlock(blockMatrix)) {
            return this.flatten().add(blockMatrix.flatten());
        }
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                _matrix[i][j] = this.elements[i][j].add(blockMatrix.elements[i][j]);
            }
        }
        const res = new BlockMatrix(_matrix);
        return res;
    }
    substract(blockMatrix) {
        return this.add(blockMatrix.multiple(-1));
    }
    multiple(k) {
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                _matrix[i][j] = this.elements[i][j].multiple(k);
            }
        }
        const res = new BlockMatrix(_matrix);
        return res;
    }
    product(matrix) {
        return this.flatten().product(matrix.flatten());
    }
    pow(n) {
        return this.flatten().pow(n);
    }
    isSameSize(matrix) {
        return this.flatten().isSameSize(matrix.flatten());
    }
    isSquare() {
        return this.flatten().isSquare();
    }
    hasSameBlock(blockMatrix) {
        if (!(blockMatrix instanceof BlockMatrix)) throw new Error(EXPECTED_BLOCK_MATRIX);
        if (!this.isSameSize(blockMatrix)) return false;
        if (this.row !== blockMatrix.row || this.column !== blockMatrix.column) return false;
        for (let i = 0; i < this.row; i++) {
            for (let j = 0; j < this.column; j++) {
                if (!this.elements[i][j].isSameSize(blockMatrix.elements[i][j])) return false;
            }
        }
        return true;
    }
    getTrace() {
        return this.flatten().getTrace();
    }
    getRank() {
        return this.flatten().getRank();
    }
    getDeterminant() {
        return this.flatten().getDeterminant();
    }
    equals(m) {
        const A = this, B = m;
        if (A.row !== B.row || A.column !== B.column) return false;
        for (let i = 0; i < A.row; i++) {
            for (let j = 0; j < A.column; j++) {
                if (!A.elements[i][j].equals(B.elements[i][j])) return false;
            }
        }
        return true;
    }
    rowReduction(k, start = 0) {
        return this.flatten().rowReduction(k, start);
    }
};
class RowVector extends Matrix {
    constructor(xs) {
        super([xs]);
    }
}
class ColumnVector extends Matrix {
    constructor(xs) {
        super(xs.map(x => [x]));
    }
}
export default {
    Matrix,
    BlockMatrix,
    ZeroMatrix,
    IdentityMatrix,
    RowVector,
    ColumnVector
}
