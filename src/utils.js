import {DIFFERENT_TYPE_PRODUCT, INVALID_MATRIX} from './errorMessages.js';
export const product = (A, B) => {
    if (A instanceof Matrix && B instanceof Matrix) {
        return A.product(B);
    } else if (typeof A === 'number' && typeof B === 'number') {
        return A * B;
    } else throw new Error(DIFFERENT_TYPE_PRODUCT);
};
export const add = (A, B) => {
    if (A instanceof Matrix && B instanceof Matrix) {
        return A.add(B);
    } else if (typeof A === 'number' && typeof B === 'number') {
        return A + B;
    } else throw new Error(DIFFERENT_TYPE_PRODUCT);
};
