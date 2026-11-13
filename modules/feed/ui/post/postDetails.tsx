"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./post.module.css";

type Props = {
    title: string;
    text: string;
    images: string[];
    initialIndex: number;
    onClose: () => void;
    children: ReactNode;
};

export function PostDetails({
    title,
    text,
    images,
    initialIndex,
    onClose,
    children,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const touchStart = useRef<{ x: number; y: number } | null>(null);
    const titleId = useId();
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const currentIndex = Math.min(activeIndex, images.length - 1);
    const image = images[currentIndex];
    const hasGallery = images.length > 1;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    const move = (direction: -1 | 1) => {
        if (!hasGallery) return;
        setActiveIndex(
            (index) => (index + direction + images.length) % images.length,
        );
    };

    return (
        <dialog
            ref={dialogRef}
            className={styles.details}
            aria-labelledby={titleId}
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    event.currentTarget.close();
                }
            }}
            onKeyDown={(event) => {
                if (!hasGallery || event.altKey || event.metaKey) return;
                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    event.preventDefault();
                    move(event.key === "ArrowLeft" ? -1 : 1);
                }
            }}
        >
            <header className={styles.detailsHeader}>
                <h2 id={titleId}>{title || "Пост"}</h2>
                <button
                    className={styles.detailsButton}
                    type="button"
                    aria-label="Закрыть пост"
                    onClick={() => dialogRef.current?.close()}
                >
                    ×
                </button>
            </header>

            {image && (
                <>
                    <div
                        className={styles.detailsImageFrame}
                        onTouchStart={(event) => {
                            const touch = event.touches[0];
                            touchStart.current = {
                                x: touch.clientX,
                                y: touch.clientY,
                            };
                        }}
                        onTouchCancel={() => {
                            touchStart.current = null;
                        }}
                        onTouchEnd={(event) => {
                            const start = touchStart.current;
                            touchStart.current = null;
                            if (!start) return;

                            const touch = event.changedTouches[0];
                            const dx = touch.clientX - start.x;
                            const dy = touch.clientY - start.y;
                            if (
                                Math.abs(dx) > 40 &&
                                Math.abs(dx) > Math.abs(dy)
                            ) {
                                move(dx > 0 ? -1 : 1);
                            }
                        }}
                    >
                        <Image
                            src={image}
                            alt={`Фото ${currentIndex + 1} из ${images.length}`}
                            fill
                            sizes="(max-width: 752px) calc(100vw - 32px), 720px"
                            className={styles.detailsImage}
                            loading="eager"
                        />
                    </div>

                    {hasGallery && (
                        <div className={styles.galleryControls}>
                            <button
                                className={styles.detailsButton}
                                type="button"
                                aria-label="Предыдущее фото"
                                onClick={() => move(-1)}
                            >
                                ←
                            </button>
                            <span aria-live="polite">
                                {currentIndex + 1} / {images.length}
                            </span>
                            <button
                                className={styles.detailsButton}
                                type="button"
                                aria-label="Следующее фото"
                                onClick={() => move(1)}
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}

            {text && <p className={styles.detailsText}>{text}</p>}
            {children}
        </dialog>
    );
}
