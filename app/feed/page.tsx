"use client";

import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { Post, useLazyGetPostsQuery, type PostItem } from "@/entities/post";
import { CreatePostModal } from "@/features/createPost";
import styles from "./page.module.css";

const POSTS_LIMIT = 20;

const getErrorMessage = () =>
    "Не удалось загрузить посты. Проверь `NEXT_PUBLIC_MOKKY_URL` и доступность эндпоинта `/feed`.";

const getPostSortValue = (post: PostItem) => {
    const numericId = Number(post.id);

    return Number.isFinite(numericId) ? numericId : 0;
};

const sortPostsNewestFirst = (posts: PostItem[]) =>
    [...posts].sort((firstPost, secondPost) => {
        return getPostSortValue(secondPost) - getPostSortValue(firstPost);
    });

export default function FeedPage() {
    const [posts, setPosts] = useState<PostItem[]>([]);
    const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
    const [nextPageToLoad, setNextPageToLoad] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [isLoadingInitial, setIsLoadingInitial] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isError, setIsError] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [getPosts] = useLazyGetPostsQuery();

    useEffect(() => {
        let isCancelled = false;

        const loadInitialPosts = async () => {
            try {
                setIsLoadingInitial(true);
                setIsError(false);

                const firstPageData = await getPosts(
                    {
                        page: 1,
                        limit: POSTS_LIMIT,
                    },
                    true,
                ).unwrap();
                const totalPages = firstPageData.meta.total_pages;
                const latestPage = totalPages > 0 ? totalPages : 1;
                const latestPageData =
                    latestPage === 1
                        ? firstPageData
                        : await getPosts(
                              {
                                  page: latestPage,
                                  limit: POSTS_LIMIT,
                              },
                              true,
                          ).unwrap();

                if (!isCancelled) {
                    setPosts(sortPostsNewestFirst(latestPageData.items));
                    setNextPageToLoad(latestPage > 1 ? latestPage - 1 : null);
                    setHasMore(latestPage > 1);
                    setHasInitialized(true);
                    setIsLoadingInitial(false);
                }
            } catch {
                if (!isCancelled) {
                    setPosts([]);
                    setNextPageToLoad(null);
                    setHasMore(false);
                    setIsError(true);
                    setHasInitialized(true);
                    setIsLoadingInitial(false);
                }
            }
        };

        void loadInitialPosts();

        return () => {
            isCancelled = true;
        };
    }, [getPosts]);

    const loadMorePosts = () => {
        if (isLoadingMore || nextPageToLoad === null) {
            return;
        }

        const pageToLoad = nextPageToLoad;

        setIsLoadingMore(true);
        setIsError(false);

        void getPosts(
            {
                page: pageToLoad,
                limit: POSTS_LIMIT,
            },
            true,
        )
            .unwrap()
            .then((pageData) => {
                setPosts((currentPosts) =>
                    sortPostsNewestFirst([...currentPosts, ...pageData.items]),
                );
                setNextPageToLoad(pageToLoad > 1 ? pageToLoad - 1 : null);
                setHasMore(pageToLoad > 1);
                setIsLoadingMore(false);
            })
            .catch(() => {
                setIsError(true);
                setIsLoadingMore(false);
            });
    };

    const handlePostCreated = (createdPost: PostItem) => {
        setPosts((currentPosts) =>
            sortPostsNewestFirst([createdPost, ...currentPosts]),
        );
        setHasInitialized(true);
        setIsError(false);
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
                            <h1 className={styles.title}>
                                Небольшая лента о нас
                            </h1>
                            <p className={styles.description}>
                                Локальные посты, фотографии и маленькие заметки
                                о наших вечерах. Стартуем с одной карточки, но
                                layout уже готов к постам без изображений и к
                                галерее из нескольких кадров.
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
                {isLoadingInitial ? (
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
                                Достаём записи с `/feed` и собираем ленту.
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

                {hasInitialized &&
                !isLoadingInitial &&
                !isError &&
                posts.length === 0 ? (
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
                                После первого `POST /feed` записи появятся здесь
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
