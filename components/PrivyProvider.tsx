'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
  
  // Only bypass if explicitly undefined or empty (not if it's the production ID)
  if (!appId) {
    console.warn('Privy app ID not configured');
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

