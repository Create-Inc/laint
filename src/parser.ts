import { parse } from '@babel/parser';
import type { File } from '@babel/types';

export function parseJsx(code: string): File {
  return parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  });
}
