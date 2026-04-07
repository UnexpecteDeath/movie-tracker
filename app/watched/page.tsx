"use client";

import { useState } from "react";
import { MoviesList } from "@/features/moviesList";
import { useGetWatchedQuery } from "@/entities/movieCard/api/mokky";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { favoriteMovieToMovie, MokkyMovie } from "@/entities/movieCard/api/types";
import styles from "./page.module.css";

const PAGE_SIZE = 20;

export default function WatchedPage() {
    const [page, setPage] = useState(1);
    const { data: watchedMovies, isLoading } = useGetWatchedQuery({
        page,
        page_size: PAGE_SIZE,
    });

    const total_pages = watchedMovies?.meta.total_pages ?? 0;
    const totalResults = watchedMovies?.items.length ?? 0;

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.hero}>
                <LiquidGlass
                    className={styles.heroGlass}
                    radius="xl"
                    padding="none"
                >
                    <div className={styles.heroCard}>
                        <p className={styles.eyebrow}>Watched Library</p>
                        <h1 className={styles.title}>Просмотренные фильмы</h1>
                        <p className={styles.description}>
                            Фильмы, которые остались с нами❤️.
                        </p>

                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Фильмов
                                </span>
                                <strong className={styles.statValue}>
                                    {totalResults}
                                </strong>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Всего на странице
                                </span>
                                <strong className={styles.statValue}>
                                    {PAGE_SIZE}
                                </strong>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Страниц
                                </span>
                                <strong className={styles.statValue}>
                                    {total_pages}
                                </strong>
                            </div>
                        </div>
                    </div>
                </LiquidGlass>
            </section>

            <section className={styles.listSection}>
                {isLoading ? (
                    <div className={styles.placeholder}>
                        Загружаем просмотренное...
                    </div>
                ) : totalResults === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyEyebrow}>Пока пусто</p>
                        <h2 className={styles.emptyTitle}>
                            Здесь появятся фильмы, которые ты уже посмотрел
                        </h2>
                        <p className={styles.emptyText}>
                            Добавь первый фильм в `watched`, и эта полка оживёт.
                        </p>
                    </div>
                ) : (
                    <MoviesList
                        movies={
                            watchedMovies?.items.map(favoriteMovieToMovie) ?? []
                        }
                        totalPages={total_pages}
                        totalResults={totalResults}
                        page={page}
                        setPage={setPage}
                        watchedIds={
                            new Set(
                                watchedMovies?.items.map(
                                    (movie: MokkyMovie) => movie.movieId,
                                ) ?? [],
                            )
                        }
                        watchlistIds={new Set()}
                    />
                )}
            </section>
        </div>
    );
}
