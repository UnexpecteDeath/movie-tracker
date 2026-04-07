import { MovieCard } from "@/entities/movieCard/ui/movieCard";
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
    isSearching,
    searchQuery,
}: Props) => {
    const fetchNext = () => {
        setPage((prev) => prev + 1);
    };

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
                loader={<h4>Loading...</h4>}
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
                            isWatchlist={watchlistIds.has(movie.id)}
                            isWatched={watchedIds.has(movie.id)}
                            isStatusesLoading={isStatusesLoading}
                        />
                    ))}
                </div>
            </InfiniteScroll>
        </>
    );
};
