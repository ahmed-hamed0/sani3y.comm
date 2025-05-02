
import { createContext, useContext, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { UserRole } from '@/types';

type UserData = SupabaseUser & {
  role?: UserRole | null;
};

export type AuthContextType = {
  user: UserData | null;
  loading: boolean;
  role: UserRole | null;
  isClient: boolean;
  isCraftsman: boolean;
  refreshProfile: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: null,
  isClient: false,
  isCraftsman: false,
  refreshProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);
