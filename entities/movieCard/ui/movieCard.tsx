"use client";

import Image from "next/image";
import styles from "./movieCard.module.css";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import type { FavoriteMovie, FavoriteStatus, Movie } from "../api/types";
import { genres as ObjectGenres } from "@/entities/movieCard/consts";
import { changeStatusMovie } from "@/entities/movieCard/api/supabase";

type Props = {
    movie: Movie | FavoriteMovie;
    className?: string;
    watchlist: Set<number>;
    watched: Set<number>;
    isStatusesLoading?: boolean;
    onStatusChange?: (movieId: number, status: FavoriteStatus) => void;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

export function MovieCard({
    movie,
    className,
    watchlist,
    watched,
    isStatusesLoading = false,
    onStatusChange,
}: Props) {
    const movieId = "movieid" in movie ? movie.movieid : movie.id;
    const isWatchlist = watchlist.has(movieId);
    const isWatched = watched.has(movieId);

    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "—";
    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;
    const genreNames = (movie.genre_ids ?? [])
        .map((genreId) => ObjectGenres[genreId])
        .filter((genre): genre is string => Boolean(genre));
    const hasScrollingGenres = genreNames.length > 4;

    const isWatchlistDisabled = isStatusesLoading || isWatchlist;
    const isWatchedDisabled = isStatusesLoading || isWatched;

    const handleAddToWatchlist = async () => {
        await changeStatusMovie(movie, "wishlist");
        onStatusChange?.(movieId, "wishlist");
    };

    const handleAddToWatched = async () => {
        await changeStatusMovie(movie, "watched");
        onStatusChange?.(movieId, "watched");
    };

    return (
        <LiquidGlass
            className={classNames(styles.card, {}, [className || ""])}
            radius="xl"
            padding="none"
            interactive
        >
            <div className={styles.media}>
                {posterUrl ? (
                    <Image
                        src={posterUrl}
                        alt={movie.title}
                        fill
                        className={styles.poster}
                        sizes="(max-width: 768px) 100vw, 420px"
                        unoptimized
                    />
                ) : (
                    <div className={styles.posterFallback}>No poster</div>
                )}

                <div className={styles.overlay} />

                <div className={styles.topBadges}>
                    <span
                        className={classNames(styles.badge, {}, [
                            styles.tmdbBadge,
                        ])}
                    >
                        ★ {movie.vote_average.toFixed(1)}
                    </span>
                    <span
                        className={classNames(styles.badge, {}, [
                            styles.yearBadge,
                        ])}
                    >
                        {year}
                    </span>
                </div>

                <div className={styles.bottomInfo}>
                    <div className={styles.titleBlock}>
                        <h3 className={styles.title}>{movie.title}</h3>
                        {movie.original_title !== movie.title && (
                            <p className={styles.originalTitle}>
                                {movie.original_title}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <div>
                    {hasScrollingGenres ? (
                        <div className={styles.genresMarquee}>
                            <div className={styles.genresTrack}>
                                {[...genreNames, ...genreNames].map(
                                    (genre, index) => (
                                        <span
                                            key={`${genre}-${index}`}
                                            className={styles.genre}
                                            aria-hidden={
                                                index >= genreNames.length
                                            }
                                        >
                                            {genre}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className={styles.genres}>
                            {genreNames.map((genre) => (
                                <span key={genre} className={styles.genre}>
                                    {genre}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className={styles.overview}>{movie.overview}</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={classNames(styles.actionBtn, {}, [
                            styles.watchlistBtn,
                        ])}
                        onClick={handleAddToWatchlist}
                        disabled={isWatchlistDisabled}
                    >
                        {isStatusesLoading
                            ? "..."
                            : isWatchlist
                              ? "Уже добавлен"
                              : "Хочу посмотреть"}
                    </button>

                    <button
                        className={classNames(styles.actionBtn, {}, [
                            styles.watchedBtn,
                        ])}
                        onClick={handleAddToWatched}
                        disabled={isWatchedDisabled}
                    >
                        {isStatusesLoading
                            ? "..."
                            : isWatched
                              ? "Уже просмотрен"
                              : "Просмотрено"}
                    </button>
                </div>
            </div>
        </LiquidGlass>
    );
}
