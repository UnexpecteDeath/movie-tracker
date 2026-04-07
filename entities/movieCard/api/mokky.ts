import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
    FavoriteMovie,
    FavoriteStatus,
    MokkyListResponse,
    Movie,
} from "./types";

type FavoritesQueryArgs = {
    page?: number;
    page_size?: number;
    status: FavoriteStatus;
};

type FavoritesByIdsQueryArgs = {
    ids: number[];
    status: FavoriteStatus;
};

type AddFavoriteArgs = {
    movie: Movie;
    status: FavoriteStatus;
};

const FAVORITES_ENDPOINT = "/favorities";

const mergeMokkyPages = (
    currentCache: MokkyListResponse<FavoriteMovie>,
    newItems: MokkyListResponse<FavoriteMovie>,
) => {
    const uniqueItems = new Map(
        currentCache.items.map((movie) => [movie.movieId, movie]),
    );

    newItems.items.forEach((movie) => {
        uniqueItems.set(movie.movieId, movie);
    });

    currentCache.items = Array.from(uniqueItems.values());
    currentCache.meta = newItems.meta;
};

const serializeIds = (ids: number[]) =>
    [...new Set(ids)].sort((a, b) => a - b).join(",");

const buildMovieIdsSearchParams = (ids: number[], status?: FavoriteStatus) => {
    const params = new URLSearchParams();

    ids.forEach((id) => {
        params.append("movieId", String(id));
    });

    if (status) {
        params.set("status", status);
    }

    return params;
};

const buildFavoritePayload = (movie: Movie, status: FavoriteStatus) => ({
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genre_ids: movie.genre_ids,
    movieId: movie.id,
    original_language: movie.original_language,
    original_title: movie.original_title,
    overview: movie.overview,
    popularity: movie.popularity,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    status,
    title: movie.title,
    video: movie.video,
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
});

const buildFavoritesListParams = ({
    page = 1,
    page_size = 20,
    status,
}: FavoritesQueryArgs) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(page_size),
        status,
    });

    return `${FAVORITES_ENDPOINT}?${params.toString()}`;
};

export const favoritesApi = createApi({
    reducerPath: "favoritesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_MOKKY_URL,
    }),
    tagTypes: ["Favorites"],
    endpoints: (builder) => ({
        getFavorites: builder.query<
            MokkyListResponse<FavoriteMovie>,
            FavoritesQueryArgs
        >({
            query: buildFavoritesListParams,
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}:${queryArgs.status}`,
            merge: mergeMokkyPages,
            forceRefetch: ({ currentArg, previousArg }) =>
                currentArg?.page !== previousArg?.page ||
                currentArg?.page_size !== previousArg?.page_size ||
                currentArg?.status !== previousArg?.status,
            providesTags: ["Favorites"],
        }),
        getFavoritesByIds: builder.query<FavoriteMovie[], FavoritesByIdsQueryArgs>({
            query: ({ ids, status }) => ({
                url: FAVORITES_ENDPOINT,
                params: buildMovieIdsSearchParams(ids, status),
            }),
            serializeQueryArgs: ({ endpointName, queryArgs }) =>
                `${endpointName}:${queryArgs.status}:${serializeIds(queryArgs.ids)}`,
            providesTags: ["Favorites"],
        }),
        addFavorite: builder.mutation<FavoriteMovie, AddFavoriteArgs>({
            async queryFn({ movie, status }, _api, _extraOptions, baseQuery) {
                const existingFavoriteResult = await baseQuery({
                    url: FAVORITES_ENDPOINT,
                    params: buildMovieIdsSearchParams([movie.id]),
                });

                if (existingFavoriteResult.error) {
                    return { error: existingFavoriteResult.error };
                }

                const existingFavorites =
                    (existingFavoriteResult.data as FavoriteMovie[] | undefined) ??
                    [];
                const existingFavorite = existingFavorites[0];

                if (!existingFavorite) {
                    const createResult = await baseQuery({
                        url: FAVORITES_ENDPOINT,
                        method: "POST",
                        body: buildFavoritePayload(movie, status),
                    });

                    if (createResult.error) {
                        return { error: createResult.error };
                    }

                    return { data: createResult.data as FavoriteMovie };
                }

                if (existingFavorite.status === status) {
                    return { data: existingFavorite };
                }

                const updateResult = await baseQuery({
                    url: `${FAVORITES_ENDPOINT}/${existingFavorite.id}`,
                    method: "PATCH",
                    body: {
                        status
                    },
                });

                if (updateResult.error) {
                    return { error: updateResult.error };
                }

                return { data: updateResult.data as FavoriteMovie };
            },
            invalidatesTags: ["Favorites"],
        }),
    }),
});

export const watchedApi = favoritesApi;

export const {
    useGetFavoritesQuery,
    useGetFavoritesByIdsQuery,
    useAddFavoriteMutation,
} = favoritesApi;

export const useGetWatchedQuery = (
    params?: Omit<FavoritesQueryArgs, "status">,
    options?: Parameters<typeof useGetFavoritesQuery>[1],
) =>
    useGetFavoritesQuery(
        {
            page: params?.page,
            page_size: params?.page_size,
            status: "watched",
        },
        options,
    );

export const useGetWatchlistQuery = (
    params?: Omit<FavoritesQueryArgs, "status">,
    options?: Parameters<typeof useGetFavoritesQuery>[1],
) =>
    useGetFavoritesQuery(
        {
            page: params?.page,
            page_size: params?.page_size,
            status: "wishlist",
        },
        options,
    );

export const useGetWatchedByIdsQuery = (
    ids: number[],
    options?: Parameters<typeof useGetFavoritesByIdsQuery>[1],
) =>
    useGetFavoritesByIdsQuery(
        {
            ids,
            status: "watched",
        },
        options,
);

export const useGetWatchlistByIdsQuery = (
    ids: number[],
    options?: Parameters<typeof useGetFavoritesByIdsQuery>[1],
) =>
    useGetFavoritesByIdsQuery(
        {
            ids,
            status: "wishlist",
        },
        options,
    );

export const useAddWatchedMutation = () => {
    const [addFavorite, result] = useAddFavoriteMutation();

    const addWatched = (movie: Movie) =>
        addFavorite({
            movie,
            status: "watched",
        });

    return [addWatched, result] as const;
};

export const useAddToWatchlistMutation = () => {
    const [addFavorite, result] = useAddFavoriteMutation();

    const addToWatchlist = (movie: Movie) =>
        addFavorite({
            movie,
            status: "wishlist",
        });

    return [addToWatchlist, result] as const;
};
