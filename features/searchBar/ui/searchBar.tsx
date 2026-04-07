"use client";

import { useEffect } from "react";
import styles from "./searchBar.module.css";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";

type Props = {
    value: string;
    onChange: (query: string) => void;
};

export function SearchBar({ value, onChange }: Props) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(value.trim());
        }, 500);

        return () => clearTimeout(timer);
    }, [value, onChange]);

    return (
        <div className={styles.wrapper}>
            <LiquidGlass className={styles.inputWrapper} interactive>
                <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                    <path
                        d="m16.5 16.5 4 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>

                <input
                    className={styles.input}
                    type="text"
                    placeholder="Найти фильм..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />

                {value && (
                    <button
                        className={styles.clear}
                        onClick={() => {
                            onChange("");
                        }}
                    >
                        ✕
                    </button>
                )}
            </LiquidGlass>
        </div>
    );
}
