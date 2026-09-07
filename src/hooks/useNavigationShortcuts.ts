import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

const navMap: Record<string, string> = {
  d: "/",
  l: "/logs",
  a: "/alerts",
  m: "/monitoring",
  t: "/tickets",
  s: "/status",
  e: "/teams",
  u: "/sla",
  r: "/runbooks",
  x: "/audit",
};

export function useNavigationShortcuts() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const gPressed = useRef(false);
  const gTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Ctrl+Shift+T → cycle theme
      if (e.key === "T" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark");
        return;
      }

      // G + <key> navigation
      if (e.key === "g" && !e.metaKey && !e.ctrlKey) {
        gPressed.current = true;
        clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { gPressed.current = false; }, 1000);
        return;
      }

      if (gPressed.current && navMap[e.key]) {
        e.preventDefault();
        gPressed.current = false;
        navigate(navMap[e.key]);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [navigate, setTheme, theme]);
}
