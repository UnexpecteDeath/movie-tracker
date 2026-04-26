"use client";

import { MoviesList, useMoviesList } from "@/features/moviesList";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import styles from "../watched/page.module.css";

export default function WatchlistPage() {
    const {
        error,
        isInitialLoading,
        movies,
        onStatusChange,
        page,
        pageSize,
        setPage,
        shouldShowEmptyState,
        shouldShowMoviesList,
        totalItems,
        totalPages,
        totalResults,
        watchedIds,
        watchlistIds,
    } = useMoviesList({
        status: "wishlist",
    });

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
                        <p className={styles.eyebrow}>Wishlist Library</p>
                        <h1 className={styles.title}>Фильмы на будущее</h1>
                        <p className={styles.description}>
                            Фильмы, которые ждут своего вечера.
                        </p>

                        <div className={styles.stats}>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Фильмов
                                </span>
                                <strong className={styles.statValue}>
                                    {totalItems}
                                </strong>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Всего на странице
                                </span>
                                <strong className={styles.statValue}>
                                    {pageSize}
                                </strong>
                            </div>
                            <div className={styles.statCard}>
                                <span className={styles.statLabel}>
                                    Страниц
                                </span>
                                <strong className={styles.statValue}>
                                    {totalPages}
                                </strong>
                            </div>
                        </div>
                    </div>
                </LiquidGlass>
            </section>

            <section className={styles.listSection}>
                {error ? (
                    <div className={styles.emptyState} role="alert">
                        <p className={styles.emptyEyebrow}>Ошибка загрузки</p>
                        <h2 className={styles.emptyTitle}>
                            Не получилось открыть фильмы для будущего
                        </h2>
                        <p className={styles.emptyText}>{error}</p>
                    </div>
                ) : null}

                {shouldShowEmptyState ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyEyebrow}>Пока пусто</p>
                        <h2 className={styles.emptyTitle}>
                            Здесь появятся фильмы, которые ты хочешь посмотреть
                        </h2>
                        <p className={styles.emptyText}>
                            Добавь первый фильм в `wishlist`, и список
                            наполнится.
                        </p>
                    </div>
                ) : null}

                {shouldShowMoviesList ? (
                    <MoviesList
                        movies={movies}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        page={page}
                        setPage={setPage}
                        isLoading={isInitialLoading}
                        skeletonCount={6}
                        watchedIds={watchedIds}
                        watchlistIds={watchlistIds}
                        onStatusChange={onStatusChange}
                    />
                ) : null}
            </section>
        </div>
    );
}
