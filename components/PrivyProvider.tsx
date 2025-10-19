'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
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

