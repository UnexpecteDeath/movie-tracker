"use client";

import {
    useGetPopularMoviesQuery,
    useSearchMoviesQuery,
} from "@/entities/movieCard/api";
import { getMovies } from "@/entities/movieCard/api/supabase";
import { MoviesList } from "@/features/moviesList";
import { SearchBar } from "@/features/searchBar";
import { useEffect, useMemo, useState } from "react";
import {
    FavoriteStatus,
    TmdbListResponse,
} from "@/entities/movieCard/api/types";
import { classNames } from "@/shared/lib";
import styles from "./styles.module.css";

const getUniqueMoviesResponse = (
    data: TmdbListResponse | undefined,
): TmdbListResponse | null => {
    if (!data) {
        return null;
    }

    return {
        ...data,
        results: Array.from(
            new Map(data.results.map((movie) => [movie.id, movie])).values(),
        ),
    };
};

export default function Page() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [searchPage, setSearchPage] = useState(1);
    const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());
    const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
    const [isStatusesLoading, setIsStatusesLoading] = useState(false);
    const isSearching = !!searchQuery;
    const currentPage = isSearching ? searchPage : page;
    const setCurrentPage = isSearching ? setSearchPage : setPage;

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const { data: popularData, isLoading: isLoadingPopular } =
        useGetPopularMoviesQuery({ page }, { skip: !!searchQuery });

    const { data: searchData, isLoading: isLoadingSearch } =
        useSearchMoviesQuery(
            { query: searchQuery, page: searchPage },
            { skip: !searchQuery },
        );
    const data = useMemo(
        () => getUniqueMoviesResponse(isSearching ? searchData : popularData),
        [isSearching, popularData, searchData],
    );
    const moviesId = useMemo(
        () => new Set(data?.results.map((movie) => movie.id) ?? []),
        [data],
    );

    useEffect(() => {
        const ids = Array.from(moviesId);
        let isActual = true;

        if (!ids.length) {
            setWatchedIds(new Set());
            setWatchlistIds(new Set());
            setIsStatusesLoading(false);
            return;
        }

        const loadSavedStatuses = async () => {
            setIsStatusesLoading(true);
            setWatchedIds(new Set());
            setWatchlistIds(new Set());

            try {
                const [watchedResponse, watchlistResponse] = await Promise.all([
                    getMovies({
                        ids,
                        status: "watched",
                        limit: ids.length,
                    }),
                    getMovies({
                        ids,
                        status: "wishlist",
                        limit: ids.length,
                    }),
                ]);
                if (watchedResponse.error || watchlistResponse.error) {
                    return;
                }

                if (!isActual) {
                    return;
                }

                setWatchedIds(
                    new Set(
                        watchedResponse.items.map((movie) => movie.movieid),
                    ),
                );
                setWatchlistIds(
                    new Set(
                        watchlistResponse.items.map((movie) => movie.movieid),
                    ),
                );
            } finally {
                if (isActual) {
                    setIsStatusesLoading(false);
                }
            }
        };

        void loadSavedStatuses();

        return () => {
            isActual = false;
        };
    }, [moviesId]);

    const handleStatusChange = (movieId: number, status: FavoriteStatus) => {
        if (status === "watched") {
            setWatchedIds((currentIds) => new Set(currentIds).add(movieId));
            setWatchlistIds((currentIds) => {
                const nextIds = new Set(currentIds);
                nextIds.delete(movieId);
                return nextIds;
            });
            return;
        }

        setWatchlistIds((currentIds) => new Set(currentIds).add(movieId));
        setWatchedIds((currentIds) => {
            const nextIds = new Set(currentIds);
            nextIds.delete(movieId);
            return nextIds;
        });
    };

    const handleSearch = (query: string) => {
        setInputValue(query);
        setSearchPage(1);
    };

    const isMoviesLoading = isSearching ? isLoadingSearch : isLoadingPopular;

    return (
        <div
            id="scrollable"
            className={classNames("container", {}, [styles.page])}
        >
            <SearchBar value={inputValue} onChange={handleSearch} />
            <MoviesList
                movies={data?.results ?? []}
                totalPages={data?.total_pages ?? 0}
                totalResults={data?.total_results ?? 0}
                page={currentPage}
                setPage={setCurrentPage}
                watchedIds={watchedIds}
                watchlistIds={watchlistIds}
                isStatusesLoading={isStatusesLoading}
                isLoading={isMoviesLoading}
                skeletonCount={6}
                isSearching={isSearching}
                searchQuery={searchQuery}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
