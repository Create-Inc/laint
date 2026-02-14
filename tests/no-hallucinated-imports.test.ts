import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-hallucinated-imports'] };

describe('no-hallucinated-imports rule', () => {
  it('should detect imports of packages not in package.json', () => {
    const code = `import foo from 'nonexistent-package-xyz-123';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-hallucinated-imports');
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('nonexistent-package-xyz-123');
  });

  it('should allow imports of packages in dependencies', () => {
    const code = `import parser from '@babel/parser';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow imports of packages in devDependencies', () => {
    const code = `import { describe } from 'vitest';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow relative imports', () => {
    const code = `import { helper } from './utils';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow Node.js built-in modules', () => {
    const code = `import fs from 'fs';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow node: protocol imports', () => {
    const code = `import fs from 'node:fs';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should handle scoped packages', () => {
    const code = `import foo from '@nonexistent-scope/nonexistent-pkg';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should allow scoped packages in dependencies', () => {
    const code = `import traverse from '@babel/traverse';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should handle subpath imports of valid packages', () => {
    const code = `import { parse } from '@babel/parser/lib/parse';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should detect dynamic import() of missing packages', () => {
    const code = `const mod = await import('totally-fake-module');`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });
});
