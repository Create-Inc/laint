import * as fs from 'node:fs';
import * as path from 'node:path';

const HOOK_COMMAND = 'npx laint check --hook';

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
  hooks?: {
    PostToolUse?: MatcherEntry[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function hasLaintHook(settings: SettingsJson): boolean {
  const postToolUse = settings.hooks?.PostToolUse;
  if (!Array.isArray(postToolUse)) return false;

  return postToolUse.some((entry: MatcherEntry) =>
    entry.hooks?.some((h: HookEntry) => h.command === HOOK_COMMAND),
  );
}

export function runInit(): void {
  const claudeDir = path.resolve('.claude');
  const settingsPath = path.join(claudeDir, 'settings.json');

  const laintHookEntry: MatcherEntry = {
    matcher: 'Edit|Write',
    hooks: [
      {
        type: 'command',
        command: HOOK_COMMAND,
        timeout: 30,
      },
    ],
  };

  let settings: SettingsJson = {};

  if (fs.existsSync(settingsPath)) {
    const raw = fs.readFileSync(settingsPath, 'utf-8');
    settings = JSON.parse(raw) as SettingsJson;

    if (hasLaintHook(settings)) {
      console.log('laint hook already configured in .claude/settings.json — skipping.');
      return;
    }
  }

  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!Array.isArray(settings.hooks.PostToolUse)) {
    settings.hooks.PostToolUse = [];
  }

  settings.hooks.PostToolUse.push(laintHookEntry);

  fs.mkdirSync(claudeDir, { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

  console.log('Created .claude/settings.json with laint PostToolUse hook.');
  console.log('Claude Code will now lint JSX/TSX files after every Edit and Write.');
}
