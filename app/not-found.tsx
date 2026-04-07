import Link from "next/link";
import styles from "./not-found.module.css";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";

export default function NotFound() {
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
                    <p className={styles.code}>404</p>

                    <h1 className={styles.title}>Страница не найдена</h1>

                    <p className={styles.description}>
                        Похоже, такой страницы здесь нет. Возможно, ссылка
                        устарела или мы просто потеряли её где-то между
                        фильмами, заметками и уютными вечерами.
                    </p>

                    <div className={styles.actions}>
                        <Link
                            href="/"
                            className={classNames(styles.button, {}, [
                                styles.secondary,
                            ])}
                        >
                            На главную
                        </Link>

                        <Link
                            href="/movies"
                            className={classNames(styles.button, {}, [
                                styles.secondary,
                            ])}
                        >
                            Открыть фильмы
                        </Link>
                    </div>
                </div>
            </LiquidGlass>
        </main>
    );
}
