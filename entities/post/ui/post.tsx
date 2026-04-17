"use client";

import { useState, type CSSProperties } from "react";
import { PhotoSlider } from "@/shared";
import { classNames } from "@/shared/lib";
import type { PostItem } from "../api/types";
import styles from "./post.module.css";
import Image from "next/image";

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

    const openSlider = (index: number) => {
        setSliderIndex(index);
        setIsSliderOpen(true);
    };

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
                <>
                    <div
                        className={classNames(styles.gallery, {}, [
                            galleryClass || "",
                        ])}
                    >
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
                                        src={image.src}
                                        alt={image.alt}
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
                            media={images.map((image) => image.src)}
                            isOpen={isSliderOpen}
                            onClose={() => setIsSliderOpen(false)}
                            initialIndex={sliderIndex}
                        />
                    )}
                </>
            ) : null}

            <div className={styles.postFooter}>
                <span className={styles.footerChip}>Only us</span>
                <p className={styles.footerText}>{post.footer}</p>
            </div>
        </article>
    );
}
