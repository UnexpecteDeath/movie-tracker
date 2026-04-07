"use client";

import Image from "next/image";
import styles from "./movieCard.module.css";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import { Movie } from "../api/types";
import {
    useAddWatchedMutation,
    useAddToWatchlistMutation,
} from "../api/mokky";

type Props = {
    movie: Movie;
    className?: string;
    genres?: string[];
    isWatchlist?: boolean;
    isWatched?: boolean;
    isStatusesLoading?: boolean;
};

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500/";

export function MovieCard({
    movie,
    className,
    genres = ["Фантастика", "Триллер", "Боевик"],
    isWatchlist = false,
    isWatched = false,
    isStatusesLoading = false,
}: Props) {
    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : "—";
    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    const [addWatched, { isLoading: isAddingWatched }] = useAddWatchedMutation();
    const [addToWatchlist, { isLoading: isAddingWatchlist }] = useAddToWatchlistMutation();

    const isWatchlistDisabled =
        isAddingWatchlist || isStatusesLoading || isWatchlist;
    const isWatchedDisabled =
        isAddingWatched ||
        isStatusesLoading ||
        isWatched;

    const handleAddToWatchlist = async () => {
        await addToWatchlist(movie).unwrap();
    };

    const handleAddToWatched = async () => {
        await addWatched(movie).unwrap();
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
                    <div className={styles.genres}>
                        {genres.map((genre) => (
                            <span key={genre} className={styles.genre}>
                                {genre}
                            </span>
                        ))}
                    </div>

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
                        {isAddingWatchlist || isStatusesLoading
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
                        {isAddingWatched || isStatusesLoading
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
