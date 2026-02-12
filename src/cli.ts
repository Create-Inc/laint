#!/usr/bin/env node

import { runInit } from './cli/init';
import { runCheck } from './cli/check';

const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
  if (command === 'init') {
    runInit();
  } else if (command === 'check') {
    await runCheck(args.slice(1));
  } else {
    console.error(`Usage: laint <command>

Commands:
  init           Set up Claude Code hook for automatic linting
  check <file>   Lint a JSX/TSX file
  check --hook   Lint via Claude Code hook (reads stdin)`);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
