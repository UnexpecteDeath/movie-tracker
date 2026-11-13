import type { ReactNode } from "react";
import { classNames } from "@/shared/lib";
import { Card } from "@/shared/ui/card";
import styles from "./gift.module.css";

type Props = {
    className?: string;
    children: ReactNode;
};

export function GiftSkeleton({ className, children }: Props) {
    return (
        <button
            type="button"
            className={classNames(
                styles.tileButton,
                { [styles.tileButtonDisabled]: true },
                [className ?? ""],
            )}
            tabIndex={-1}
            aria-hidden="true"
        >
            <Card className={styles.tile}>
                <div className={styles.tileInner}>{children}</div>
            </Card>
        </button>
    );
}
