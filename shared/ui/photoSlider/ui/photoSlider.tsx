"use client";

import {
    ArrowLeft02Icon,
    ArrowRight02Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { classNames } from "@/shared/lib";
import { Modal } from "@/shared/ui/modal";
import styles from "./photoSlider.module.css";

interface Props {
    media: string[];
    isOpen: boolean;
    onClose: () => void;
    initialIndex?: number;
}

const clampIndex = (index: number, length: number) => {
    if (length <= 0) {
        return 0;
    }

    return Math.min(Math.max(index, 0), length - 1);
};

export const PhotoSlider = ({
    media,
    isOpen,
    onClose,
    initialIndex = 0,
}: Props) => {
    const [activeIndex, setActiveIndex] = useState(() =>
        clampIndex(initialIndex, media.length),
    );

    const safeActiveIndex = clampIndex(activeIndex, media.length);
    const activeMedia = media[safeActiveIndex];
    const hasManyMedia = media.length > 1;

    const setPrev = useCallback(() => {
        setActiveIndex((currentIndex) =>
            currentIndex <= 0 ? media.length - 1 : currentIndex - 1,
        );
    }, [media.length]);

    const setNext = useCallback(() => {
        setActiveIndex((currentIndex) =>
            currentIndex >= media.length - 1 ? 0 : currentIndex + 1,
        );
    }, [media.length]);

    useEffect(() => {
        if (!isOpen || !hasManyMedia) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") {
                setPrev();
            }

            if (event.key === "ArrowRight") {
                setNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [hasManyMedia, isOpen, media.length, setNext, setPrev]);

    if (media.length === 0 || !activeMedia) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            hideCloseButton
            className={styles.modal}
            contentClassName={styles.modalContent}
            aria-label="Просмотр фотографий"
        >
            <section className={styles.slider}>
                <div className={styles.toolbar}>
                    <span className={styles.counter}>
                        {safeActiveIndex + 1} / {media.length}
                    </span>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Закрыть слайдер"
                    >
                        <HugeiconsIcon icon={Cancel01Icon} size={20} />
                    </button>
                </div>

                <div className={styles.stage}>
                    {hasManyMedia && (
                        <button
                            type="button"
                            className={classNames(styles.arrowButton, {}, [
                                styles.prevButton,
                            ])}
                            onClick={setPrev}
                            aria-label="Предыдущее фото"
                        >
                            <HugeiconsIcon icon={ArrowLeft02Icon} size={26} />
                        </button>
                    )}

                    <div className={styles.imageFrame}>
                        <Image
                            key={activeMedia}
                            src={activeMedia}
                            alt={`Фото ${safeActiveIndex + 1}`}
                            width={1400}
                            height={1000}
                            className={styles.image}
                            priority
                            unoptimized
                        />
                    </div>

                    {hasManyMedia && (
                        <button
                            type="button"
                            className={classNames(styles.arrowButton, {}, [
                                styles.nextButton,
                            ])}
                            onClick={setNext}
                            aria-label="Следующее фото"
                        >
                            <HugeiconsIcon icon={ArrowRight02Icon} size={26} />
                        </button>
                    )}
                </div>

                {hasManyMedia && (
                    <div
                        className={styles.mediaContainer}
                        aria-label="Миниатюры"
                    >
                        {media.map((item, index) => (
                            <button
                                key={`${item}-${index}`}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={classNames(
                                    styles.thumbnailButton,
                                    {
                                        [styles.active]:
                                            safeActiveIndex === index,
                                    },
                                    [],
                                )}
                                aria-label={`Открыть фото ${index + 1}`}
                                aria-current={
                                    safeActiveIndex === index
                                        ? "true"
                                        : undefined
                                }
                            >
                                <Image
                                    src={item}
                                    alt={`Миниатюра ${index + 1}`}
                                    width={120}
                                    height={90}
                                    className={styles.thumbnailImage}
                                    unoptimized
                                />
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </Modal>
    );
};
