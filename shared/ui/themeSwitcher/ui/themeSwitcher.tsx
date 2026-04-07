"use client";

import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useTheme } from "../../providers/ThemeProvider";
import { useSyncExternalStore } from "react";
import styles from "./themeSwitcher.module.css";

type Theme = "light" | "dark";

const NEXT_THEME: Record<Theme, Theme> = {
    light: "dark",
    dark: "light",
};

const ICON: Record<Theme, IconSvgElement> = {
    light: Sun01Icon,
    dark: Moon02Icon,
};

const useIsMounted = () =>
    useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const isMounted = useIsMounted();

    return (
        <button
            className={styles.button}
            onClick={() => setTheme(NEXT_THEME[theme])}
            aria-label={isMounted ? `Тема: ${theme}` : undefined}
            title={isMounted ? `Тема: ${theme}` : undefined}
        >
            {isMounted && <HugeiconsIcon icon={ICON[theme]} size={18} />}
        </button>
    );
}