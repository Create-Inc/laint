import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-server-import-in-client'] };

describe('no-server-import-in-client rule', () => {
  it('should flag server-only import in "use client" file', () => {
    const code = `
      "use client";
      import 'server-only';
      export function Component() {
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-server-import-in-client');
    expect(results[0].message).toContain('server-only');
    expect(results[0].severity).toBe('error');
  });

  it('should flag next/headers import in "use client" file', () => {
    const code = `
      "use client";
      import { headers } from 'next/headers';
      export function Component() {
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('next/headers');
  });

  it('should flag multiple server-only imports', () => {
    const code = `
      "use client";
      import 'server-only';
      import { headers } from 'next/headers';
      export function Component() {
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should flag re-exports from server-only modules', () => {
    const code = `
      "use client";
      export { headers } from 'next/headers';
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('re-exported');
  });

  it('should allow server-only imports without "use client" directive', () => {
    const code = `
      import 'server-only';
      import { headers } from 'next/headers';
      export function ServerComponent() {
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow server-only imports in "use server" files', () => {
    const code = `
      "use server";
      import { headers } from 'next/headers';
      export async function getHeaders() {
        return headers();
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow type-only imports from server modules', () => {
    const code = `
      "use client";
      import type { HeadersFunction } from 'next/headers';
      export function Component() {
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow normal imports in "use client" files', () => {
    const code = `
      "use client";
      import { useState } from 'react';
      import Link from 'next/link';
      export function Component() {
        return <Link href="/">Home</Link>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
