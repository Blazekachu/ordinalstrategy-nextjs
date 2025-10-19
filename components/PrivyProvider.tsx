'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // If no valid app ID is configured, render children without Privy wrapper for local dev
  if (!appId || appId === 'your-privy-app-id-here') {
    console.warn('Privy not configured. Authentication features will be disabled.');
    return <>{children}</>;
  }

  return (
    <Privy
      appId={appId}
      config={{
        appearance: {
          theme: 'dark' as const,
          accentColor: '#f7931a',
          logo: '/osfun.png',
        },
      }}
    >
      {children}
    </Privy>
  );
}

