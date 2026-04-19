import { supabase } from "@/shared/api/supabaseClient";
import type {
    FavoriteMovie,
    FavoriteStatus,
    MokkyListResponse,
    Movie,
} from "./types";
import { toast } from "sonner";

export interface GetMoviesArgs {
    page?: number;
    limit?: number;
    status?: FavoriteStatus;
    ids?: number[];
}

type GetMoviesResponse = MokkyListResponse<FavoriteMovie> & {
    error: string | null;
};

const MOVIES_LIMIT = 20;

const getMovieId = (movie: Movie | FavoriteMovie) =>
    "movieid" in movie ? movie.movieid : movie.id;

const buildMoviePayload = (
    movie: Movie | FavoriteMovie,
    status: FavoriteStatus,
): Omit<FavoriteMovie, "id"> => ({
    adult: movie.adult,
    backdrop_path: movie.backdrop_path,
    genre_ids: movie.genre_ids,
    movieid: getMovieId(movie),
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

export async function getMovies(
    args: GetMoviesArgs = {},
): Promise<GetMoviesResponse> {
    const page = args.page ?? 1;
    const limit = args.limit ?? MOVIES_LIMIT;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase.from("movies").select("*", { count: "exact" });

    if (args.status) {
        query = query
            .eq("status", args.status)
            .order("release_date", { ascending: false });
    }
    if (args.ids?.length) {
        query = query.in("movieid", args.ids);
    }

    const { data, error, count } = await query.range(from, to);

    const total_items = count ?? 0;
    const total_pages = Math.ceil(total_items / limit);
    const remaining_count = Math.max(total_items - page * limit, 0);

    return {
        items: (data ?? []) as FavoriteMovie[],
        meta: {
            current_page: page,
            per_page: limit,
            total_items,
            total_pages,
            remaining_count,
        },
        error: error?.message ?? null,
    };
}

export async function addMovie(
    movie: Movie | FavoriteMovie,
    status: FavoriteStatus,
): Promise<void> {
    const { error } = await supabase
        .from("movies")
        .insert(buildMoviePayload(movie, status));

    if (error) {
        toast.error(error.message);
        throw new Error(error.message);
    }

    const toastStatus =
        status === "watched" ? "watched list" : "watch later list";

    toast.success(`Movie successfully added to ${toastStatus}.`);
}

export async function changeStatusMovie(
    movie: Movie | FavoriteMovie,
    status: FavoriteStatus,
): Promise<void> {
    const movieId = getMovieId(movie);

    const { data: existingMovies, error: selectError } = await supabase
        .from("movies")
        .select("id")
        .eq("movieid", movieId)
        .limit(1);

    if (selectError) {
        toast.error(selectError.message);
        throw new Error(selectError.message);
    }

    if (!existingMovies?.length) {
        await addMovie(movie, status);
        return;
    }

    const { error } = await supabase
        .from("movies")
        .update({ status })
        .eq("movieid", movieId);

    if (error) {
        toast.error(error.message);
        throw new Error(error.message);
    }

    toast.success("Movie changed successfully.");
}
