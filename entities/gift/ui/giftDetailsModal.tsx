"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { GiftIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/shared";
import { classNames } from "@/shared/lib";
import { supabase } from "@/shared/api/supabaseClient";
import { getAvailableGiftRecipients } from "../api/supabase";
import type { GiftItem, GiftRecipient } from "../api/types";
import popcornGif from "../assets/popcorn.gif";
import styles from "./gift.module.css";

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

export function GiftDetailsModal({
    gift,
    isOpen,
    onClose,
    showSendAction = true,
    extraMeta = [],
}: Props) {
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

    const dialogEyebrow =
        step === "details"
            ? getTypeLabel(gift.type)
            : step === "recipients"
              ? "Отправка подарка"
              : "Подтверждение";
    const dialogTitle =
        step === "details"
            ? gift.name
            : step === "recipients"
              ? "Выберите получателя"
              : selectedRecipient?.nickname || "Получатель";
    const dialogDescription =
        step === "details"
            ? gift.description
            : step === "recipients"
              ? "Показываем только доступных пользователей."
              : "Проверьте подарок и отправьте сообщение.";
    const detailsRows: GiftMetaItem[] = [
        {
            label: "Цена",
            value: (
                <span className={styles.priceValue}>
                    <Image
                        src={popcornGif}
                        alt=""
                        width={28}
                        height={28}
                        unoptimized
                        className={styles.priceGif}
                    />
                    <span>{gift.price}</span>
                </span>
            ),
        },
        {
            label: "Длительность",
            value: formatDuration(gift.duration_days),
        },
        ...extraMeta,
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            eyebrow={dialogEyebrow}
            title={dialogTitle}
            description={dialogDescription}
            className={styles.detailsDialog}
            contentClassName={styles.detailsDialogContent}
        >
            <div className={styles.detailsContent}>
                <div
                    className={classNames(styles.scene, {}, [
                        step === "details" ? styles.sceneVisible : "",
                    ])}
                >
                    {step === "details" ? (
                        <>
                            <div className={styles.preview}>
                                <div className={styles.previewInner}>
                                    {preview}
                                </div>
                            </div>

                            <div className={styles.metaGrid}>
                                {detailsRows.map((row, index) => (
                                    <div
                                        key={`${row.label}-${index}`}
                                        className={styles.metaRow}
                                    >
                                        <span className={styles.metaLabel}>
                                            {row.label}
                                        </span>
                                        <span className={styles.metaValue}>
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {showSendAction ? (
                                <button
                                    type="button"
                                    className={styles.giftButton}
                                    onClick={() => void handleShowRecipients()}
                                >
                                    Подарить
                                </button>
                            ) : null}
                        </>
                    ) : null}
                </div>

                <div
                    className={classNames(styles.scene, {}, [
                        step === "recipients" ? styles.sceneVisible : "",
                    ])}
                >
                    {step === "recipients" ? (
                        <div className={styles.recipientsBlock}>
                            <div className={styles.recipientsHeader}>
                                <p className={styles.recipientsEyebrow}>
                                    Доступные пользователи
                                </p>
                                <span className={styles.recipientsCount}>
                                    {recipients.length}
                                </span>
                            </div>

                            {isRecipientsLoading ? (
                                <div className={styles.recipientsState}>
                                    Загружаем список пользователей...
                                </div>
                            ) : recipientsError ? (
                                <div
                                    className={styles.recipientsState}
                                    role="alert"
                                >
                                    {recipientsError}
                                </div>
                            ) : recipients.length > 0 ? (
                                <div className={styles.recipientList}>
                                    {recipients.map((recipient) => {
                                        const avatar = recipient.avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                className={
                                                    styles.recipientAvatarImage
                                                }
                                                src={recipient.avatarUrl}
                                                alt=""
                                            />
                                        ) : (
                                            <span
                                                className={
                                                    styles.recipientAvatarFallback
                                                }
                                            >
                                                {recipient.nickname
                                                    .slice(0, 1)
                                                    .toUpperCase() || "U"}
                                            </span>
                                        );

                                        return (
                                            <button
                                                key={recipient.id}
                                                type="button"
                                                className={styles.recipientItem}
                                                onClick={() =>
                                                    handleRecipientSelect(
                                                        recipient,
                                                    )
                                                }
                                            >
                                                <div
                                                    className={
                                                        styles.recipientAvatar
                                                    }
                                                >
                                                    {avatar}
                                                </div>
                                                <div
                                                    className={
                                                        styles.recipientText
                                                    }
                                                >
                                                    <span
                                                        className={
                                                            styles.recipientName
                                                        }
                                                    >
                                                        {recipient.nickname}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.recipientsState}>
                                    Нет доступных пользователей для подарка.
                                </div>
                            )}

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={handleBackToDetails}
                            >
                                Назад к подарку
                            </button>
                        </div>
                    ) : null}
                </div>

                <div
                    className={classNames(styles.scene, {}, [
                        step === "confirm" ? styles.sceneVisible : "",
                    ])}
                >
                    {step === "confirm" && selectedRecipient ? (
                        <div className={styles.confirmBlock}>
                            <div className={styles.selectedRecipientCard}>
                                <span className={styles.selectedRecipientLabel}>
                                    Получатель
                                </span>
                                <div
                                    className={styles.selectedRecipientContent}
                                >
                                    <div className={styles.recipientAvatar}>
                                        {selectedRecipient.avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                className={
                                                    styles.recipientAvatarImage
                                                }
                                                src={
                                                    selectedRecipient.avatarUrl
                                                }
                                                alt=""
                                            />
                                        ) : (
                                            <span
                                                className={
                                                    styles.recipientAvatarFallback
                                                }
                                            >
                                                {selectedRecipient.nickname
                                                    .slice(0, 1)
                                                    .toUpperCase() || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <strong
                                        className={styles.selectedRecipientName}
                                    >
                                        {selectedRecipient.nickname}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles.confirmGiftCard}>
                                <div className={styles.confirmGiftPreview}>
                                    {preview}
                                </div>
                                <div className={styles.confirmGiftMeta}>
                                    <strong className={styles.confirmGiftName}>
                                        {gift.name}
                                    </strong>
                                    <span className={styles.confirmGiftPrice}>
                                        <Image
                                            src={popcornGif}
                                            alt=""
                                            width={24}
                                            height={24}
                                            unoptimized
                                            className={styles.priceGif}
                                        />
                                        <span>{gift.price}</span>
                                    </span>
                                </div>
                            </div>

                            <label className={styles.messageField}>
                                <span className={styles.messageLabel}>
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
                                />
                            </label>

                            <div className={styles.confirmActions}>
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
                                    {isSendingGift
                                        ? "Отправляем..."
                                        : "Отправить"}
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
}
