import { describe, it, expect } from 'vitest';
import { lintJsxCode } from '../src';

const config = { rules: ['require-auth-initiate-call'] };

describe('require-auth-initiate-call rule', () => {
  it('flags layout that destructures isReady and gates render but never calls initiate', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      export default function RootLayout() {
        const { isReady } = useAuth();
        if (!isReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('require-auth-initiate-call');
    expect(results[0].severity).toBe('error');
    expect(results[0].message).toContain('initiate');
  });

  it('flags layout that destructures both but never calls initiate()', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      export default function RootLayout() {
        const { isReady, initiate } = useAuth();
        if (!isReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].message).toContain('useEffect');
  });

  it('allows correct usage: initiate() called in useEffect', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      import { useEffect } from 'react';
      export default function RootLayout() {
        const { initiate, isReady } = useAuth();
        useEffect(() => { initiate(); }, [initiate]);
        if (!isReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('allows aliased isReady when initiate is called', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      import { useEffect } from 'react';
      export default function RootLayout() {
        const { initiate, isReady: authReady } = useAuth();
        useEffect(() => { initiate(); }, [initiate]);
        if (!authReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('flags aliased isReady when initiate is missing', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      export default function RootLayout() {
        const { isReady: authReady } = useAuth();
        if (!authReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
  });

  it('allows member-access initiate: auth.initiate()', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      import { useEffect } from 'react';
      export default function RootLayout() {
        const { isReady } = useAuth();
        const auth = useAuth();
        useEffect(() => { auth.initiate(); }, [auth]);
        if (!isReady) return null;
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('allows non-gate isReady reads (e.g. small spinner conditional)', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      export function ProfileTab() {
        const { isReady, auth } = useAuth();
        return <View>{isReady ? <Profile user={auth.user} /> : null}</View>;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('does not fire when useAuth is not used', () => {
    const code = `
      export default function RootLayout() {
        return <Stack />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('does not fire when useAuth is used but isReady is not destructured', () => {
    const code = `
      import { useAuth } from '@/utils/auth/useAuth';
      export function SignInButton() {
        const { signIn } = useAuth();
        return <Button onPress={signIn} />;
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(0);
  });

  it('catches the regression: agent-stripped layout', () => {
    const code = `
      import { Stack } from 'expo-router';
      import { SafeAreaProvider } from 'react-native-safe-area-context';
      import { useAuth } from '@/utils/auth/useAuth';

      export default function RootLayout() {
        const { isReady } = useAuth();
        if (!isReady) {
          return null;
        }
        return (
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </SafeAreaProvider>
        );
      }
    `;
    const results = lintJsxCode(code, config);
    expect(results).toHaveLength(1);
    expect(results[0].rule).toBe('require-auth-initiate-call');
  });
});
