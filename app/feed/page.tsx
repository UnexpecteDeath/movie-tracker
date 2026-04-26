"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { Post, type PostItem } from "@/entities/post";
import { CreatePostModal } from "@/features/createPost";
import { getPosts } from "@/entities/post/api/supabase";
import styles from "./page.module.css";

const POSTS_LIMIT = 20;

const getErrorMessage = () =>
    "Не удалось загрузить посты. Проверь Supabase env-переменные и доступ к таблице `posts`.";

type Meta = {
    total_items: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    remaining_count: number;
};

export default function FeedPage() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const requestInFlightRef = useRef(false);

    const hasMore = meta ? meta.remaining_count > 0 : false;

    const loadPosts = useCallback(async (pageToLoad: number) => {
        if (requestInFlightRef.current) {
            return;
        }

        requestInFlightRef.current = true;
        setIsError(false);

        try {
            const data = await getPosts({
                page: pageToLoad,
                limit: POSTS_LIMIT,
            });

            setMeta(data.meta);
            setPosts((currentPosts) => {
                if (pageToLoad === 1) {
                    return data.items;
                }

                const currentIds = new Set(
                    currentPosts.map((post) => String(post.id)),
                );
                const nextItems = data.items.filter(
                    (post) => !currentIds.has(String(post.id)),
                );

                return [...currentPosts, ...nextItems];
            });
        } catch {
            setIsError(true);
        } finally {
            setHasInitialized(true);
            requestInFlightRef.current = false;
        }
    }, []);

    useEffect(() => {
        void loadPosts(1);
    }, [loadPosts]);

    const loadMorePosts = () => {
        if (!hasMore || requestInFlightRef.current) return;

        void loadPosts((meta?.current_page ?? 1) + 1);
    };

    const handlePostCreated = (createdPost: PostItem) => {
        setPosts((currentPosts) => [createdPost, ...currentPosts]);
        setHasInitialized(true);
        setIsError(false);
        setMeta((currentMeta) =>
            currentMeta
                ? {
                      ...currentMeta,
                      total_items: currentMeta.total_items + 1,
                  }
                : currentMeta,
        );
    };

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.hero}>
                <LiquidGlass
                    className={styles.heroGlass}
                    radius="xl"
                    padding="none"
                >
                    <div className={styles.heroCard}>
                        <div className={styles.heroContent}>
                            <p className={styles.eyebrow}>Our private feed</p>
                            <h1 className={styles.title}>Feed</h1>
                            <p className={styles.description}>
                                Небольшая история о нас и нашей жизни ❤️
                            </p>
                        </div>

                        <div className={styles.heroActions}>
                            <button
                                type="button"
                                className={styles.newPostButton}
                                onClick={() => setIsCreatePostOpen(true)}
                            >
                                Новый пост
                            </button>
                        </div>
                    </div>
                </LiquidGlass>
            </section>

            <section className={styles.feedSection}>
                {posts.length <= 0 && !hasInitialized ? (
                    <LiquidGlass
                        className={styles.statusCard}
                        radius="xl"
                        padding="none"
                    >
                        <div className={styles.statusCardInner}>
                            <p className={styles.statusEyebrow}>Feed loading</p>
                            <h2 className={styles.statusTitle}>
                                Загружаем ваши посты
                            </h2>
                            <p className={styles.statusText}>
                                Достаём записи из Supabase и собираем ленту.
                            </p>
                        </div>
                    </LiquidGlass>
                ) : null}

                {isError && posts.length === 0 ? (
                    <LiquidGlass
                        className={styles.statusCard}
                        radius="xl"
                        padding="none"
                    >
                        <div className={styles.statusCardInner}>
                            <p className={styles.statusEyebrow}>Feed error</p>
                            <h2 className={styles.statusTitle}>
                                Лента сейчас недоступна
                            </h2>
                            <p className={styles.statusText}>
                                {getErrorMessage()}
                            </p>
                        </div>
                    </LiquidGlass>
                ) : null}

                {hasInitialized && !isError && posts.length === 0 ? (
                    <LiquidGlass
                        className={styles.statusCard}
                        radius="xl"
                        padding="none"
                    >
                        <div className={styles.statusCardInner}>
                            <p className={styles.statusEyebrow}>Feed empty</p>
                            <h2 className={styles.statusTitle}>
                                В ленте пока нет постов
                            </h2>
                            <p className={styles.statusText}>
                                После первой записи в `posts` она появится здесь
                                автоматически.
                            </p>
                        </div>
                    </LiquidGlass>
                ) : null}

                {posts.length > 0 ? (
                    <InfiniteScroll
                        dataLength={posts.length}
                        next={loadMorePosts}
                        hasMore={hasMore}
                        loader={
                            <div className={styles.feedLoader}>
                                <p className={styles.loaderText}>
                                    Загружаем ещё посты...
                                </p>
                            </div>
                        }
                        scrollableTarget="scrollable"
                    >
                        <div className={styles.feedList}>
                            {posts.map((post) => (
                                <Post key={post.id} post={post} />
                            ))}
                        </div>
                    </InfiniteScroll>
                ) : null}

                {isError && posts.length > 0 ? (
                    <p className={styles.feedEndMessage}>
                        Не удалось догрузить следующую страницу ленты.
                    </p>
                ) : null}
            </section>

            <CreatePostModal
                isOpen={isCreatePostOpen}
                onClose={() => setIsCreatePostOpen(false)}
                onCreated={handlePostCreated}
            />
        </div>
    );
}
