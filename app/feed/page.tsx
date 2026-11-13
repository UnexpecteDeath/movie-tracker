"use client";

import { useMemo, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Card } from "@/shared/ui/card";
import {
    CreatePostModal,
    Post,
    type PostItem,
    useInfinitePosts,
} from "@/modules/feed";
import styles from "./page.module.css";

export default function FeedPage() {
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isError,
        isFetching,
        isFetchingNextPage,
        isFetchNextPageError,
        isPending,
        refetch,
    } = useInfinitePosts();

    const posts = useMemo(() => {
        const uniquePosts = new Map<string, PostItem>();
        for (const page of data?.pages ?? []) {
            for (const post of page.items) {
                const id = String(post.id);
                if (!uniquePosts.has(id)) uniquePosts.set(id, post);
            }
        }
        return [...uniquePosts.values()];
    }, [data]);

    const fetchedPostCount =
        data?.pages.reduce((count, page) => count + page.items.length, 0) ?? 0;
    const loadMore = () => void fetchNextPage({ cancelRefetch: false });
    const retry = () => {
        if (isFetchNextPageError) {
            loadMore();
        } else {
            void refetch();
        }
    };

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <header className={styles.header}>
                <h1 className={styles.title}>Лента</h1>
                <button
                    type="button"
                    className={styles.newPostButton}
                    onClick={() => setIsCreatePostOpen(true)}
                >
                    Новый пост
                </button>
            </header>

            <section className={styles.feedSection} aria-label="Посты">
                {isPending || (!isError && posts.length === 0) ? (
                    <Card className={styles.statusCard} role="status">
                        {isPending
                            ? "Загружаем посты…"
                            : "В ленте пока нет постов."}
                    </Card>
                ) : null}

                {posts.length > 0 ? (
                    <InfiniteScroll
                        className={styles.feedGrid}
                        style={{ overflow: "visible" }}
                        dataLength={fetchedPostCount}
                        next={loadMore}
                        hasMore={hasNextPage && !isFetching && !isError}
                        scrollableTarget="scrollable"
                        scrollThreshold="240px"
                        loader={null}
                    >
                        {posts.map((post) => (
                            <Post key={post.id} post={post} />
                        ))}
                    </InfiniteScroll>
                ) : null}

                {isFetchingNextPage ? (
                    <p className={styles.feedMessage} role="status">
                        Загружаем ещё посты…
                    </p>
                ) : null}

                {isError || (hasNextPage && !isFetchingNextPage) ? (
                    <div className={styles.feedMessage}>
                        {isError && (
                            <p role="alert">
                                {isFetchNextPageError
                                    ? "Не удалось загрузить следующие посты."
                                    : "Не удалось загрузить ленту."}
                            </p>
                        )}
                        <button
                            className={styles.retryButton}
                            type="button"
                            onClick={isError ? retry : loadMore}
                            disabled={isFetching}
                        >
                            {isError ? "Повторить" : "Загрузить ещё"}
                        </button>
                    </div>
                ) : null}
            </section>

            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
            />
        </div>
    );
}
