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
    interactive?: boolean;
    optimizeForMobile?: boolean;
};

export const LiquidGlass = forwardRef<HTMLDivElement, Props>(
    (
        {
            children,
            className,
            radius = "lg",
            padding = "md",
            interactive = false,
            optimizeForMobile = true,
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
                        [styles.interactive]: interactive,
                    },
                    [className || ""],
                )}
                {...props}
                data-mobile-optimized={optimizeForMobile ? "" : undefined}
            >
                <div className={styles.innerHighlight} />
                {children}
            </div>
        );
    },
);

LiquidGlass.displayName = "LiquidGlass";
