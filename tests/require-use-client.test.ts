import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['require-use-client'] };

describe('require-use-client rule', () => {
  it('should flag useState without directive', () => {
    const code = `
      import { useState } from 'react';
      function Counter() {
        const [count, setCount] = useState(0);
        return <div>{count}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('require-use-client');
    expect(results[0].message).toContain('useState()');
    expect(results[0].severity).toBe('error');
  });

  it('should flag useEffect without directive', () => {
    const code = `
      import { useEffect } from 'react';
      function Component() {
        useEffect(() => {}, []);
        return <div />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('useEffect()');
  });

  it('should flag onClick event handler without directive', () => {
    const code = `
      function Button() {
        return <button onClick={() => alert('hi')}>Click</button>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('onClick');
  });

  it('should flag multiple event handlers', () => {
    const code = `
      function Form() {
        return (
          <form onSubmit={() => {}}>
            <input onChange={() => {}} />
          </form>
        );
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should flag createContext without directive', () => {
    const code = `
      import { createContext } from 'react';
      const MyContext = createContext(null);
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('createContext()');
  });

  it('should flag React.createContext without directive', () => {
    const code = `
      import React from 'react';
      const MyContext = React.createContext(null);
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('React.createContext()');
  });

  it('should flag multiple client-only features', () => {
    const code = `
      import { useState } from 'react';
      function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(2);
  });

  it('should allow code with "use client" directive', () => {
    const code = `
      "use client";
      import { useState } from 'react';
      function Counter() {
        const [count, setCount] = useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow code with "use server" directive', () => {
    const code = `
      "use server";
      export async function submitForm() {
        const result = useFormState();
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow code with no client-only features', () => {
    const code = `
      export function ServerComponent() {
        return <div>Hello World</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag custom hook definitions (only calls)', () => {
    const code = `
      export function useCustomHook() {
        return 42;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
