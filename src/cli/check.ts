import * as fs from 'node:fs';
import * as path from 'node:path';
import { lintJsxCode } from '../index';
import type { LintConfig, LintResult } from '../types';

const JSX_EXTENSIONS = new Set(['.jsx', '.tsx']);

function loadConfig(): LintConfig {
  const configPath = path.resolve('laint.config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw) as LintConfig;
  }
  // Default: run all rules
  return { rules: [], exclude: true };
}

function formatResult(filePath: string, r: LintResult): string {
  return `${filePath}:${String(r.line)}:${String(r.column)} ${r.severity} [${r.rule}] ${r.message}`;
}

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    process.stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    process.stdin.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf-8'));
    });
    process.stdin.on('error', reject);
  });
}

async function runHookMode(): Promise<void> {
  let input: string;
  try {
    input = await readStdin();
  } catch {
    // Can't read stdin — don't block Claude
    process.exit(0);
  }

  let filePath: string;
  try {
    const data = JSON.parse(input) as { tool_input?: { file_path?: string } };
    filePath = data.tool_input?.file_path ?? '';
  } catch {
    // Malformed JSON — don't block Claude
    process.exit(0);
  }

  if (!filePath) {
    process.exit(0);
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!JSX_EXTENSIONS.has(ext)) {
    process.exit(0);
  }

  let code: string;
  try {
    code = fs.readFileSync(filePath, 'utf-8');
  } catch {
    // File doesn't exist or can't be read — don't block Claude
    process.exit(0);
  }

  const config = loadConfig();
  let results: LintResult[];
  try {
    results = lintJsxCode(code, config);
  } catch {
    // Parse error or rule error — don't block Claude
    process.exit(0);
  }

  if (results.length === 0) {
    process.exit(0);
  }

  const output = results.map((r) => formatResult(filePath, r)).join('\n');
  process.stderr.write(output + '\n');
  process.exit(2);
}

function runFileMode(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const code = fs.readFileSync(filePath, 'utf-8');
  const config = loadConfig();
  const results = lintJsxCode(code, config);

  if (results.length === 0) {
    process.exit(0);
  }

  for (const r of results) {
    console.log(formatResult(filePath, r));
  }
  process.exit(1);
}

export async function runCheck(args: string[]): Promise<void> {
  if (args.includes('--hook')) {
    await runHookMode();
    return;
  }

  const filePath = args[0];
  if (!filePath) {
    console.error('Usage: laint check <file> or laint check --hook');
    process.exit(1);
  }

  runFileMode(filePath);
}
