"use client";

import { useState } from "react";
import { MovieCard } from "@/entities/movieCard/ui/movieCard";
import {
    FavoriteMovie,
    FavoriteStatus,
    Movie,
} from "@/entities/movieCard/api/types";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { supabase } from "@/shared/api/supabaseClient";
import styles from "./page.module.css";

type RandomMovie = Movie | FavoriteMovie;

export default function MoviePickerPage() {
    const [movie, setMovie] = useState<RandomMovie | null>(null);
    const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
    const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());

    const getRandomMovie = async () => {
        const { data } = await supabase.rpc("get_random_movie");
        const dataMovie = Array.isArray(data) ? data[0] : data;
        if (!dataMovie) return;

        setWatchlistIds(
            (currentIds) => new Set([...currentIds, dataMovie.movieid]),
        );
        setMovie(dataMovie);
    };

    const onStatusChange = (movieId: number, status: FavoriteStatus) => {
        if (status === "watched") {
            setWatchlistIds((currentIds) => {
                const next = new Set(currentIds);
                next.delete(movieId);

                return next;
            });
            setWatchedIds((currentIds) => new Set([...currentIds, movieId]));
        } else {
            setWatchedIds((currentIds) => {
                const next = new Set(currentIds);
                next.delete(movieId);

                return next;
            });
            setWatchlistIds((currentIds) => new Set([...currentIds, movieId]));
        }
    };

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.layout}>
                <LiquidGlass
                    className={styles.heroPanel}
                    radius="xl"
                    padding="none"
                >
                    <div className={styles.heroContent}>
                        <div>
                            <p className={styles.eyebrow}>Movie Picker</p>
                            <h1 className={styles.title}>
                                Что смотрим сегодня?
                            </h1>
                            <p className={styles.description}>
                                Один клик, и вечер получает фильм без долгих
                                споров.
                            </p>
                        </div>

                        <p className={styles.panelText}>
                            Подбери случайный фильм из базы и переходи к
                            просмотру.
                        </p>

                        <button
                            type="button"
                            className={styles.pickButton}
                            onClick={getRandomMovie}
                        >
                            Подобрать фильм
                        </button>
                    </div>
                </LiquidGlass>

                <section className={styles.resultSection} aria-live="polite">
                    {movie ? (
                        <div className={styles.movieContainer}>
                            <MovieCard
                                movie={movie}
                                className={styles.movieCard}
                                watchlist={watchlistIds}
                                watched={watchedIds}
                                onStatusChange={onStatusChange}
                            />
                        </div>
                    ) : (
                        <LiquidGlass
                            className={styles.emptyState}
                            radius="xl"
                            padding="none"
                        >
                            <div className={styles.emptyContent}>
                                <p className={styles.emptyEyebrow}>
                                    Пока пусто
                                </p>
                                <h2 className={styles.emptyTitle}>
                                    Нажми кнопку, чтобы получить первый вариант
                                </h2>
                                <p className={styles.emptyText}>
                                    Карточка фильма появится здесь.
                                </p>
                            </div>
                        </LiquidGlass>
                    )}
                </section>
            </section>
        </div>
    );
}
