/**
 * useAppStore — Zustand centralized state management
 *
 * Mban:
 *  - auth slice  : user info (sinkronizuar nga AuthContext)
 *  - sidebar slice: expanded/mobile/hover state
 *  - theme slice  : light/dark mode
 *
 * AuthContext mbetet për token + refresh logic (axios integration).
 * Ky store është "single source of truth" për UI state dhe user info.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";

// ── Types ─────────────────────────────────────────────────────

export interface AppUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "professor" | "student";
}

// ── Auth Slice ────────────────────────────────────────────────

interface AuthSlice {
  user: AppUser | null;
  isAuthLoading: boolean;
  setUser: (user: AppUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

// ── Sidebar Slice ─────────────────────────────────────────────

interface SidebarSlice {
  sidebarExpanded: boolean;
  sidebarMobileOpen: boolean;
  sidebarHovered: boolean;
  toggleSidebarExpanded: () => void;
  toggleSidebarMobile: () => void;
  setSidebarHovered: (hovered: boolean) => void;
  closeMobileSidebar: () => void;
}

// ── Theme Slice ───────────────────────────────────────────────

interface ThemeSlice {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

// ── Combined Store ────────────────────────────────────────────

type AppStore = AuthSlice & SidebarSlice & ThemeSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ── Auth ───────────────────────────────────────────────
        user: null,
        isAuthLoading: true,

        setUser: (user) => set({ user }, false, "auth/setUser"),

        setAuthLoading: (isAuthLoading) =>
          set({ isAuthLoading }, false, "auth/setAuthLoading"),

        clearAuth: () =>
          set({ user: null, isAuthLoading: false }, false, "auth/clearAuth"),

        // ── Sidebar ────────────────────────────────────────────
        sidebarExpanded: true,
        sidebarMobileOpen: false,
        sidebarHovered: false,

        toggleSidebarExpanded: () =>
          set(
            (s) => ({ sidebarExpanded: !s.sidebarExpanded }),
            false,
            "sidebar/toggleExpanded"
          ),

        toggleSidebarMobile: () =>
          set(
            (s) => ({ sidebarMobileOpen: !s.sidebarMobileOpen }),
            false,
            "sidebar/toggleMobile"
          ),

        setSidebarHovered: (hovered) =>
          set({ sidebarHovered: hovered }, false, "sidebar/setHovered"),

        closeMobileSidebar: () =>
          set({ sidebarMobileOpen: false }, false, "sidebar/closeMobile"),

        // ── Theme ──────────────────────────────────────────────
        theme: "light",

        toggleTheme: () => {
          const next = get().theme === "light" ? "dark" : "light";
          if (next === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          set({ theme: next }, false, "theme/toggle");
        },

        setTheme: (theme) => {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          set({ theme }, false, "theme/set");
        },
      }),
      {
        name: "studysync-app-store",
        // Persist vetëm theme (sidebar dhe auth resetohen me page load)
        partialize: (state) => ({ theme: state.theme }),
      }
    ),
    { name: "StudySync Store" }
  )
);

// ── Selector hooks ────────────────────────────────────────────
// useShallow parandalon infinite loop kur selector kthen objekt të ri

export const useAppUser = () => useAppStore((s) => s.user);

export const useAppTheme = () =>
  useAppStore(
    useShallow((s) => ({
      theme: s.theme,
      toggleTheme: s.toggleTheme,
    }))
  );

export const useAppSidebar = () =>
  useAppStore(
    useShallow((s) => ({
      isExpanded:          s.sidebarExpanded,
      isMobileOpen:        s.sidebarMobileOpen,
      isHovered:           s.sidebarHovered,
      toggleSidebar:       s.toggleSidebarExpanded,
      toggleMobileSidebar: s.toggleSidebarMobile,
      setSidebarHovered:   s.setSidebarHovered,
      closeMobileSidebar:  s.closeMobileSidebar,
    }))
  );