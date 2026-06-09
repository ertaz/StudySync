/**
 * ZustandSync
 *
 * Komponenti i vetëm që "urëzon" AuthContext → Zustand store.
 * Nuk render-on asgjë — vetëm sinkronizon state-in.
 *
 * Pse nevojitet: AuthContext mban token + refresh logic (axios),
 * ndërsa Zustand store është "single source of truth" për UI.
 */

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../store/useAppStore";

export const ZustandSync: React.FC = () => {
  const { user, loading } = useAuth();
  const setUser        = useAppStore((s) => s.setUser);
  const setAuthLoading = useAppStore((s) => s.setAuthLoading);

  useEffect(() => {
    setUser(user);
    setAuthLoading(loading);
  }, [user, loading, setUser, setAuthLoading]);

  return null;
};
