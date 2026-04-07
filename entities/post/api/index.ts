import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
    CreatePostRequest,
    PostItem,
    PostsListResponse,
    PostsQueryArgs,
} from "./types";

const FEED_ENDPOINT = "/feed";
const POSTS_LIMIT = 20;

const buildPostsParams = ({ page = 1, limit = POSTS_LIMIT }: PostsQueryArgs) => {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    return `${FEED_ENDPOINT}?${params.toString()}`;
};

export const postApi = createApi({
    reducerPath: "postApi",
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_MOKKY_URL,
    }),
    tagTypes: ["Posts"],
    endpoints: (builder) => ({
        getPosts: builder.query<PostsListResponse, PostsQueryArgs | void>({
            query: (args) => buildPostsParams(args ?? {}),
            providesTags: ["Posts"],
        }),
        addPost: builder.mutation<PostItem, CreatePostRequest>({
            query: (body) => ({
                url: FEED_ENDPOINT,
                method: "POST",
                body,
            }),
            invalidatesTags: ["Posts"],
        }),
    }),
});

export const {
    useGetPostsQuery,
    useLazyGetPostsQuery,
    useAddPostMutation,
} = postApi;
