export const bairstowsMethod = (...a) => {
    const n = a.length - 1;
    if (n == 1) return [-a[1] / a[0]];
    if (n == 2) {
        const D = a[1] * a[1] - 4 * a[0] * a[2];
        if (D == 0) return [-a[1] / 2];
        return [(-a[1] + Math.sqrt(D)) / (2 * a[0]), (-a[1] - Math.sqrt(D)) / (2 * a[0])];
    }
    let p = a[1] / a[0], q = a[2] / a[0];
    let once = 0;
    while (true) {
        const b = [];
        const c = [];
        b[-1] = b[-2] = 0;
        c[-1] = c[-2] = 0;
        for (let i = 0; i <= n; i++) {
            b[i] = a[i] - p * b[i - 1] - q * b[i - 2];
        }
        for (let i = 0; i <= n; i++) {
            c[i] = b[i] - p * c[i - 1] - q * c[i - 2];
        }
        const D = c[n - 2] * c[n - 2] - c[n - 3] * (c[n - 1] - b[n - 1]);
        const delta_p = (b[n - 1] * c[n - 2] - b[n] * c[n - 3]) / D;
        const delta_q = (b[n] * c[n - 2] - b[n - 1] * (c[n - 1] - b[n - 1])) / D;
        const abs = n => n > 0 ? n : -n;
        const ipsilon = 1e-14;
        if (abs(delta_p) < ipsilon && abs(delta_q) < ipsilon) {
            const D = p * p - 4 * q;
            let solution;
            if (D < 0) solution = [];
            if (D == 0) solution = [-p/2];
            if (D > 0) solution = [(-p + Math.sqrt(D)) / 2, (-p - Math.sqrt(D)) / 2];
            return solution.concat(bairstowsMethod(...b.slice(0, -2)));
        } else {
            p += delta_p;
            q += delta_q;
        }
    }
};
