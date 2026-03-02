import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['no-react-native-in-web'] };

describe('no-react-native-in-web rule', () => {
  it('should detect import from react-native', () => {
    const code = `
      import { View, Text } from 'react-native';
      export default function App() {
        return <View><Text>Hello</Text></View>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('no-react-native-in-web');
    expect(results[0].message).toContain('react-native');
    expect(results[0].severity).toBe('error');
  });

  it('should detect import from react-native-web', () => {
    const code = `
      import { View } from 'react-native-web';
      export default function App() {
        return <View />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('react-native-web');
  });

  it('should detect require of react-native', () => {
    const code = `
      const { View } = require('react-native');
      export default function App() {
        return <View />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('react-native');
  });

  it('should allow other imports', () => {
    const code = `
      import React from 'react';
      import { useState } from 'react';
      export default function App() {
        return <div>Hello</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('should allow react-native subpackage imports', () => {
    const code = `
      import something from 'react-native-safe-area-context';
      export default function App() {
        return <div>Hello</div>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });
});
