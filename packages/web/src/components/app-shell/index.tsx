import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import type { ComponentChildren } from "preact";
import { useLocation } from "preact-iso";
import { useEffect, useMemo, useState } from "preact/hooks";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ComponentChildren;
};

type NavLinkProps = {
  href: string;
  children: ComponentChildren;
};

type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "cc-theme-mode";
const THEME_ORDER: ThemeMode[] = ["light", "dark", "system"];
const NAV_LINK_CLASS_NAME =
  "inline-flex min-h-9 items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors";
const ACTIVE_NAV_LINK_CLASS_NAME = `${NAV_LINK_CLASS_NAME} bg-primary text-primary-foreground`;
const INACTIVE_NAV_LINK_CLASS_NAME = `${NAV_LINK_CLASS_NAME} bg-muted text-foreground hover:bg-accent`;

const getThemeLabel = (theme: ThemeMode) => {
  if (theme === "light") return "Light";
  if (theme === "dark") return "Dark";
  return "System";
};

const applyTheme = (mode: ThemeMode) => {
  const systemDark =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : false;
  const isDark = mode === "dark" || (mode === "system" && systemDark);

  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState<ThemeMode>("system");

  const nextTheme =
    THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length];
  const label = getThemeLabel(theme);
  const nextLabel = getThemeLabel(nextTheme);
  const icon = useMemo(() => {
    if (theme === "light") return <IconSun />;
    if (theme === "dark") return <IconMoon />;
    return <IconDeviceDesktop />;
  }, [theme]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
    ) {
      setTheme(savedTheme);
      return;
    }

    setTheme("system");
  }, []);

  useEffect(() => {
    applyTheme(theme);

    if (theme === "system") {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }

    if (typeof window.matchMedia !== "function") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={`Theme: ${label}. Click to switch to ${nextLabel}.`}
      title={`Theme: ${label} → ${nextLabel}`}
      onClick={() => setTheme(nextTheme)}
    >
      {icon}
      <span className="sr-only">Theme mode: {label}</span>
    </Button>
  );
};

const NavLink = ({ children, href }: NavLinkProps) => {
  const { path, route } = useLocation();
  const isActive = path === href;

  return (
    <a
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        isActive ? ACTIVE_NAV_LINK_CLASS_NAME : INACTIVE_NAV_LINK_CLASS_NAME
      }
      onClick={(event) => {
        event.preventDefault();
        route(href);
      }}
    >
      {children}
    </a>
  );
};

const AppShell = ({ children }: AppShellProps) => {
  return (
    <main className="mx-auto flex h-screen min-h-0 max-w-[1440px] flex-col gap-4 overflow-hidden p-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-foreground text-2xl font-bold tracking-tight">
            commoncrawl.cc
          </h1>
          <Badge variant="outline">Console</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/search">Search</NavLink>
          </nav>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </main>
  );
};

export default AppShell;
