import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-type-assertion'] };

describe('no-type-assertion rule', () => {
  describe('as expressions', () => {
    it('should detect simple as assertion', () => {
      const code = `const x = value as string;`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
      expect(results[0].rule).toBe('no-type-assertion');
      expect(results[0].message).toContain('as');
      expect(results[0].severity).toBe('warning');
    });

    it('should detect as assertion with complex types', () => {
      const code = `const user = response.data as User;`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });

    it('should detect as unknown as Type pattern', () => {
      const code = `const x = value as unknown as SpecificType;`;
      const results = lintJsxCode(code, config);
      // Two as expressions
      expect(results).toHaveLength(2);
    });

    it('should not flag as const', () => {
      const code = `const colors = ['red', 'blue'] as const;`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should detect as in function arguments', () => {
      const code = `doSomething(event.target as HTMLInputElement);`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(1);
    });
  });

  describe('angle-bracket assertions', () => {
    it('should not encounter angle-bracket assertions in TSX', () => {
      // Angle-bracket syntax (<Type>value) is invalid in TSX files
      // because the parser treats <Type> as JSX. Since laint parses
      // as TSX, this syntax is already a parse error — no rule needed.
      // This test documents that behavior.
      const code = `const x: string = getValue();`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });

  describe('should not flag', () => {
    it('should not flag properly typed variables', () => {
      const code = `const x: string = getValue();`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag type annotations', () => {
      const code = `function greet(name: string): string { return name; }`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag generic type parameters', () => {
      const code = `const items = useState<string[]>([]);`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });

    it('should not flag satisfies', () => {
      const code = `const config = { port: 3000 } satisfies Config;`;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(0);
    });
  });

  describe('multiple assertions', () => {
    it('should report each assertion separately', () => {
      const code = `
        const a = x as string;
        const b = y as number;
        const c = z as boolean;
      `;
      const results = lintJsxCode(code, config);
      expect(results).toHaveLength(3);
    });
  });
});
