// Matrix3.js - A utility class for 3x3 matrices
// Used primarily for normal matrix calculations

class Matrix3 {
    constructor() {
        this.elements = new Float32Array(9);
        this.setIdentity();
    }

    /**
     * Set rotation with the specified angle and axis.
     * @param {Number} angle Angle in degrees
     * @param {Number} x X component of rotation axis
     * @param {Number} y Y component of rotation axis
     * @param {Number} z Z component of rotation axis
     * @return this
     */
    setRotate(angle, x, y, z) {
        let e = this.elements;
        
        let rad = angle * Math.PI / 180;
        let c = Math.cos(rad);
        let s = Math.sin(rad);
        
        // Normalize rotation axis
        let len = Math.sqrt(x*x + y*y + z*z);
        if (len !== 1) {
            let rlen = 1 / len;
            x *= rlen;
            y *= rlen;
            z *= rlen;
        }
        
        let nc = 1 - c;
        let xy = x * y;
        let yz = y * z;
        let zx = z * x;
        let xs = x * s;
        let ys = y * s;
        let zs = z * s;
        
        e[0] = x*x*nc +  c;
        e[1] = xy *nc + zs;
        e[2] = zx *nc - ys;
        
        e[3] = xy *nc - zs;
        e[4] = y*y*nc +  c;
        e[5] = yz *nc + xs;
        
        e[6] = zx *nc + ys;
        e[7] = yz *nc - xs;
        e[8] = z*z*nc +  c;
        
        return this;
    }
} Set this matrix to the identity matrix.
     * @return this
     */
    setIdentity() {
        const e = this.elements;
        e[0] = 1;  e[3] = 0;  e[6] = 0;
        e[1] = 0;  e[4] = 1;  e[7] = 0;
        e[2] = 0;  e[5] = 0;  e[8] = 1;
        return this;
    }

    /**
     * Set the elements of this matrix from a 4x4 matrix, using the upper-left 3x3 part.
     * @param {Matrix4} matrix4 source matrix
     * @return this
     */
    set(matrix4) {
        const src = matrix4.elements;
        const dst = this.elements;

        // Only copy the upper-left 3x3 portion (ignoring translation)
        dst[0] = src[0];  dst[3] = src[4];  dst[6] = src[8];
        dst[1] = src[1];  dst[4] = src[5];  dst[7] = src[9];
        dst[2] = src[2];  dst[5] = src[6];  dst[8] = src[10];

        return this;
    }

    /**
     * Calculate the determinant of this matrix.
     * @return {Number} determinant
     */
    determinant() {
        const e = this.elements;
        
        return e[0] * (e[4] * e[8] - e[7] * e[5]) -
               e[3] * (e[1] * e[8] - e[7] * e[2]) +
               e[6] * (e[1] * e[5] - e[4] * e[2]);
    }

    /**
     * Set this matrix to the inverse of the specified matrix.
     * @param {Matrix3} source Source matrix
     * @return this
     */
    setInverseOf(source) {
        const s = source.elements;
        const d = this.elements;
        const det = source.determinant();

        if (det === 0) {
            console.error('Matrix3: determinant is zero, cannot invert');
            return this;
        }

        const invDet = 1 / det;

        // Calculate the inverse using the classical adjoint formula
        d[0] = (s[4] * s[8] - s[7] * s[5]) * invDet;
        d[1] = (s[7] * s[2] - s[1] * s[8]) * invDet;
        d[2] = (s[1] * s[5] - s[4] * s[2]) * invDet;
        
        d[3] = (s[6] * s[5] - s[3] * s[8]) * invDet;
        d[4] = (s[0] * s[8] - s[6] * s[2]) * invDet;
        d[5] = (s[3] * s[2] - s[0] * s[5]) * invDet;
        
        d[6] = (s[3] * s[7] - s[6] * s[4]) * invDet;
        d[7] = (s[6] * s[1] - s[0] * s[7]) * invDet;
        d[8] = (s[0] * s[4] - s[3] * s[1]) * invDet;

        return this;
    }

    /**
     * Calculate the inverse of this matrix.
     * @return this
     */
    invert() {
        return this.setInverseOf(this);
    }

    /**
     * Transpose this matrix.
     * @return this
     */
    transpose() {
        const e = this.elements;
        let temp;

        temp = e[1]; e[1] = e[3]; e[3] = temp;
        temp = e[2]; e[2] = e[6]; e[6] = temp;
        temp = e[5]; e[5] = e[7]; e[7] = temp;

        return this;
    }

    /**
     * Multiply this matrix by another matrix.
     * @param {Matrix3} matrix right-hand-side matrix
     * @return this
     */
    multiply(matrix) {
        const a = this.elements;
        const b = matrix.elements;
        const result = new Float32Array(9);

        // Calculate each element of the result matrix
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++) {
                    sum += a[i * 3 + k] * b[k * 3 + j];
                }
                result[i * 3 + j] = sum;
            }
        }

        // Copy the result back to this matrix
        for (let i = 0; i < 9; i++) {
            a[i] = result[i];
        }

        return this;
    }

    /**
     *