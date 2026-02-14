import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-placeholder-comments'] };

describe('no-placeholder-comments rule', () => {
  it('should detect TODO comments', () => {
    const code = `// TODO: implement this later`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-placeholder-comments');
  });

  it('should detect FIXME comments', () => {
    const code = `// FIXME: broken logic`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect "add your code here" comments', () => {
    const code = `// Add your logic here`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect "implement this" comments', () => {
    const code = `// implement this`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect placeholder comments', () => {
    const code = `// placeholder for auth logic`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect "replace this" comments', () => {
    const code = `// replace this with real implementation`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect "fill in" comments', () => {
    const code = `// fill in the details`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should not flag regular comments', () => {
    const code = `// This component handles user authentication`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag code without comments', () => {
    const code = `const x = 5;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should detect comments in multi-line blocks', () => {
    const code = `/* TODO: fix this */`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });
});
