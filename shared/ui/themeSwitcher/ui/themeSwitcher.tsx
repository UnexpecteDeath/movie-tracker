"use client";

import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
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
    const [isAnimating, setIsAnimating] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleClick = () => {
        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }

        setIsAnimating(true);
        setTheme(NEXT_THEME[theme]);
        timeoutRef.current = window.setTimeout(() => {
            setIsAnimating(false);
            timeoutRef.current = null;
        }, 520);
    };

    return (
        <button
            className={styles.button}
            onClick={handleClick}
            aria-label={isMounted ? `Тема: ${theme}` : undefined}
            title={isMounted ? `Тема: ${theme}` : undefined}
            data-animating={isAnimating}
            data-theme={isMounted ? theme : undefined}
        >
            {isMounted && (
                <span key={theme} className={styles.icon}>
                    <HugeiconsIcon icon={ICON[theme]} size={18} />
                </span>
            )}
        </button>
    );
}
