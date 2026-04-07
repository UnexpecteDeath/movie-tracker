"use client";

import {
    useGetPopularMoviesQuery,
    useSearchMoviesQuery,
} from "@/entities/movieCard/api";
import {
    useGetWatchedByIdsQuery,
    useGetWatchlistByIdsQuery,
} from "@/entities/movieCard/api/mokky";
import { MoviesList } from "@/features/moviesList";
import { SearchBar } from "@/features/searchBar";
import { useEffect, useState } from "react";
import {
    FavoriteMovie,
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
    const isSearching = !!searchQuery;
    const currentPage = isSearching ? searchPage : page;
    const setCurrentPage = isSearching ? setSearchPage : setPage;

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(inputValue.trim());
        }, 500);
        return () => clearTimeout(timer);
    }, [inputValue]);

    const { data: popularData } = useGetPopularMoviesQuery(
        { page },
        { skip: !!searchQuery },
    );

    const { data: searchData } = useSearchMoviesQuery(
        { query: searchQuery, page: searchPage },
        { skip: !searchQuery },
    );
    const data = getUniqueMoviesResponse(
        isSearching ? searchData : popularData,
    );
    const movieIds = data?.results.map((movie) => movie.id) ?? [];
    const {
        data: watchedData,
        isLoading: isLoadingWatched,
    } = useGetWatchedByIdsQuery(movieIds, {
        skip: movieIds.length === 0,
    });
    const {
        data: watchlistData,
        isLoading: isLoadingWatchlist,
    } = useGetWatchlistByIdsQuery(movieIds, {
        skip: movieIds.length === 0,
    });

    const handleSearch = (query: string) => {
        setInputValue(query);
        setSearchPage(1);
    };

    const watchedIds: Set<number> = new Set(
        watchedData?.map((movie: FavoriteMovie) => movie.movieId) ?? [],
    );
    const watchlistIds: Set<number> = new Set(
        watchlistData?.map((movie: FavoriteMovie) => movie.movieId) ?? [],
    );
    const isStatusesLoading = isLoadingWatched || isLoadingWatchlist;

    return (
        <div id="scrollable" className={classNames("container", {}, [styles.page])}>
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
                isSearching={isSearching}
                searchQuery={searchQuery}
            />
        </div>
    );
}
