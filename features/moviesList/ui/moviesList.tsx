import { MovieCard } from "@/entities/movieCard/ui/movieCard";
import { MovieSkeleton } from "@/entities/movieCard/ui/movieSkeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import { Movie } from "@/entities/movieCard/api/types";
import { SetStateAction } from "react";
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
}: Props) => {
    const fetchNext = () => {
        setPage((prev) => prev + 1);
    };

    const renderSkeletons = (keyPrefix: string) =>
        Array.from({ length: skeletonCount }, (_, index) => (
            <MovieSkeleton key={`${keyPrefix}-${index}`} />
        ));

    if (isLoading) {
        return (
            <div className="movies" aria-busy="true">
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
                    <div className="movies" aria-busy="true">
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
                <div className="movies">
                    {movies.map((movie: Movie) => (
                        <MovieCard
                            key={`${movie.id}${movie.title}`}
                            movie={movie}
                            watchlist={watchlistIds}
                            watched={watchedIds}
                            isStatusesLoading={isStatusesLoading}
                        />
                    ))}
                </div>
            </InfiniteScroll>
        </>
    );
};
