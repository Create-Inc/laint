"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lintJsxCode = lintJsxCode;
const parser_1 = require("./parser");
const rules_1 = require("./rules");
function lintJsxCode(code, config) {
    const ast = (0, parser_1.parseJsx)(code);
    const results = [];
    for (const ruleName of config.rules) {
        const ruleFunc = rules_1.rules[ruleName];
        if (ruleFunc) {
            const ruleResults = ruleFunc(ast, code);
            results.push(...ruleResults);
        }
        else {
            console.warn(`Unknown rule: ${ruleName}`);
        }
    }
    return results;
}
