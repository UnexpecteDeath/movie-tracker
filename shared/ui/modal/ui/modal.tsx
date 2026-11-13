"use client";

import {
    type HTMLAttributes,
    type MouseEvent,
    type ReactNode,
    useEffect,
    useId,
    useRef,
    useState,
} from "react";
import { createPortal } from "react-dom";
import { classNames } from "@/shared/lib";
import { Card } from "@/shared/ui/card";
import styles from "./modal.module.css";

export type ModalAnimation =
    | "none"
    | "scaleOut"
    | "liftFade"
    | "swirlIn"
    | "bloom";

type Props = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    eyebrow?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
    closeOnOverlay?: boolean;
    closeOnEscape?: boolean;
    hideCloseButton?: boolean;
    keepMounted?: boolean;
    animation?: ModalAnimation;
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    eyebrow,
    footer,
    children,
    className,
    contentClassName,
    closeOnOverlay = true,
    closeOnEscape = true,
    hideCloseButton = false,
    keepMounted = false,
    ...props
}: Props) {
    const titleId = useId();
    const descriptionId = useId();
    const dialogRef = useRef<HTMLDivElement>(null);
    const [isPrepared, setIsPrepared] = useState(false);

    useEffect(() => {
        if (!keepMounted) return;

        const frameId = window.requestAnimationFrame(() => {
            setIsPrepared(true);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [keepMounted]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && closeOnEscape) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, closeOnEscape, onClose]);

    const handleOverlayClick = () => {
        if (closeOnOverlay) {
            onClose();
        }
    };

    const handleDialogClick = (event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    };

    if (!isOpen && (!keepMounted || !isPrepared)) return null;

    return createPortal(
        <div
            className={classNames(
                styles.overlay,
                {
                    [styles.overlayHidden]: !isOpen,
                },
                [],
            )}
            onClick={handleOverlayClick}
            aria-hidden={!isOpen}
            inert={!isOpen}
        >
            <div
                className={classNames(styles.dialog, {}, [className || ""])}
                onClick={handleDialogClick}
            >
                <Card
                    ref={dialogRef}
                    className={styles.surface}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
                    aria-describedby={description ? descriptionId : undefined}
                    tabIndex={-1}
                    {...props}
                >
                    {(title || description || eyebrow || !hideCloseButton) && (
                        <header className={styles.header}>
                            <div className={styles.heading}>
                                {eyebrow ? (
                                    <p className={styles.eyebrow}>{eyebrow}</p>
                                ) : null}
                                {title ? (
                                    <h2 id={titleId} className={styles.title}>
                                        {title}
                                    </h2>
                                ) : null}
                                {description ? (
                                    <p
                                        id={descriptionId}
                                        className={styles.description}
                                    >
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            {!hideCloseButton && (
                                <button
                                    type="button"
                                    className={styles.closeButton}
                                    onClick={onClose}
                                    aria-label="Закрыть модальное окно"
                                >
                                    <span className={styles.closeIcon}>×</span>
                                </button>
                            )}
                        </header>
                    )}

                    <div
                        className={classNames(styles.content, {}, [
                            contentClassName || "",
                        ])}
                    >
                        {children}
                    </div>

                    {footer ? (
                        <div className={styles.footer}>{footer}</div>
                    ) : null}
                </Card>
            </div>
        </div>,
        document.body,
    );
}
