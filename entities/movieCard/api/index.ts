import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TmdbListResponse } from "./types";



export const tmdbApi = createApi({
    reducerPath: "tmdbApi",
    baseQuery: fetchBaseQuery({
        baseUrl: "https://api.themoviedb.org/3/",
        prepareHeaders: (headers) => {
            const token = process.env.NEXT_PUBLIC_TMDB_TOKEN;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            headers.set("Content-Type", "application/json");
            return headers;
        },
    }),
    endpoints: (builder) => ({
        getPopularMovies: builder.query<
            TmdbListResponse,
            { page?: number; language?: string } | void
        >({
            query: (params) => {
                const page = params?.page ?? 1;
                const language = params?.language ?? "ru-Ru";

                return `movie/popular?language=${language}&page=${page}`;
            },
            serializeQueryArgs: ({ endpointName }) => endpointName,
            merge: (currentCache, newItems) => {
                currentCache.results.push(...newItems.results);
                currentCache.total_pages = newItems.total_pages;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg !== previousArg,
        }),

        getUpcomingMovies: builder.query<
            TmdbListResponse,
            { page?: number; language?: string } | void
        >({
            query: (params) => {
                const page = params?.page ?? 1;
                const language = params?.language ?? "ru-RU";

                return `movie/upcoming?language=${language}&page=${page}`;
            },
        }),

        searchMovies: builder.query<
            TmdbListResponse,
            { query: string; page?: number; language?: string }
        >({
            query: ({ query, page = 1, language = "ru-RU" }) =>
                `search/movie?query=${encodeURIComponent(query)}&language=${language}&page=${page}`,
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}:${queryArgs.query}`,
            merge: (currentCache, newItems) => {
                currentCache.results.push(...newItems.results);
                currentCache.total_pages = newItems.total_pages;
            },
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.page !== previousArg?.page ||
                currentArg?.query !== previousArg?.query,
        }),
    }),
});

export const {
    useGetPopularMoviesQuery,
    useGetUpcomingMoviesQuery,
    useSearchMoviesQuery,
} = tmdbApi;
