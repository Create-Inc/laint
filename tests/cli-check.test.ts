import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const CLI_PATH = path.resolve('dist/cli.js');

interface ExecError {
  stdout: string;
  stderr: string;
  status: number;
}

function run(args: string[], options?: { input?: string; cwd?: string }) {
  try {
    const stdout = execFileSync('node', [CLI_PATH, ...args], {
      input: options?.input,
      cwd: options?.cwd,
      encoding: 'utf-8',
      timeout: 15000,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (err: unknown) {
    const e = err as ExecError;
    return {
      stdout: e.stdout ?? '',
      stderr: e.stderr ?? '',
      exitCode: e.status,
    };
  }
}

describe('laint check', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'laint-check-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  describe('file mode', () => {
    it('should report violations for a file with issues', () => {
      const file = path.join(tmpDir, 'bad.tsx');
      fs.writeFileSync(file, `import { Image } from 'react-native';\n`);
      const result = run(['check', file]);
      expect(result.exitCode).toBe(1);
      expect(result.stdout).toContain('expo-image-import');
      expect(result.stdout).toContain(file);
    });

    it('should exit 0 for a clean file', () => {
      const file = path.join(tmpDir, 'clean.tsx');
      fs.writeFileSync(file, `export const Foo = () => <div>hello</div>;\n`);
      const result = run(['check', file]);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('');
    });

    it('should exit 1 with error for missing file', () => {
      const result = run(['check', path.join(tmpDir, 'nope.tsx')]);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('File not found');
    });

    it('should output file:line:col severity [rule] message format', () => {
      const file = path.join(tmpDir, 'format.tsx');
      fs.writeFileSync(file, `import { Image } from 'react-native';\n`);
      const result = run(['check', file]);
      const line = result.stdout.trim().split('\n')[0];
      // format: filepath:line:col severity [rule] message
      expect(line).toMatch(/^.+:\d+:\d+ \w+ \[[\w-]+\] .+$/);
    });

    it('should respect laint.config.json', () => {
      const file = path.join(tmpDir, 'test.tsx');
      // This file triggers expo-image-import rule
      fs.writeFileSync(file, `import { Image } from 'react-native';\n`);

      // Config that only enables a different rule — should find no violations
      fs.writeFileSync(
        path.join(tmpDir, 'laint.config.json'),
        JSON.stringify({ rules: ['no-relative-paths'] }),
      );

      const result = run(['check', file], { cwd: tmpDir });
      expect(result.exitCode).toBe(0);
    });
  });

  describe('hook mode (--hook)', () => {
    it('should lint file from stdin JSON and report violations on stderr', () => {
      const file = path.join(tmpDir, 'hook-bad.tsx');
      fs.writeFileSync(file, `import { Image } from 'react-native';\n`);

      const input = JSON.stringify({ tool_input: { file_path: file } });
      const result = run(['check', '--hook'], { input });
      expect(result.exitCode).toBe(2);
      expect(result.stderr).toContain('expo-image-import');
    });

    it('should exit 0 silently for clean file', () => {
      const file = path.join(tmpDir, 'hook-clean.tsx');
      fs.writeFileSync(file, `export const Foo = () => <div>ok</div>;\n`);

      const input = JSON.stringify({ tool_input: { file_path: file } });
      const result = run(['check', '--hook'], { input });
      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toBe('');
    });

    it('should skip non-JSX/TSX files silently', () => {
      const file = path.join(tmpDir, 'script.ts');
      fs.writeFileSync(file, `console.log('hello');\n`);

      const input = JSON.stringify({ tool_input: { file_path: file } });
      const result = run(['check', '--hook'], { input });
      expect(result.exitCode).toBe(0);
    });

    it('should skip when file_path is missing', () => {
      const input = JSON.stringify({ tool_input: {} });
      const result = run(['check', '--hook'], { input });
      expect(result.exitCode).toBe(0);
    });

    it('should handle malformed JSON gracefully', () => {
      const result = run(['check', '--hook'], { input: 'not json' });
      expect(result.exitCode).toBe(0);
    });

    it('should handle missing file gracefully', () => {
      const input = JSON.stringify({ tool_input: { file_path: '/tmp/nonexistent.tsx' } });
      const result = run(['check', '--hook'], { input });
      expect(result.exitCode).toBe(0);
    });
  });

  describe('no arguments', () => {
    it('should print usage and exit 1 when no file given', () => {
      const result = run(['check']);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Usage');
    });
  });
});
