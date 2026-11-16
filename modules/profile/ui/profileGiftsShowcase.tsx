"use client";

import { useMemo, useState } from "react";
import { Gift, GiftDetailsModal, type ReceivedGift } from "@/modules/gifts";
import { Card } from "@/shared/ui/card";
import styles from "./profileGiftsShowcase.module.css";

type Props = {
    gifts: ReceivedGift[];
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
        <aside aria-label="Подарки профиля">
            <Card>
                <header className={styles.giftsHeader}>
                    <h2 className={styles.giftsTitle}>Подарки</h2>
                    {!giftsError && (
                        <span className={styles.giftsCount}>
                            {gifts.length}
                        </span>
                    )}
                </header>

                {giftsError ? (
                    <div className={styles.giftsState} role="alert">
                        {giftsError}
                    </div>
                ) : gifts.length > 0 ? (
                    <div className={styles.giftsGrid}>
                        {gifts.map((gift) => (
                            <Gift
                                key={gift.id}
                                gift={gift.gift}
                                variant="compact"
                                onClick={() => setSelectedGiftId(gift.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.giftsState}>
                        Пока здесь нет подарков.
                    </div>
                )}
            </Card>

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
