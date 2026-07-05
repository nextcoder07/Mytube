// frontend/src/hooks/useAuth.ts
import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const { user, token, loading: isLoading, login: signIn, logout: signOut } = useAuthStore();
  return { user, token, isLoading, signIn, signOut, isAuthenticated: !!token };
}

