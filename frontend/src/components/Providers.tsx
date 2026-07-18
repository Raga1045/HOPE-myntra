'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, initializeSession } from '../store/store';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeSession());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
