import type { ComponentPropsWithRef } from "react";
import { classNames } from "@/shared/lib";
import styles from "./card.module.css";

export function Card({ className, ...props }: ComponentPropsWithRef<"div">) {
    return (
        <div
            className={classNames(styles.card, {}, [className ?? ""])}
            {...props}
        />
    );
}
