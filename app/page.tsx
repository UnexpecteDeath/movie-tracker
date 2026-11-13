"use client";

import { useEffect, useState } from "react";
import styles from "./styles/page.module.css";

const text =
    "Здесь будет храниться наша история: особенные моменты, тёплые воспоминания, маленькие традиции и всё то, что делает нас нами.";

export default function Home() {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let index = 0;

        const timer = setInterval(() => {
            setDisplayedText(text.slice(0, index + 1));
            index += 1;

            if (index >= text.length) {
                clearInterval(timer);
            }
        }, 50);

        return () => clearInterval(timer);
    }, []);

    return (
        <main className={styles.home}>
            <div className={styles.glow} />
            <div className={styles.glowSecondary} />

            <section className={styles.hero}>
                <p className={styles.eyebrow}>Our little history corner</p>

                <h1 className={styles.title}>Наша история</h1>

                <p className={styles.typing}>
                    {displayedText}
                    <span className={styles.cursor} />
                </p>
            </section>
        </main>
    );
}
