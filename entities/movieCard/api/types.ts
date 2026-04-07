export type Movie = {
    adult: boolean;
    backdrop_path: string | null;
    genre_ids: number[];
    id: number;
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string | null;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
};

export type MokkyMovie = Movie & {
    movieId: number;
}

export type TmdbListResponse = {
    page: number;
    results: Movie[];
    total_pages: number;
    total_results: number;
};

export type FavoriteStatus = "watched" | "wishlist";

export type FavoriteMovie = Omit<Movie, "id"> & {
    id: number;
    movieId: number;
    status: FavoriteStatus;
};

export const favoriteMovieToMovie = (movie: FavoriteMovie): Movie => ({
    ...movie,
    id: movie.movieId,
});

export type MokkyListResponse<T = Movie> = {
    meta: {
        total_items: number;
        total_pages: number;
        current_page: number;
        per_page: number;
        remaining_count: number;
    };
    items: T[];
};
