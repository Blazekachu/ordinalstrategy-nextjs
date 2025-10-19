'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

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

