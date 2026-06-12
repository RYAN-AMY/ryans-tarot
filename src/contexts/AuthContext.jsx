import { createContext, useContext, useState, useCallback } from "react";
import { getProfile, saveProfile, clearProfile } from "../lib/userStore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(() => getProfile());
  const user = profile ? { id: profile.nickname, email: profile.nickname } : null;

  const login = useCallback((nickname) => {
    const p = saveProfile({ nickname });
    setProfile(p);
  }, []);

  const signOut = useCallback(() => {
    clearProfile();
    setProfile(null);
  }, []);

  const value = {
    user,
    profile,
    loading: false,
    signInWithEmail: null,
    signUpWithEmail: null,
    signInWithWeChat: null,
    signOut,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
