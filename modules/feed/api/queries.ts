"use client";

import {
    useInfiniteQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import { addPost, getPosts, POSTS_LIMIT } from "./supabase";

export const feedPostsQueryKey = ["feed", "posts"] as const;

export function useInfinitePosts(limit = POSTS_LIMIT) {
    return useInfiniteQuery({
        queryKey: [...feedPostsQueryKey, { limit }],
        queryFn: ({ pageParam }) => getPosts({ page: pageParam, limit }),
        initialPageParam: 1,
        getNextPageParam: ({ meta }) =>
            meta.remaining_count > 0 ? meta.current_page + 1 : undefined,
    });
}

export function useAddPost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addPost,
        onSuccess: async () => {
            const filters = { queryKey: feedPostsQueryKey };
            await queryClient.cancelQueries(filters);
            await queryClient.invalidateQueries(filters);
        },
    });
}
