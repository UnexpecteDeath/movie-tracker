"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { PhotoSlider } from "@/shared";
import { classNames } from "@/shared/lib";
import type { PostItem } from "../api/types";
import styles from "./post.module.css";
import Image from "next/image";
import { useAuth } from "@/features/auth/useAuth";
import type { Profile } from "@/features/auth/types";
import Link from "next/link";

type Props = {
    post: PostItem;
};

const galleryClassByCount: Record<number, string> = {
    1: styles.galleryOne,
    2: styles.galleryTwo,
    3: styles.galleryThree,
    4: styles.galleryFour,
};

export function Post({ post }: Props) {
    const images = post.images ?? [];
    const galleryClass = galleryClassByCount[images.length];
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const [sliderIndex, setSliderIndex] = useState(0);
    const [authorProfile, setAuthorProfile] = useState<{
        profile: Profile | null;
    } | null>(null);
    const { getProfileByUuid } = useAuth();

    useEffect(() => {
        let isMounted = true;

        if (!post.author_id) {
            return () => {
                isMounted = false;
            };
        }

        getProfileByUuid(post.author_id)
            .then((authorProfile) => {
                if (!isMounted || !authorProfile) {
                    return;
                }

                setAuthorProfile({
                    profile: authorProfile,
                });
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                setAuthorProfile({
                    profile: null,
                });
            });

        return () => {
            isMounted = false;
        };
    }, [getProfileByUuid, post.author_id]);

    const resolvedAuthorProfile =
        !!post.author_id && authorProfile?.profile
            ? authorProfile.profile
            : null;
    const authorName = resolvedAuthorProfile?.nickname || "unknown";
    const authorAvatarUrl = resolvedAuthorProfile?.avatarUrl || null;

    const openSlider = (index: number) => {
        setSliderIndex(index);
        setIsSliderOpen(true);
    };

    return (
        <article className={styles.postCard}>
            <div className={styles.postHeader}>
                <div className={styles.avatar}>
                    {authorAvatarUrl ? (
                        <Link href={`/profile/${post.author_id}`}>
                            <Image
                                src={authorAvatarUrl}
                                alt={authorName}
                                className={styles.avatarImage}
                                width={52}
                                height={52}
                            />
                        </Link>
                    ) : (
                        authorName.slice(0, 1).toUpperCase()
                    )}
                </div>
                <div className={styles.postHeading}>
                    <div className={styles.postMeta}>
                        {post.author_id ? (
                            <Link
                                href={`/profile/${post.author_id}`}
                                className={styles.postAuthor}
                            >
                                @{authorName}
                            </Link>
                        ) : (
                            <p className={styles.postAuthor}>@{authorName}</p>
                        )}
                    </div>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                </div>
                <time className={styles.postDate}>{post.date_label}</time>
            </div>

            <p className={styles.postText}>{post.text}</p>

            {images.length > 0 ? (
                <>
                    <div
                        className={classNames(styles.gallery, {}, [
                            galleryClass || "",
                        ])}
                    >
                        {images.map((image, index) => (
                            <figure
                                key={image}
                                className={classNames(
                                    styles.galleryItem,
                                    {
                                        [styles.galleryLead]:
                                            index === 0 && images.length === 3,
                                    },
                                    [],
                                )}
                                style={
                                    {
                                        margin: 16,
                                    } as CSSProperties
                                }
                            >
                                <button
                                    type="button"
                                    className={styles.galleryButton}
                                    onClick={() => openSlider(index)}
                                    aria-label={`Открыть фото ${index + 1}`}
                                >
                                    <Image
                                        src={image}
                                        alt="post image"
                                        className={styles.galleryImage}
                                        width={350}
                                        height={350}
                                    />
                                </button>
                            </figure>
                        ))}
                    </div>

                    {isSliderOpen && (
                        <PhotoSlider
                            media={images}
                            isOpen={isSliderOpen}
                            onClose={() => setIsSliderOpen(false)}
                            initialIndex={sliderIndex}
                        />
                    )}
                </>
            ) : null}
        </article>
    );
}
