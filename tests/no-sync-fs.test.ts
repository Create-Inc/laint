import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-sync-fs'] };

function lint(code: string) {
  return lintJsxCode(code, config);
}

describe('no-sync-fs', () => {
  it('should flag fs.readFileSync()', () => {
    const code = `import fs from 'fs';\nfs.readFileSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-sync-fs');
    expect(results[0].message).toContain('fs.promises.readFile');
    expect(results[0].severity).toBe('error');
  });

  it('should flag fs.writeFileSync()', () => {
    const code = `import fs from 'fs';\nfs.writeFileSync('file.txt', 'data');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('fs.promises.writeFile');
  });

  it('should flag fs.existsSync()', () => {
    const code = `import fs from 'fs';\nfs.existsSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('fs.promises.exists');
  });

  it('should flag fs.mkdirSync()', () => {
    const code = `import fs from 'fs';\nfs.mkdirSync('dir');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('fs.promises.mkdir');
  });

  it('should flag destructured sync imports from fs', () => {
    const code = `import { readFileSync } from 'fs';\nreadFileSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-sync-fs');
    expect(results[0].message).toContain('fs.promises.readFile');
  });

  it('should flag multiple destructured sync imports', () => {
    const code = `import { readFileSync, writeFileSync } from 'fs';\nreadFileSync('a');\nwriteFileSync('b', 'c');`;
    const results = lint(code);
    expect(results).toHaveLength(2);
  });

  it('should flag imports from node:fs', () => {
    const code = `import fs from 'node:fs';\nfs.readFileSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
  });

  it('should flag namespace imports from fs', () => {
    const code = `import * as fs from 'fs';\nfs.statSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('fs.promises.stat');
  });

  it('should flag multiple sync calls', () => {
    const code = `import fs from 'fs';\nfs.readFileSync('a');\nfs.writeFileSync('b', 'c');\nfs.mkdirSync('d');`;
    const results = lint(code);
    expect(results).toHaveLength(3);
  });

  // --- Should allow ---

  it('should allow fs.promises.readFile()', () => {
    const code = `import fs from 'fs';\nawait fs.promises.readFile('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow imports from fs/promises', () => {
    const code = `import { readFile } from 'fs/promises';\nawait readFile('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should allow async callback-style fs methods', () => {
    const code = `import fs from 'fs';\nfs.readFile('file.txt', (err, data) => {});`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should not flag readFileSync on non-fs objects', () => {
    const code = `someObj.readFileSync('file.txt');`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });

  it('should not flag a function named readFileSync unrelated to fs', () => {
    const code = `function readFileSync() { return 'mock'; }\nreadFileSync();`;
    const results = lint(code);
    expect(results).toHaveLength(0);
  });
});
