import { create } from 'zustand';

// HttpOnly 쿠키 인증: 프론트는 accessToken을 직접 들고 있지 않고, 유저 정보와
// 로그인 상태만 보관한다. 로그인 여부는 GET /api/v1/auth/me의 200/401로 판단.
export interface AuthUser {
  email: string;
  name: string;
  onboarded?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean; // 세션 복구(/auth/me) 진행 중 깜빡임 방지
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: true, isLoading: false }),
  clearUser: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  setLoading: (v) => set({ isLoading: v }),
}));
