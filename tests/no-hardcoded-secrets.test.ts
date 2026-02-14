import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-hardcoded-secrets'] };

describe('no-hardcoded-secrets rule', () => {
  it('should detect hardcoded API keys', () => {
    const code = `const apiKey = 'my-secret-api-key-12345';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-hardcoded-secrets');
    expect(results[0].severity).toBe('error');
  });

  it('should detect hardcoded passwords', () => {
    const code = `const password = 'hunter2';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect hardcoded tokens in objects', () => {
    const code = `const config = { authToken: 'abc123secret' };`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect Stripe-style secret keys by value pattern', () => {
    const code = `const key = 'sk-test-fakefakefakefakefakefake';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect GitHub tokens by value pattern', () => {
    const code = `const token = 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx00';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect AWS access keys by value pattern', () => {
    const code = `const key = 'AKIAIOSFODNN7EXAMPLE';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should detect database URLs', () => {
    const code = `const databaseUrl = 'postgresql://user:pass@host:5432/db';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('should allow environment variable references', () => {
    const code = `const apiKey = process.env.API_KEY;`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow non-secret string variables', () => {
    const code = `const name = 'John Doe';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow empty strings for secret-named variables', () => {
    const code = `const apiKey = '';`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag regular config objects', () => {
    const code = `const config = { timeout: '30s', retries: '3' };`;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
