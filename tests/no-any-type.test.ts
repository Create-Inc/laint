import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-any-type'] };

describe('no-any-type rule', () => {
  it('should detect any in variable type annotation', () => {
    const code = `const x: any = 5;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-any-type');
    expect(results[0].severity).toBe('warning');
  });

  it('should detect any in function parameter', () => {
    const code = `function foo(x: any) { return x; }`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect any in return type', () => {
    const code = `function foo(): any { return 5; }`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect any in generic type parameter', () => {
    const code = `const items: Array<any> = [];`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect multiple any usages', () => {
    const code = `
      function process(input: any): any {
        const temp: any = input;
        return temp;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(3);
  });

  it('should allow unknown type', () => {
    const code = `const x: unknown = 5;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow specific types', () => {
    const code = `const x: string = 'hello';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow generic types', () => {
    const code = `function identity<T>(x: T): T { return x; }`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should detect any in interface properties', () => {
    const code = `
      interface Foo {
        data: any;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect any in type aliases', () => {
    const code = `type Callback = (event: any) => void;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });
});
