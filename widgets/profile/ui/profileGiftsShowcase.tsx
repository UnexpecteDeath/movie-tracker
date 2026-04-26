"use client";

import { useMemo, useState } from "react";
import { Gift, GiftDetailsModal } from "@/entities/gift";
import type { ProfileGiftViewData } from "../model/types";
import styles from "./profileGiftsShowcase.module.css";

type Props = {
    gifts: ProfileGiftViewData[];
    giftsError: string | null;
};

const receivedDateFormatter = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
});

export function ProfileGiftsShowcase({ gifts, giftsError }: Props) {
    const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);

    const selectedGiftEntry = useMemo(
        () => gifts.find((gift) => gift.id === selectedGiftId) ?? null,
        [gifts, selectedGiftId],
    );

    return (
        <aside className={styles.giftsColumn} aria-label="Подарки профиля">
            <div className={styles.giftsPanel}>
                <div className={styles.giftsHeader}>
                    <div className={styles.giftsHeading}>
                        <p className={styles.giftsEyebrow}>Подарки</p>
                        <h3 className={styles.giftsTitle}>Витрина профиля</h3>
                    </div>
                </div>

                {giftsError ? (
                    <div className={styles.giftsState} role="alert">
                        {giftsError}
                    </div>
                ) : gifts.length > 0 ? (
                    <div className={styles.giftsScroll}>
                        <div className={styles.giftsGrid}>
                            {gifts.map((gift) => (
                                <Gift
                                    key={gift.id}
                                    gift={gift.gift}
                                    className={styles.giftTile}
                                    onClick={() => setSelectedGiftId(gift.id)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.giftsState}>
                        Пока здесь нет подарков.
                    </div>
                )}
            </div>

            <GiftDetailsModal
                gift={selectedGiftEntry?.gift ?? null}
                isOpen={Boolean(selectedGiftEntry)}
                onClose={() => setSelectedGiftId(null)}
                showSendAction={false}
                extraMeta={
                    selectedGiftEntry
                        ? [
                              {
                                  label: "Отправитель",
                                  value: selectedGiftEntry.senderName,
                              },
                              {
                                  label: "Сообщение",
                                  value:
                                      selectedGiftEntry.message ||
                                      "Без сообщения",
                              },
                              {
                                  label: "Получен",
                                  value: receivedDateFormatter.format(
                                      new Date(selectedGiftEntry.createdAt),
                                  ),
                              },
                          ]
                        : undefined
                }
            />
        </aside>
    );
}
