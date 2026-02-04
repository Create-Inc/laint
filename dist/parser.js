"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsx = parseJsx;
const parser_1 = require("@babel/parser");
function parseJsx(code) {
    return (0, parser_1.parse)(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
    });
}
