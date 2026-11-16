"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/shared";
import { classNames } from "@/shared/lib";
import { supabase } from "@/shared/api/supabaseClient";
import { getAvailableGiftRecipients } from "../api/supabase";
import type { GiftItem, GiftRecipient } from "../api/types";
import popcornGif from "../assets/popcorn.gif";
import styles from "./gift.module.css";
import { getGiftRarityClassName, getGiftRarityLabel } from "./giftRarity";

type Props = {
    gift: GiftItem | null;
    isOpen: boolean;
    onClose: () => void;
    showSendAction?: boolean;
    extraMeta?: GiftMetaItem[];
};

type ModalStep = "details" | "recipients" | "confirm";

type GiftMetaItem = {
    label: string;
    value: ReactNode;
};

const DEFAULT_MESSAGE = "для тебя 💖";

const getFallbackIcon = (type: GiftItem["type"]) =>
    type === "wish" ? SparklesIcon : GiftIcon;

const getTypeLabel = (type: GiftItem["type"]) =>
    type === "wish" ? "Желание" : "Подарок";

const formatDuration = (durationDays: number | null) => {
    if (durationDays == null) {
        return "Без ограничения";
    }

    const absoluteValue = Math.abs(durationDays) % 100;
    const lastDigit = absoluteValue % 10;

    if (absoluteValue >= 11 && absoluteValue <= 19) {
        return `${durationDays} дней`;
    }

    if (lastDigit === 1) {
        return `${durationDays} день`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${durationDays} дня`;
    }

    return `${durationDays} дней`;
};

function RecipientIdentity({ recipient }: { recipient: GiftRecipient }) {
    return (
        <span className={styles.recipientIdentity}>
            <span className={styles.recipientAvatar} aria-hidden="true">
                {recipient.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={recipient.avatarUrl} alt="" />
                ) : (
                    recipient.nickname.charAt(0).toUpperCase() || "U"
                )}
            </span>
            <span className={styles.recipientName}>{recipient.nickname}</span>
        </span>
    );
}

export function GiftDetailsModal({
    gift,
    isOpen,
    onClose,
    showSendAction = true,
    extraMeta = [],
}: Props) {
    const titleId = useId();
    const headingRef = useRef<HTMLHeadingElement>(null);
    const [step, setStep] = useState<ModalStep>("details");
    const [isRecipientsLoading, setIsRecipientsLoading] = useState(false);
    const [isSendingGift, setIsSendingGift] = useState(false);
    const [recipients, setRecipients] = useState<GiftRecipient[]>([]);
    const [recipientsError, setRecipientsError] = useState<string | null>(null);
    const [selectedRecipient, setSelectedRecipient] =
        useState<GiftRecipient | null>(null);
    const [message, setMessage] = useState(DEFAULT_MESSAGE);

    useEffect(() => {
        setStep("details");
        setIsRecipientsLoading(false);
        setIsSendingGift(false);
        setRecipients([]);
        setRecipientsError(null);
        setSelectedRecipient(null);
        setMessage(DEFAULT_MESSAGE);
    }, [gift?.id, isOpen]);

    useEffect(() => {
        if (isOpen) headingRef.current?.focus();
    }, [isOpen, step]);

    if (!gift) {
        return null;
    }

    const handleShowRecipients = async () => {
        setStep("recipients");
        setSelectedRecipient(null);

        if (recipients.length > 0 || isRecipientsLoading) {
            return;
        }

        setIsRecipientsLoading(true);
        setRecipientsError(null);

        try {
            const nextRecipients = await getAvailableGiftRecipients();
            setRecipients(nextRecipients);
        } catch (error) {
            setRecipientsError(
                error instanceof Error
                    ? error.message
                    : "Не удалось загрузить список пользователей.",
            );
        } finally {
            setIsRecipientsLoading(false);
        }
    };

    const handleRecipientSelect = (recipient: GiftRecipient) => {
        setSelectedRecipient(recipient);
        setStep("confirm");
    };

    const handleBackToDetails = () => {
        setStep("details");
        setSelectedRecipient(null);
    };

    const handleBackToRecipients = () => {
        setStep("recipients");
        setSelectedRecipient(null);
    };

    const handleSendGift = async () => {
        if (!selectedRecipient) {
            toast.error("decline: Получатель не выбран.");
            return;
        }

        setIsSendingGift(true);

        try {
            const { data, error } = await supabase.rpc("send_gift", {
                receiver: selectedRecipient.id,
                gift: String(gift.id),
                message,
            });

            if (error) {
                toast.error(`error: ${error.message}`);
                return;
            }

            const result = Array.isArray(data) ? data[0] : data;
            const status = result?.status;
            const text = result?.text;

            if (typeof status !== "string" || typeof text !== "string") {
                toast.error("decline: Некорректный ответ сервера.");
                return;
            }

            const toastMessage = `${status}: ${text}`;

            if (status === "success") {
                toast.success(toastMessage);
                onClose();
                return;
            }

            toast.error(toastMessage);
        } catch {
            toast.error("decline: Не удалось отправить подарок.");
        } finally {
            setIsSendingGift(false);
        }
    };

    const preview = gift.asset_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            className={styles.previewImage}
            src={gift.asset_url}
            alt=""
            aria-hidden="true"
        />
    ) : (
        <HugeiconsIcon
            icon={getFallbackIcon(gift.type)}
            width={84}
            height={84}
            className={styles.previewFallback}
        />
    );
    const rarityLabel = getGiftRarityLabel(gift.rarity);
    const rarityToneClassName = styles[getGiftRarityClassName(gift.rarity)];

    const dialogTitle =
        step === "details"
            ? gift.name
            : step === "recipients"
              ? "Выберите получателя"
              : "Подтверждение отправки";
    const price = (
        <span className={styles.priceValue}>
            <Image src={popcornGif} alt="" width={22} height={22} unoptimized />
            {gift.price}
        </span>
    );
    const detailsRows: GiftMetaItem[] = [
        { label: "Тип", value: getTypeLabel(gift.type) },
        { label: "Редкость", value: rarityLabel },
        { label: "Цена", value: price },
        { label: "Длительность", value: formatDuration(gift.duration_days) },
        ...extraMeta,
    ];

    let actions: ReactNode;
    if (step === "details" && showSendAction) {
        actions = (
            <button
                type="button"
                className={styles.giftButton}
                onClick={() => void handleShowRecipients()}
            >
                Подарить
            </button>
        );
    } else if (step === "recipients") {
        actions = (
            <button
                type="button"
                className={styles.secondaryButton}
                onClick={handleBackToDetails}
            >
                Назад к подарку
            </button>
        );
    } else if (step === "confirm" && selectedRecipient) {
        actions = (
            <>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleBackToRecipients}
                    disabled={isSendingGift}
                >
                    Сменить получателя
                </button>
                <button
                    type="button"
                    className={styles.giftButton}
                    onClick={() => void handleSendGift()}
                    disabled={isSendingGift}
                >
                    {isSendingGift ? "Отправляем…" : "Отправить"}
                </button>
            </>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            aria-labelledby={titleId}
            className={styles.detailsDialog}
            contentClassName={styles.detailsDialogContent}
            hideCloseButton
            closeOnEscape={!isSendingGift}
            closeOnOverlay={!isSendingGift}
        >
            <div className={styles.detailsContent}>
                <header className={styles.detailsHeader}>
                    <h2 id={titleId} ref={headingRef} tabIndex={-1}>
                        {dialogTitle}
                    </h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        aria-label="Закрыть модальное окно"
                        onClick={onClose}
                        disabled={isSendingGift}
                    >
                        ×
                    </button>
                </header>

                <div className={styles.detailsBody} key={step}>
                    {step === "details" && (
                        <>
                            <div
                                className={classNames(styles.preview, {}, [
                                    rarityToneClassName,
                                ])}
                            >
                                {preview}
                            </div>
                            {gift.description && (
                                <p className={styles.giftDescription}>
                                    {gift.description}
                                </p>
                            )}
                            <dl className={styles.metaGrid}>
                                {detailsRows.map(({ label, value }, index) => (
                                    <div
                                        key={`${label}-${index}`}
                                        className={styles.metaRow}
                                    >
                                        <dt>{label}</dt>
                                        <dd>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        </>
                    )}

                    {step === "recipients" &&
                        (isRecipientsLoading ? (
                            <p className={styles.recipientsState} role="status">
                                Загружаем получателей…
                            </p>
                        ) : recipientsError ? (
                            <p className={styles.recipientsState} role="alert">
                                {recipientsError}
                            </p>
                        ) : recipients.length === 0 ? (
                            <p className={styles.recipientsState}>
                                Пока нет доступных получателей.
                            </p>
                        ) : (
                            <ul className={styles.recipientList}>
                                {recipients.map((recipient) => (
                                    <li key={recipient.id}>
                                        <button
                                            type="button"
                                            className={styles.recipientItem}
                                            onClick={() =>
                                                handleRecipientSelect(recipient)
                                            }
                                        >
                                            <RecipientIdentity
                                                recipient={recipient}
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ))}

                    {step === "confirm" && selectedRecipient && (
                        <>
                            <div className={styles.selectedRecipientCard}>
                                <span className={styles.fieldLabel}>
                                    Получатель
                                </span>
                                <RecipientIdentity
                                    recipient={selectedRecipient}
                                />
                            </div>

                            <div className={styles.confirmGiftCard}>
                                <div
                                    className={classNames(
                                        styles.confirmGiftPreview,
                                        {},
                                        [rarityToneClassName],
                                    )}
                                >
                                    {preview}
                                </div>
                                <div className={styles.confirmGiftMeta}>
                                    <strong>{gift.name}</strong>
                                    <span className={styles.rarityText}>
                                        {rarityLabel}
                                    </span>
                                </div>
                                {price}
                            </div>

                            <label className={styles.messageField}>
                                <span className={styles.fieldLabel}>
                                    Сообщение
                                </span>
                                <textarea
                                    className={styles.messageInput}
                                    value={message}
                                    onChange={(event) =>
                                        setMessage(event.target.value)
                                    }
                                    rows={3}
                                    maxLength={180}
                                    placeholder="Добавьте короткое сообщение"
                                    disabled={isSendingGift}
                                />
                            </label>
                        </>
                    )}
                </div>

                {actions && (
                    <footer className={styles.actions}>{actions}</footer>
                )}
            </div>
        </Modal>
    );
}
