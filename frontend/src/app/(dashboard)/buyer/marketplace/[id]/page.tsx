'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

export default function RedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  redirect(`/buyer/crops/${resolvedParams.id}`);
  return null;
}
