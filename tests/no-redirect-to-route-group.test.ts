import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-redirect-to-route-group'] };

describe('no-redirect-to-route-group rule', () => {
  it('flags <Redirect href="/(tabs)" />', () => {
    const code = `
      import { Redirect } from 'expo-router';
      export default function Index() {
        return <Redirect href="/(tabs)" />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-redirect-to-route-group');
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('"/(tabs)"');
  });

  it('flags <Redirect href="(tabs)" /> without leading slash', () => {
    const code = `<Redirect href="(tabs)" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('flags <Redirect href="/(tabs)/" /> with trailing slash', () => {
    const code = `<Redirect href="/(tabs)/" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('flags <Redirect href="/(auth)/(tabs)" /> with multiple group segments', () => {
    const code = `<Redirect href="/(auth)/(tabs)" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('allows <Redirect href="/(tabs)/explore" /> with concrete sub-route', () => {
    const code = `<Redirect href="/(tabs)/explore" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('allows <Redirect href="/explore" />', () => {
    const code = `<Redirect href="/explore" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('allows <Redirect href="/" />', () => {
    const code = `<Redirect href="/" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('handles JSXExpressionContainer string literal', () => {
    const code = `<Redirect href={"/(tabs)"} />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('ignores non-Redirect components', () => {
    const code = `<Link href="/(tabs)" />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('ignores Redirect with dynamic href expression', () => {
    const code = `<Redirect href={someVar} />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('ignores Redirect without an href attribute', () => {
    const code = `<Redirect />`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
