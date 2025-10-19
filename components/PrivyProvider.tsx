'use client';

import { PrivyProvider as Privy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Privy
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#f7931a',
          logo: '/osfun.png',
        },
        loginMethods: ['twitter', 'wallet'],
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
      onSuccess={(user) => {
        console.log('User logged in:', user);
        router.push('/profile');
      }}
    >
      {children}
    </Privy>
  );
}

