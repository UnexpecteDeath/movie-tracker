"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Profile } from "@/modules/auth/hooks/types";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { PostItem } from "../../api/types";
import { PostDetails } from "./postDetails";
import styles from "./post.module.css";

const PREVIEW_LIMIT = 3;
const PREVIEW_SIZES = [
    "(max-width: 800px) 50vw, (max-width: 1168px) 33vw, 365px",
    "(max-width: 800px) 25vw, (max-width: 1168px) 17vw, 183px",
    "(max-width: 800px) 33vw, (max-width: 1168px) 22vw, 244px",
];
const SMALL_PREVIEW_SIZES =
    "(max-width: 800px) 17vw, (max-width: 1168px) 11vw, 122px";

type AuthorProps = {
    authorId: string | null;
    profile: Profile | null;
    date: string;
};

function PostAuthor({ authorId, profile, date }: AuthorProps) {
    const name = profile?.nickname || "unknown";
    const identity = (
        <>
            <span className={styles.avatar} aria-hidden="true">
                {profile?.avatarUrl ? (
                    <Image
                        src={profile.avatarUrl}
                        alt=""
                        fill
                        sizes="(max-width: 520px) 20px, 24px"
                    />
                ) : (
                    name.charAt(0).toUpperCase()
                )}
            </span>
            <span className={styles.authorName}>@{name}</span>
        </>
    );

    return (
        <footer className={styles.byline}>
            {authorId ? (
                <Link className={styles.author} href={`/profile/${authorId}`}>
                    {identity}
                </Link>
            ) : (
                <span className={styles.author}>{identity}</span>
            )}
            {date && <span className={styles.date}>{date}</span>}
        </footer>
    );
}

export function Post({ post }: { post: PostItem }) {
    const { author_id: authorId, date_label: date, title, text } = post;
    const images = post.images ?? [];
    const previews = images.slice(0, PREVIEW_LIMIT);
    const remaining = images.length - previews.length;
    const [openAt, setOpenAt] = useState<number | null>(null);
    const [author, setAuthor] = useState<{
        id: string;
        profile: Profile;
    } | null>(null);
    const { getProfileByUuid } = useAuth();

    useEffect(() => {
        if (!authorId) return;

        let active = true;
        void getProfileByUuid(authorId)
            .then((profile) => {
                if (active) setAuthor({ id: authorId, profile });
            })
            .catch(() => {
                if (active) setAuthor(null);
            });

        return () => {
            active = false;
        };
    }, [authorId, getProfileByUuid]);

    const byline = (
        <PostAuthor
            authorId={authorId}
            profile={author?.id === authorId ? author.profile : null}
            date={date}
        />
    );

    return (
        <article className={styles.postCard}>
            {previews.length > 0 && (
                <div className={styles.preview} data-count={previews.length}>
                    {previews.map((image, index) => {
                        const showRemaining =
                            remaining > 0 && index === PREVIEW_LIMIT - 1;

                        return (
                            <button
                                key={`${image}-${index}`}
                                type="button"
                                className={styles.previewButton}
                                onClick={() => setOpenAt(index)}
                                aria-haspopup="dialog"
                                aria-label={`Открыть фото ${index + 1} из ${images.length}${title ? ` — ${title}` : ""}`}
                            >
                                <Image
                                    src={image}
                                    alt=""
                                    fill
                                    sizes={
                                        previews.length === 3 && index > 0
                                            ? SMALL_PREVIEW_SIZES
                                            : PREVIEW_SIZES[previews.length - 1]
                                    }
                                    className={styles.previewImage}
                                />
                                {showRemaining && (
                                    <span
                                        className={styles.morePhotos}
                                        aria-hidden="true"
                                    >
                                        +{remaining}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            <button
                type="button"
                className={styles.postCopy}
                onClick={() => setOpenAt(0)}
                aria-haspopup="dialog"
            >
                {title && <strong className={styles.postTitle}>{title}</strong>}
                {text && <span className={styles.postText}>{text}</span>}
                {!title && !text && (
                    <span className={styles.postTitle}>Открыть пост</span>
                )}
            </button>
            {byline}

            {openAt !== null && (
                <PostDetails
                    title={title}
                    text={text}
                    images={images}
                    initialIndex={openAt}
                    onClose={() => setOpenAt(null)}
                >
                    {byline}
                </PostDetails>
            )}
        </article>
    );
}
