import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['ssr-browser-api-guard'] };

describe('ssr-browser-api-guard rule', () => {
  it('should detect window access in a server component (no "use client")', () => {
    const code = `
      function Component() {
        const width = window.innerWidth;
        return <div>{width}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('ssr-browser-api-guard');
    expect(results[0].message).toContain('SSR');
    expect(results[0].severity).toBe('error');
  });

  it('should detect localStorage in a server component', () => {
    const code = `
      function Component() {
        const token = localStorage.getItem('token');
        return <div>{token}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('localStorage');
  });

  it('should detect navigator access in a server component', () => {
    const code = `
      function Component() {
        const lang = navigator.language;
        return <div>{lang}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('navigator');
  });

  it('should NOT flag files with "use client" directive', () => {
    const code = `
      "use client";
      function Component() {
        const width = window.innerWidth;
        return <div>{width}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow access inside useEffect', () => {
    const code = `
      function Component() {
        useEffect(() => {
          const width = window.innerWidth;
          console.log(width);
        }, []);
        return <div>Hello</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow access with typeof guard', () => {
    const code = `
      function Component() {
        if (typeof window !== 'undefined') {
          const width = window.innerWidth;
        }
        return <div>Hello</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow access with && short-circuit typeof guard', () => {
    const code = `
      function Component() {
        const width = typeof window !== 'undefined' && window.innerWidth;
        return <div>{width}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow access in event handlers', () => {
    const code = `
      function Component() {
        return <button onClick={() => window.scrollTo(0, 0)}>Top</button>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should not flag typeof window checks themselves', () => {
    const code = `
      function Component() {
        const isClient = typeof window !== 'undefined';
        return <div>{isClient ? 'client' : 'server'}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should detect direct alert() call in server component', () => {
    const code = `
      function Component() {
        alert('hello');
        return <div>Hello</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('alert');
  });

  it('should allow code without browser APIs', () => {
    const code = `
      function Component() {
        const [count, setCount] = useState(0);
        return <div>{count}</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
