import type { CSSProperties } from "react";
import Zoom from "react-medium-image-zoom";
import { classNames } from "@/shared/lib";
import type { PostItem } from "../api/types";
import styles from "./post.module.css";

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

    return (
        <article className={styles.postCard}>
            <div className={styles.postHeader}>
                <div className={styles.avatar}>♡</div>
                <div>
                    <p className={styles.postMetaLabel}>{post.category}</p>
                    <h2 className={styles.postTitle}>{post.title}</h2>
                </div>
                <time className={styles.postDate}>{post.dateLabel}</time>
            </div>

            <p className={styles.postText}>{post.text}</p>

            {images.length > 0 ? (
                <div className={classNames(styles.gallery, {}, [galleryClass])}>
                    {images.map((image, index) => (
                        <figure
                            key={image.src}
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
                                    "--gallery-tint": image.tint,
                                } as CSSProperties
                            }
                        >
                            <Zoom
                                zoomImg={{
                                    src: image.src,
                                    alt: image.alt,
                                }}
                                classDialog={styles.zoomDialog}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image.src}
                                    alt={image.alt}
                                    className={styles.galleryImage}
                                />
                            </Zoom>
                        </figure>
                    ))}
                </div>
            ) : null}

            <div className={styles.postFooter}>
                <span className={styles.footerChip}>Only us</span>
                <p className={styles.footerText}>{post.footer}</p>
            </div>
        </article>
    );
}
