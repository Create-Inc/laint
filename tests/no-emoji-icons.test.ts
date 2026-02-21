import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const RULE = 'no-emoji-icons';

function lint(code: string) {
  return lintJsxCode(code, { rules: [RULE] });
}

describe(RULE, () => {
  it('flags emoji in JSXText', () => {
    const code = `<Text>✅ Done</Text>`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
    expect(results[0].severity).toBe('warning');
    expect(results[0].message).toContain('lucide-react');
  });

  it('flags emoji in string attribute', () => {
    const code = `<Button label="🔥 Hot" />`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe(RULE);
  });

  it('flags multiple emoji occurrences', () => {
    const code = `
      <View>
        <Text>⚠️ Warning</Text>
        <Button label="🎉 Celebrate" />
      </View>
    `;
    const results = lint(code);
    expect(results).toHaveLength(2);
  });

  it('passes plain text without emoji', () => {
    const code = `<Text>Hello world</Text>`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('passes icon component usage', () => {
    const code = `<Icon name="check" />`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('passes regular strings without emoji', () => {
    const code = `const msg = "Hello world";`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
