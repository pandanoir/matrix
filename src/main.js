'use strict';
import {DIFFERENT_TYPE_PRODUCT, INVALID_MATRIX, UNDEFINED_OPERATION} from './errorMessages.js';
import {add, product} from './utils.js';
const assertMatrix = matrix => {
    if (!(Array.isArray(matrix) || matrix instanceof Matrix))
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
    }
    if (!errorCaused) return;
    // all rows are Matrix
    // new Matrix([row1, row2, row2])
    errorCaused = false;
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        if (!(matrix[i] instanceof Matrix) || matrix[0].column !== matrix[i].column) {
            errorCaused = true;
            break;
        }
    }
    if (!errorCaused) return;
    // all columns are Matrix
    // new Matrix([[col1, col2, col3]]);
    errorCaused = false;
    if (matrix.length > 1) errorCaused = true;
    const mat0 = matrix[0];
    for (let j = 0, _j = mat0.length; j < _j && !errorCaused; j++) {
        if (!(mat0[j] instanceof Matrix) || mat0[0].row !== mat0[j].row) {
            errorCaused = true;
        }
    }
    if (!errorCaused) return;
    // all elements are Matrix
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        if (!(matrix[i][0] instanceof Matrix)) throw new Error(INVALID_MATRIX);
        for (let j = 0, _j = matrix[i].length; j < _j; j++) {
            if (!(matrix[i][j] instanceof Matrix))
                throw new Error(INVALID_MATRIX);
        }
    }
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        for (let j = 0, _j = matrix[i].length; j < _j; j++) {
            if (matrix[0][j].column !== matrix[i][j].column) throw new Error(INVALID_MATRIX);
            if (matrix[i][0].row !== matrix[i][j].row) throw new Error(INVALID_MATRIX);
        }
    }
};
class Matrix {
    constructor(matrix) {
        assertMatrix(matrix);
        this.elements = matrix;
        this.rows = matrix;
        this.row = matrix.length;
        this.column = matrix[0].length;
    }
    inverse() {
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        const flatten = this.flatten();
        const I = new IdentityMatrix(flatten.row).elements;
        let matrix = new Matrix(flatten.rows.map((row, i) => row.concat(I[i])));

        const abs = a => a > 0 ? a : -a;
        // Gaussian elimination
        for (let k = 0; k < flatten.column; k++) {
            const res = matrix.rowReduction(k, k);
            if (res == null) throw new Error(UNDEFINED_OPERATION);

            matrix = res;
            let pivot = 0;
            for (;pivot < res.row; pivot++) if (res.rows[pivot][k] !== 0) break;
            const m = matrix.elements[pivot][k];
            matrix.rows[pivot] = matrix.rows[pivot].map(element => element / m);
            [matrix.rows[pivot], matrix.rows[k]] = [matrix.rows[k], matrix.rows[pivot]]; // swap line `pivot` and line `k`
        }
        return new Matrix(matrix.rows.map(row => row.slice(flatten.column)));
    }
    transpose() {
        const flatten = this.flatten();
        const matrix = [];
        if (!this.isSquare()) throw new Error(UNDEFINED_OPERATION);
        for (let i = 0; i < flatten.row; i++) {
            for (let j = 0; j < flatten.column; j++) {
                if (!matrix[j]) matrix[j] = [];
                matrix[j][i] = flatten.elements[i][j];
            }
        }
        return new Matrix(matrix);
    }
    add(matrix) {
        if (!this.isSameSize(matrix)) throw new Error('given matrix and this matrix are not same size.');
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                _matrix[i][j] = add(this.elements[i][j], matrix.elements[i][j]);
            }
        }
        return new Matrix(_matrix);
    }
    substract(matrix) {
        return this.add(matrix.multiple(-1));
    }
    multiple(k) {
        const _matrix = [];
        for (let i = 0, _i = this.row; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.rows[i].length; j < _j; j++) {
                if (this.elements[i][j] instanceof Matrix) {
                    _matrix[i][j] = this.elements[i][j].multiple(k);
                } else {
                    _matrix[i][j] = this.elements[i][j] * k;
                }
            }
        }
        return new Matrix(_matrix);
    }
    product(matrix) {
        const flatten = this.flatten();
        matrix = matrix.flatten();
        if (flatten.column !== matrix.row)
            throw new Error(DIFFERENT_TYPE_PRODUCT);
        const res = [];

        for (let i = 0; i < flatten.row; i++) {
            res.push([]);
            for (let j = 0; j < matrix.column; j++) {
                res[i][j] = 0;
                for (let k = 0; k < flatten.column; k++) {
                    res[i][j] += flatten.elements[i][k] * matrix.elements[k][j];
                }
            }
        }
        return new Matrix(res);
    }
    pow(n) {
        if (n === 1) return this;
        if (n % 2 === 1) return this.product(this).pow(0 | n / 2).product(this);
        return this.product(this).pow(0 | n / 2);
    }
    isSameSize(matrix) {
        assertMatrix(matrix);
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
        const flatten = this.flatten();
        return flatten.row === flatten.column;
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
        let matrix = this.flatten();
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
        const flatten = this.flatten();
        if (flatten.row === 1) return flatten.elements[0][0];
        if (flatten.row === 2) {
            return flatten.elements[0][0] * flatten.elements[1][1] - flatten.elements[0][1] * flatten.elements[1][0];
        }
        const res = flatten.rowReduction(0);
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
        const matrix = [];
        for (let i = 0, rowLen = 0; i < this.row; i++) {
            if (this.rows[i] instanceof Matrix) {
                const flattenMatrix = this.rows[i].flatten();
                for (let j = 0; j < flattenMatrix.row; j++) {
                    matrix[rowLen + j] = flattenMatrix.rows[j];
                }
                rowLen += flattenMatrix.row;
                continue;
            }
            let deltaRow = 1;
            for (let j = 0, columnLen = 0; j < this.column; j++) {
                if (this.elements[i][j] instanceof Matrix) {
                    const flattenMatrix = this.elements[i][j].flatten();
                    flattenMatrix.rows.forEach((row, i) =>
                        row.forEach((element, j) => {
                            if (!matrix[rowLen + i]) matrix[rowLen + i] = [];
                            matrix[rowLen + i][columnLen + j] = element;
                        })
                    );
                    deltaRow = flattenMatrix.row;
                    columnLen += flattenMatrix.column;
                    continue;
                }
                if (!matrix[rowLen]) matrix[rowLen] = [];
                matrix[rowLen][columnLen] = this.elements[i][j];
                columnLen++;
            }
            rowLen += deltaRow;
        }
        return new Matrix(matrix);
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
        const matrix = this.flatten().rows.map(row => row.concat());
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
export default {
    Matrix,
    ZeroMatrix,
    IdentityMatrix
}
