"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

const text =
    "Здесь будут жить наши любимые фильмы, то, что мы давно хотим посмотреть, и маленькие воспоминания о вечерах, которые были вместе.";

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
                <p className={styles.eyebrow}>Our little cinema corner</p>

                <h1 className={styles.title}>
                    Место для наших
                    <br />
                    фильмов, вечеров
                    <br />и теплых моментов
                </h1>

                <p className={styles.typing}>
                    {displayedText}
                    <span className={styles.cursor} />
                </p>
            </section>
        </main>
    );
}
