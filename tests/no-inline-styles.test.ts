import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-inline-styles';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags style={{...}} on a div', () => {
    const code = `<div style={{ color: 'red', fontSize: 16 }}>Hello</div>`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].message).toContain('Tailwind');
  });

  it('flags style={{...}} on any element', () => {
    const code = `<span style={{ marginTop: 10 }}>text</span>`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('flags multiple inline styles', () => {
    const code = `
      <div style={{ color: 'red' }}>
        <span style={{ fontSize: 12 }}>text</span>
      </div>
    `;
    const results = lint(code);
    expect(results).toHaveLength(2);
  });

  it('allows className prop', () => {
    const code = `<div className="text-red-500">Hello</div>`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows style prop with variable reference', () => {
    const code = `<div style={dynamicStyle}>Hello</div>`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('allows no style prop', () => {
    const code = `<div className="flex">Hello</div>`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
