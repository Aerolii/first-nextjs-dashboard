'use client';

import { createContext, useContext } from 'react';

export const UserContext = createContext({ user: null, setUser: () => {} });

export default function useUserContext() {
  return useContext(UserContext);
}
