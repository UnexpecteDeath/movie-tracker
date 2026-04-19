import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { classNames } from "@/shared/lib";
import styles from "./LiquidGlass.module.css";

type LiquidGlassRadius = "sm" | "md" | "lg" | "xl" | "full";
type LiquidGlassPadding = "none" | "sm" | "md" | "lg";

type Props = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    className?: string;
    radius?: LiquidGlassRadius;
    padding?: LiquidGlassPadding;
    shadow?: boolean;
    interactive?: boolean;
};

export const LiquidGlass = forwardRef<HTMLDivElement, Props>(
    (
        {
            children,
            className,
            radius = "lg",
            padding = "md",
            shadow = true,
            interactive = false,
            ...props
        },
        ref,
    ) => {
        return (
            <div
                ref={ref}
                className={classNames(
                    styles.liquidGlass,
                    {
                        [styles.radiusSm]: radius === "sm",
                        [styles.radiusMd]: radius === "md",
                        [styles.radiusLg]: radius === "lg",
                        [styles.radiusXl]: radius === "xl",
                        [styles.radiusFull]: radius === "full",

                        [styles.paddingNone]: padding === "none",
                        [styles.paddingSm]: padding === "sm",
                        [styles.paddingMd]: padding === "md",
                        [styles.paddingLg]: padding === "lg",
                        [styles.shadow]: shadow,
                        [styles.interactive]: interactive,
                    },
                    [className || ""],
                )}
                {...props}
            >
                <div className={styles.innerHighlight} />
                {children}
            </div>
        );
    },
);

LiquidGlass.displayName = "LiquidGlass";
