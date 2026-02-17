import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['prefer-named-params'] };

function lint(code: string) {
  return lintJsxCode(code, config);
}

describe('prefer-named-params', () => {
  // --- Should flag ---

  it('should flag function declarations with multiple positional params', () => {
    const code = `function doThing(paramA: string, paramB: number) { return paramA; }`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('prefer-named-params');
    expect(results[0].severity).toBe('warning');
  });

  it('should flag arrow functions with multiple positional params', () => {
    const code = `const doThing = (paramA: string, paramB: number) => paramA;`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('should flag function expressions with multiple positional params', () => {
    const code = `const doThing = function(paramA: string, paramB: number) { return paramA; };`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('should flag exported functions with multiple positional params', () => {
    const code = `export function createUser(name: string, email: string) { return { name, email }; }`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  // --- Should allow ---

  it('should allow functions with a single parameter', () => {
    const code = `function doThing(param: string) { return param; }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow functions with no parameters', () => {
    const code = `function doThing() { return 'hello'; }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow functions using object destructuring', () => {
    const code = `function doThing({ paramA, paramB }: { paramA: string; paramB: number }) { return paramA; }`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow arrow functions using object destructuring', () => {
    const code = `const doThing = ({ a, b }: { a: string; b: number }) => a;`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .map()', () => {
    const code = `const result = items.map((item, index) => item + index);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .filter()', () => {
    const code = `const result = items.filter((item, index) => index > 0);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .reduce()', () => {
    const code = `const result = items.reduce((acc, item) => acc + item, 0);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .forEach()', () => {
    const code = `items.forEach((item, index) => console.log(item, index));`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .sort()', () => {
    const code = `items.sort((a, b) => a - b);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed to .then()', () => {
    const code = `fetch('/api').then((res, extra) => res.json());`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow callbacks passed as function arguments', () => {
    const code = `setTimeout((a, b) => a + b, 1000);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow React.forwardRef callbacks', () => {
    const code = `const MyComp = React.forwardRef((props, ref) => <div ref={ref} />);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow forwardRef callbacks', () => {
    const code = `const MyComp = forwardRef((props, ref) => <div ref={ref} />);`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
