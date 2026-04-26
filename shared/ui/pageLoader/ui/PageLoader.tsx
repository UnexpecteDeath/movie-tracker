import type { HTMLAttributes } from "react";
import { classNames } from "@/shared/lib";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import styles from "./PageLoader.module.css";

type PageLoaderMode = "fullscreen" | "container";
type PageLoaderSize = "sm" | "md" | "lg";

type Props = HTMLAttributes<HTMLDivElement> & {
    className?: string;
    mode?: PageLoaderMode;
    size?: PageLoaderSize;
    label?: string;
};

export function PageLoader({
    className,
    mode = "container",
    size = "md",
    label = "Загрузка",
    ...props
}: Props) {
    return (
        <div
            className={classNames(
                styles.root,
                {
                    [styles.fullscreen]: mode === "fullscreen",
                    [styles.container]: mode === "container",
                    [styles.sizeSm]: size === "sm",
                    [styles.sizeMd]: size === "md",
                    [styles.sizeLg]: size === "lg",
                },
                [className || ""],
            )}
            role="status"
            aria-live="polite"
            aria-label={label}
            {...props}
        >
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <LiquidGlass
                className={styles.card}
                radius="xl"
                padding="lg"
                shadow
            >
                <div className={styles.orbit} aria-hidden="true">
                    <span className={styles.ring} />
                    <span className={styles.ring} />
                    <span className={styles.core} />
                </div>

                <div className={styles.copy}>
                    <p className={styles.label}>{label}</p>
                    <p className={styles.caption}>Подготавливаем ваше кино.</p>
                </div>
            </LiquidGlass>
        </div>
    );
}
