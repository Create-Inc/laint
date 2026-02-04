import { parse } from '@babel/parser';
export function parseJsx(code) {
    return parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
    });
}
