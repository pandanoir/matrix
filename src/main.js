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
        const rowMatrix = (item) => new Matrix([item]);
        let _matrix = this.matrix.map(rowMatrix);
        let I = new Matrix(new IMatrix(_matrix.length).matrix.map(rowMatrix));
        for (let k = 0, _k = _matrix.length, found_nonzero_line; k < _k; k++) {
            found_nonzero_line = false;
            for (let i = k, _i = _matrix.length; i < _i; i++) {
                if (_matrix[i].matrix[0][k] === 0) {
                    continue;
                }
                I.matrix[i] = I.matrix[i].multiple(1 / _matrix[i].matrix[0][k]);
                _matrix[i] = _matrix[i].multiple(1 / _matrix[i].matrix[0][k]);

                // swap line `i` and line `k`
                let before = _matrix[i];
                _matrix[i] = _matrix[k];
                _matrix[k] = _matrix[i];

                // swap line `i` and line `k`
                before = I.matrix[i];
                I.matrix[i] = I.matrix[k];
                I.matrix[k] = I.matrix[i];

                for (let j = 0; j < _i; j++) {
                    if (j === i) continue;
                    I.matrix[j] = I.matrix[j].add(I.matrix[i].multiple(-_matrix[j].matrix[0][k]));
                    _matrix[j] = _matrix[j].add(_matrix[i].multiple(-_matrix[j].matrix[0][k]));
                }
                found_nonzero_line = true;
                break;
            }
            if (found_nonzero_line === false) return null;
        }
        return new Matrix(I.matrix.map((item) => item.matrix[0]));
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
        if (this.matrix[0].length !== matrix.matrix.length) throw new Error(DIFFERENT_TYPE_PRODUCT);
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
    toArray() {
        return this.matrix.map(function(item) {
            if (item instanceof Matrix) return item.toArray();
            return item;
        });
    }
}
class ZeroMatrix extends Matrix {
    constructor(n, m) {
        super(Array.apply(null, Array(n)).map(() => (Array(m).fill(0))));
    }
}
class IMatrix extends ZeroMatrix {
    constructor(n) {
        super(n, n);
        this.matrix = this.matrix.map((row, i) => (row[i] = 1, row));
    }
}
