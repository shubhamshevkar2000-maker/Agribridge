'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role) {
      router.push('/login');
      return;
    }

    const roleRedirects: Record<string, string> = {
      farmer: '/farmer',
      buyer: '/buyer',
      logistics: '/logistics',
      bank: '/bank',
      admin: '/admin',
    };

    router.push(roleRedirects[role] || '/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <span className="text-sm text-muted-foreground font-medium">Redirecting you to your dashboard...</span>
      </div>
    </div>
  );
}
