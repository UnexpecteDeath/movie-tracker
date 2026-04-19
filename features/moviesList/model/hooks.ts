"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getMovies } from "@/entities/movieCard/api/supabase";
import type {
    FavoriteMovie,
    FavoriteStatus,
    Meta,
} from "@/entities/movieCard/api/types";

type UseMoviesListArgs = {
    pageSize?: number;
    status: FavoriteStatus;
};

const DEFAULT_PAGE_SIZE = 21;
const DEFAULT_ERROR_MESSAGE = "Не удалось загрузить фильмы.";

const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;

export const useMoviesList = ({
    pageSize = DEFAULT_PAGE_SIZE,
    status,
}: UseMoviesListArgs) => {
    const [page, setPage] = useState(1);
    const [moviesList, setMoviesList] = useState<FavoriteMovie[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadMovies = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getMovies({
                page,
                limit: pageSize,
                status,
            });

            if (data.error) {
                throw new Error(data.error);
            }

            setMoviesList((currentMovies) => {
                if (page === 1) {
                    return data.items;
                }

                const uniqueMovies = new Set(currentMovies);

                data.items.forEach((movie) => {
                    uniqueMovies.add(movie);
                });

                return [...uniqueMovies];
            });
            setMeta(data.meta);
        } catch (error: unknown) {
            setError(getErrorMessage(error));
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, status]);

    useEffect(() => {
        void loadMovies();
    }, [loadMovies]);

    const handleStatusChange = useCallback(
        (movieId: number, nextStatus: FavoriteStatus) => {
            if (nextStatus === status) {
                setMoviesList((currentMovies) =>
                    currentMovies.map((movie) =>
                        movie.movieid === movieId
                            ? { ...movie, status: nextStatus }
                            : movie,
                    ),
                );
                return;
            }

            setMoviesList((currentMovies) =>
                currentMovies.filter((movie) => movie.movieid !== movieId),
            );
            setMeta((currentMeta) =>
                currentMeta
                    ? {
                          ...currentMeta,
                          total_items: Math.max(currentMeta.total_items - 1, 0),
                      }
                    : currentMeta,
            );
        },
        [status],
    );

    const totalPages = meta?.total_pages ?? 0;
    const totalResults = moviesList.length;
    const totalItems = meta?.total_items ?? 0;
    const isInitialLoading = isLoading && totalResults === 0;
    const shouldShowEmptyState = !error && !isLoading && totalResults === 0;
    const shouldShowMoviesList = isInitialLoading || totalResults > 0;

    const movieIds = useMemo(
        () => new Set(moviesList.map((movie) => movie.movieid)),
        [moviesList],
    );
    const emptyMovieIds = useMemo(() => new Set<number>(), []);

    return {
        error,
        isInitialLoading,
        movies: moviesList,
        page,
        pageSize,
        setPage,
        shouldShowEmptyState,
        shouldShowMoviesList,
        totalItems,
        totalPages,
        totalResults,
        onStatusChange: handleStatusChange,
        watchedIds: status === "watched" ? movieIds : emptyMovieIds,
        watchlistIds: status === "wishlist" ? movieIds : emptyMovieIds,
    };
};
