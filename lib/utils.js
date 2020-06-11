"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    reduce(s, length) {
        if (length < 1 || length > s.length) {
            throw new Error('Length parameter longer than the string or a negative number.');
        }
        const reduced = s.substring(0, length) + '...';
        return reduced;
    }
}
exports.default = new Utils();
