"use client";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { tmdbApi } from "@/entities/movieCard/api";
import { watchedApi } from "@/entities/movieCard/api/mokky";
import { postApi } from "@/entities/post";

const store = configureStore({
    reducer: {
        [tmdbApi.reducerPath]: tmdbApi.reducer,
        [watchedApi.reducerPath]: watchedApi.reducer,
        [postApi.reducerPath]: postApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(tmdbApi.middleware)
            .concat(watchedApi.middleware)
            .concat(postApi.middleware),
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}
