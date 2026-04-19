import { MovieCard } from "@/entities/movieCard/ui/movieCard";
import { MovieSkeleton } from "@/entities/movieCard/ui/movieSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import type { FavoriteStatus, Movie } from "@/entities/movieCard/api/types";
import type { CSSProperties, SetStateAction } from "react";
import styles from "./moviesList.module.css";

interface Props {
    movies: Movie[];
    totalPages: number;
    totalResults: number;
    page: number;
    setPage: React.Dispatch<SetStateAction<number>>;
    watchedIds: Set<number>;
    watchlistIds: Set<number>;
    isStatusesLoading?: boolean;
    isLoading?: boolean;
    skeletonCount?: number;
    isSearching?: boolean;
    searchQuery?: string;
    onStatusChange?: (movieId: number, status: FavoriteStatus) => void;
}

export const MoviesList = ({
    movies,
    totalPages,
    totalResults,
    page,
    setPage,
    watchedIds,
    watchlistIds,
    isStatusesLoading = false,
    isLoading = false,
    skeletonCount = 8,
    isSearching,
    searchQuery,
    onStatusChange,
}: Props) => {
    const fetchNext = () => {
        setPage((prev) => prev + 1);
    };

    const renderSkeletons = (keyPrefix: string) =>
        Array.from({ length: skeletonCount }, (_, index) => (
            <div className={styles.movieItem} key={`${keyPrefix}-${index}`}>
                <MovieSkeleton />
            </div>
        ));

    if (isLoading) {
        return (
            <div className={`movies ${styles.movieGrid}`} aria-busy="true">
                {renderSkeletons("movie-skeleton")}
            </div>
        );
    }

    return (
        <>
            {isSearching && searchQuery && (
                <p className={styles.searchMeta}>
                    {totalResults
                        ? `Найдено: ${totalResults} по запросу «${searchQuery}»`
                        : `Ничего не найдено по запросу «${searchQuery}»`}
                </p>
            )}
            <InfiniteScroll
                dataLength={movies.length}
                next={fetchNext}
                hasMore={page < totalPages}
                loader={
                    <div
                        className={`movies ${styles.movieGrid}`}
                        aria-busy="true"
                    >
                        {renderSkeletons("movie-loader-skeleton")}
                    </div>
                }
                endMessage={
                    <p style={{ textAlign: "center" }}>
                        <b>Yay! You have seen it all</b>
                    </p>
                }
                scrollableTarget="scrollable"
            >
                <div className={`movies ${styles.movieGrid}`}>
                    {movies.map((movie: Movie, index) => (
                        <div
                            className={styles.movieItem}
                            key={`${movie.id}${movie.title}`}
                            style={
                                {
                                    "--movie-delay": `${Math.min(index, 8) * 45}ms`,
                                } as CSSProperties
                            }
                        >
                            <MovieCard
                                movie={movie}
                                watchlist={watchlistIds}
                                watched={watchedIds}
                                isStatusesLoading={isStatusesLoading}
                                onStatusChange={onStatusChange}
                            />
                        </div>
                    ))}
                </div>
            </InfiniteScroll>
        </>
    );
};
