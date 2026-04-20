"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import styles from "./error.module.css";

type ErrorPageProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className={styles.page}>
            <div className={styles.glowTop} />
            <div className={styles.glowBottom} />

            <LiquidGlass
                className={classNames(styles.card, {}, [])}
                radius="xl"
                padding="lg"
            >
                <div className={styles.content}>
                    <p className={styles.code}>500</p>

                    <h1 className={styles.title}>Что-то пошло не так</h1>

                    <p className={styles.description}>
                        Не удалось загрузить страницу. Попробуйте ещё раз или
                        вернитесь на главную.
                    </p>

                    <div className={styles.actions}>
                        <button
                            className={classNames(styles.button, {}, [
                                styles.primary,
                            ])}
                            type="button"
                            onClick={reset}
                        >
                            Повторить
                        </button>

                        <Link
                            href="/"
                            className={classNames(styles.button, {}, [
                                styles.secondary,
                            ])}
                        >
                            На главную
                        </Link>
                    </div>
                </div>
            </LiquidGlass>
        </main>
    );
}
