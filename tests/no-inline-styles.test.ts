import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-inline-styles'] };

describe('no-inline-styles rule', () => {
  it('should flag inline style object on div', () => {
    const code = `<div style={{ color: 'red' }} />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-inline-styles');
    expect(results[0].message).toContain('Avoid inline styles');
    expect(results[0].severity).toBe('warning');
  });

  it('should flag style reference on View', () => {
    const code = `<View style={styles.container} />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-inline-styles');
  });

  it('should flag style array on Text', () => {
    const code = `<Text style={[styles.a, styles.b]} />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-inline-styles');
  });

  it('should not flag className usage', () => {
    const code = `<div className="text-red-500" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag HTML style element', () => {
    const code = `<style>{css}</style>`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag elements without style prop', () => {
    const code = `<div className="flex" id="main" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
