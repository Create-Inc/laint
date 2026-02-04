"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRuleNames = getAllRuleNames;
exports.lintJsxCode = lintJsxCode;
const parser_1 = require("./parser");
const rules_1 = require("./rules");
/**
 * Get all available rule names
 */
function getAllRuleNames() {
    return Object.keys(rules_1.rules);
}
function lintJsxCode(code, config) {
    const ast = (0, parser_1.parseJsx)(code);
    const results = [];
    // Determine which rules to run based on exclude mode
    let rulesToRun;
    if (config.exclude) {
        // Exclude mode: run all rules except those listed
        const excludeSet = new Set(config.rules);
        rulesToRun = Object.keys(rules_1.rules).filter((name) => !excludeSet.has(name));
    }
    else {
        // Include mode (default): only run rules that are listed
        rulesToRun = config.rules;
    }
    for (const ruleName of rulesToRun) {
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
