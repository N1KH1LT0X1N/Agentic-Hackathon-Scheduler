'use client';

import { ErrorBoundary } from './error-boundary';
import { ReactNode } from 'react';

export function ClientErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}
