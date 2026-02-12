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

interface HookEntry {
  type: string;
  command: string;
  timeout?: number;
}

interface MatcherEntry {
  matcher: string;
  hooks: HookEntry[];
}

interface SettingsJson {
  permissions?: { allow: string[] };
  hooks?: {
    PreToolUse?: MatcherEntry[];
    PostToolUse?: MatcherEntry[];
  };
}

function run(args: string[], options?: { cwd?: string }) {
  try {
    const stdout = execFileSync('node', [CLI_PATH, ...args], {
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

function readSettings(tmpDir: string): SettingsJson {
  const raw = fs.readFileSync(path.join(tmpDir, '.claude', 'settings.json'), 'utf-8');
  return JSON.parse(raw) as SettingsJson;
}

describe('laint init', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'laint-init-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should create .claude/settings.json when it does not exist', () => {
    const result = run(['init'], { cwd: tmpDir });
    expect(result.exitCode).toBe(0);

    const settingsPath = path.join(tmpDir, '.claude', 'settings.json');
    expect(fs.existsSync(settingsPath)).toBe(true);

    const settings = readSettings(tmpDir);
    expect(settings.hooks?.PostToolUse).toHaveLength(1);
    expect(settings.hooks?.PostToolUse?.[0].matcher).toBe('Edit|Write');
    expect(settings.hooks?.PostToolUse?.[0].hooks[0].command).toBe('npx laint check --hook');
    expect(settings.hooks?.PostToolUse?.[0].hooks[0].timeout).toBe(30);
  });

  it('should merge into existing .claude/settings.json without clobbering', () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });

    const existing = {
      permissions: { allow: ['Read'] },
      hooks: {
        PreToolUse: [{ matcher: '*', hooks: [{ type: 'command', command: 'echo pre' }] }],
      },
    };
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(existing, null, 2));

    const result = run(['init'], { cwd: tmpDir });
    expect(result.exitCode).toBe(0);

    const settings = readSettings(tmpDir);
    // Existing settings preserved
    expect(settings.permissions?.allow).toEqual(['Read']);
    expect(settings.hooks?.PreToolUse).toHaveLength(1);
    // laint hook added
    expect(settings.hooks?.PostToolUse).toHaveLength(1);
    expect(settings.hooks?.PostToolUse?.[0].hooks[0].command).toBe('npx laint check --hook');
  });

  it('should skip if laint hook already present', () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });

    const existing = {
      hooks: {
        PostToolUse: [
          {
            matcher: 'Edit|Write',
            hooks: [{ type: 'command', command: 'npx laint check --hook', timeout: 30 }],
          },
        ],
      },
    };
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(existing, null, 2));

    const result = run(['init'], { cwd: tmpDir });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already configured');

    // Should not duplicate the hook
    const settings = readSettings(tmpDir);
    expect(settings.hooks?.PostToolUse).toHaveLength(1);
  });

  it('should be idempotent — running twice is safe', () => {
    run(['init'], { cwd: tmpDir });
    const result = run(['init'], { cwd: tmpDir });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('already configured');

    const settings = readSettings(tmpDir);
    expect(settings.hooks?.PostToolUse).toHaveLength(1);
  });

  it('should append to existing PostToolUse hooks', () => {
    const claudeDir = path.join(tmpDir, '.claude');
    fs.mkdirSync(claudeDir, { recursive: true });

    const existing = {
      hooks: {
        PostToolUse: [
          {
            matcher: 'Bash',
            hooks: [{ type: 'command', command: 'echo done' }],
          },
        ],
      },
    };
    fs.writeFileSync(path.join(claudeDir, 'settings.json'), JSON.stringify(existing, null, 2));

    const result = run(['init'], { cwd: tmpDir });
    expect(result.exitCode).toBe(0);

    const settings = readSettings(tmpDir);
    expect(settings.hooks?.PostToolUse).toHaveLength(2);
    expect(settings.hooks?.PostToolUse?.[0].matcher).toBe('Bash');
    expect(settings.hooks?.PostToolUse?.[1].matcher).toBe('Edit|Write');
  });
});
