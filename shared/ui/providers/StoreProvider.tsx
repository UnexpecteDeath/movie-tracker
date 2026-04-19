"use client";

import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { tmdbApi } from "@/entities/movieCard/api";

const store = configureStore({
    reducer: {
        [tmdbApi.reducerPath]: tmdbApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(tmdbApi.middleware),
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
}
