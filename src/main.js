'use strict';
import {DIFFERENT_TYPE_PRODUCT, INVALID_MATRIX} from './errorMessages.js';
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
        if (matrix[i] instanceof Matrix) {
            if (matrix[0].column !== matrix[i].column) {
                errorCaused = true;
                break;
            }
        } else {
            errorCaused = true;
            break;
        }
    }
    if (!errorCaused) return;
    // all columns are Matrix
    // new Matrix([[col1, col2, col3]]);
    errorCaused = false;
    if (matrix.length > 1) errorCaused = true;
    else {
        for (let j = 0, _j = matrix[0].length; j < _j; j++) {
            if (matrix[0][j] instanceof Matrix) {
                if (matrix[0][0].row !== matrix[0][j].row) {
                    errorCaused = true;
                    break;
                }
            } else {
                errorCaused = true;
                break;
            }
        }
    }
    if (!errorCaused) return;
    // all elements are Matrix
    for (let i = 0, _i = matrix.length; i < _i; i++) {
        if (matrix[i][0] instanceof Matrix) {
            for (let j = 0, _j = matrix[i].length; j < _j; j++) {
                if (!(matrix[i][j] instanceof Matrix))
                    throw new Error(INVALID_MATRIX);
            }
        } else throw new Error(INVALID_MATRIX);
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
        this.matrix = matrix;
        this.row = matrix.length;
        this.column = matrix[0].length;
    }
    inverse() {
        if (!this.isSquare()) return null;
        const _matrix = this.flatten().matrix.map(x => x.concat());
        const I = new IdentityMatrix(_matrix.length);
        // Gaussian elimination
        for (let k = 0, _k = _matrix.length, found_nonzero_line; k < _k; k++) {
            found_nonzero_line = false;
            for (let i = k, _i = _matrix.length; i < _i; i++) {
                if (_matrix[i][k] === 0) {
                    continue;
                }
                const m = _matrix[i][0];
                I.matrix[i] = I.matrix[i].map(x => x / m);
                _matrix[i] = _matrix[i].map(x => x / m);
                for (let j = 0; j < _i; j++) {
                    if (j === i) continue;
                    const m = -_matrix[j][0];
                    I.matrix[j] = I.matrix[j].map(x => x + I.matrix[i].map(x => x * m));
                    _matrix[j] = _matrix[j].map(x => x + _matrix[i].map(x => x * m));
                }
                [_matrix[i], _matrix[k]] = [_matrix[k], _matrix[i]]; // swap line `i` and line `k`
                [I.matrix[i], I.matrix[k]] = [I.matrix[k], I.matrix[i]]; // swap line `i` and line `k`
                found_nonzero_line = true;
                break;
            }
            if (found_nonzero_line === false) return null;
        }
        return new Matrix(I.matrix);
    }
    add(matrix) {
        if (!this.isSameSize(matrix)) throw new Error('given matrix and this matrix are not same size.');
        var _matrix = [];
        for (let i = 0, _i = this.matrix.length; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.matrix[i].length; j < _j; j++) {
                _matrix[i][j] = add(this.matrix[i][j], matrix.matrix[i][j]);
            }
        }
        return new Matrix(_matrix);
    }
    substract(matrix) {
        return this.add(matrix.multiple(-1));
    }
    multiple(k) {
        var _matrix = [];
        for (let i = 0, _i = this.matrix.length; i < _i; i++) {
            _matrix.push([]);
            for (let j = 0, _j = this.matrix[i].length; j < _j; j++) {
                if (this.matrix[i][j] instanceof Matrix) {
                    _matrix[i][j] = this.matrix[i][j].multiple(k);
                } else {
                    _matrix[i][j] = this.matrix[i][j] * k;
                }
            }
        }
        return new Matrix(_matrix);
    }
    product(matrix) {
        if (this.matrix[0].length !== matrix.matrix.length)
            throw new Error(DIFFERENT_TYPE_PRODUCT);
        let m = this.matrix[0].length;
        let _matrix = [];

        for (let i = 0, n = this.matrix.length; i < n; i++) {
            _matrix.push([]);
            for (let j = 0, p = matrix.matrix[0].length; j < p; j++) {
                if (this.matrix[i][j] instanceof Matrix) {
                    _matrix[i][j] = new ZeroMatrix(this.matrix[i][j].matrix.length, this.matrix[i][j].matrix[0].length);
                } else {
                    _matrix[i][j] = 0;
                }
                for (let k = 0; k < m; k++) {
                    _matrix[i][j] = add(_matrix[i][j], product(this.matrix[i][k], matrix.matrix[k][j]));
                }
            }
        }
        return new Matrix(_matrix);
    }
    pow(n) {
        if (n === 1) return this;
        let res = this.product(this).pow(0 | n / 2);
        if (n % 2 === 1) {
            res = res.product(this);
        }
        return res;
    }
    isSameSize(matrix) {
        assertMatrix(matrix);
        for (let i = 0, _i = this.matrix.length; i < _i; i++) {
            if (this.matrix[i] instanceof Matrix) {
                if (!this.matrix[i].isSameSize(matrix.matrix[i])) return false;
            } else if (Array.isArray(this.matrix[i])) {
                if (this.matrix[i].length !== matrix.matrix[i].length) return false;
            }
        }
        return true;
    }
    isSquare() {
        return this.matrix.length === this.matrix[0].length;
    }
    getDeterminant() {
        if (!this.isSquare()) return null;
        if (this.row === 1) return this.matrix[0][0];
        if (this.row === 2) {
            return this.matrix[0][0] * this.matrix[1][1] - this.matrix[0][1] * this.matrix[1][0];
        }
        let i = 0;
        for (i = 0; i < this.row; i++)
            if (this.matrix[i][0] !== 0) break;
        if (i === this.row) return 0;
        const newMatrix = this.matrix.map(x => x.concat());
        const m = newMatrix[i][0];
        newMatrix[i] = newMatrix[i].map(x => x / m);
        for (let j = 0; j < this.row; j++) {
            if (i === j) continue;
            const m = newMatrix[j][0];
            newMatrix[j] = newMatrix[j].map((x, k) => x - m * newMatrix[i][k]).slice(1);
        }
        newMatrix.splice(i, 1);
        return m * new Matrix(newMatrix).getDeterminant();
    }
    flatten() {
        const matrix = [];
        for (let i = 0, rowLen = 0; i < this.row; i++) {
            if (this.matrix[i] instanceof Matrix) {
                const flattenMatrix = this.matrix[i].flatten();
                for (let j = 0; j < flattenMatrix.row; j++) {
                    matrix[rowLen + j] = flattenMatrix.matrix[j];
                }
                rowLen += flattenMatrix.row;
            } else {
                let deltaRow = 1;
                for (let j = 0, columnLen = 0; j < this.column; j++) {
                    if (this.matrix[i][j] instanceof Matrix) {
                        const flattenMatrix = this.matrix[i][j].flatten();
                        flattenMatrix.matrix.forEach((row, i) =>
                            row.forEach((val, j) => {
                                if (!matrix[rowLen + i]) matrix[rowLen + i] = [];
                                matrix[rowLen + i][columnLen + j] = val
                            })
                        );
                        deltaRow = flattenMatrix.row;
                        columnLen += flattenMatrix.column;
                    } else {
                        if (!matrix[rowLen]) matrix[rowLen] = [];
                        matrix[rowLen][columnLen] = this.matrix[i][j];
                        columnLen++;
                    }
                }
                rowLen += deltaRow;
            }
        }
        return new Matrix(matrix);
    }
    toArray() {
        return this.matrix.map(item => {
            if (item instanceof Matrix) return item.toArray();
            return item;
        });
    }
}
class ZeroMatrix extends Matrix {
    constructor(n, m) {
        super([...Array(n)].map(() => Array(m).fill(0)));
    }
    getDeterminant() {
        return this.row === this.column ? 0 : null;
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