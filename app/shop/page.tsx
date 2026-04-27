"use client";

import { useEffect, useMemo, useState } from "react";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { classNames } from "@/shared/lib";
import {
    Gift,
    GiftDetailsModal,
    getGifts,
    getWishes,
    type GiftItem,
} from "@/entities/gift";
import styles from "./page.module.css";

const TAB_COPY = {
    gifts: {
        label: "Подарки",
        title: "Витрина подарков",
        description: "Небольшая коллекция идей для приятных сюрпризов.",
    },
    wishes: {
        label: "Желания",
        title: "Витрина желаний",
        description: "Все, что хочется сохранить на потом и вернуться позже.",
    },
} as const;

type ShopTab = keyof typeof TAB_COPY;

const INITIAL_ITEMS: Record<ShopTab, GiftItem[]> = {
    gifts: [],
    wishes: [],
};

const SKELETON_ITEMS = Array.from({ length: 12 }, (_, index) => index);
const SHOP_ERROR =
    "Не удалось загрузить витрину. Проверь таблицу `gifts` и Supabase env.";

export default function ShopPage() {
    const [activeTab, setActiveTab] = useState<ShopTab>("gifts");
    const [itemsByTab, setItemsByTab] =
        useState<Record<ShopTab, GiftItem[]>>(INITIAL_ITEMS);
    const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadShop = async () => {
            try {
                setError(null);
                setIsLoading(true);

                const [gifts, wishes] = await Promise.all([
                    getGifts(),
                    getWishes(),
                ]);

                if (!isMounted) {
                    return;
                }

                setItemsByTab({
                    gifts,
                    wishes,
                });
            } catch (loadError) {
                if (!isMounted) {
                    return;
                }

                setError(
                    loadError instanceof Error ? loadError.message : SHOP_ERROR,
                );
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadShop();

        return () => {
            isMounted = false;
        };
    }, []);

    const activeItems = useMemo(
        () => itemsByTab[activeTab],
        [activeTab, itemsByTab],
    );
    const activeCopy = TAB_COPY[activeTab];
    const hasEmptyState = !isLoading && !error && activeItems.length === 0;

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.shell}>
                <LiquidGlass
                    className={styles.surface}
                    radius="xl"
                    padding="none"
                >
                    <div className={styles.surfaceInner}>
                        <div
                            className={styles.tabs}
                            role="tablist"
                            aria-label="Разделы магазина"
                        >
                            {(Object.keys(TAB_COPY) as ShopTab[]).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === tab}
                                    aria-controls={`shop-panel-${tab}`}
                                    id={`shop-tab-${tab}`}
                                    className={classNames(
                                        styles.tabButton,
                                        {
                                            [styles.tabButtonActive]:
                                                activeTab === tab,
                                        },
                                        [],
                                    )}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {TAB_COPY[tab].label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.panelHeader}>
                            <div>
                                <p className={styles.panelEyebrow}>
                                    {activeCopy.label}
                                </p>
                                <h2 className={styles.panelTitle}>
                                    {activeCopy.title}
                                </h2>
                                <p className={styles.panelDescription}>
                                    {activeCopy.description}
                                </p>
                            </div>
                        </div>

                        {error ? (
                            <div className={styles.stateCard} role="alert">
                                <p className={styles.stateEyebrow}>
                                    Ошибка загрузки
                                </p>
                                <h3 className={styles.stateTitle}>
                                    Витрина сейчас недоступна
                                </h3>
                                <p className={styles.stateText}>{error}</p>
                            </div>
                        ) : null}

                        {hasEmptyState ? (
                            <div className={styles.stateCard}>
                                <p className={styles.stateEyebrow}>
                                    Пока пусто
                                </p>
                                <h3 className={styles.stateTitle}>
                                    Здесь появятся элементы раздела
                                </h3>
                            </div>
                        ) : null}

                        {!error && !hasEmptyState ? (
                            <div
                                id={`shop-panel-${activeTab}`}
                                role="tabpanel"
                                aria-labelledby={`shop-tab-${activeTab}`}
                                className={styles.grid}
                            >
                                {isLoading
                                    ? SKELETON_ITEMS.map((item) => (
                                          <LiquidGlass
                                              key={item}
                                              className={styles.tileSkeleton}
                                              radius="lg"
                                              padding="none"
                                          >
                                              <span
                                                  className={
                                                      styles.tileSkeletonInner
                                                  }
                                                  aria-hidden="true"
                                              />
                                          </LiquidGlass>
                                      ))
                                    : activeItems.map((item) => (
                                          <Gift
                                              key={item.id}
                                              gift={item}
                                              onClick={setSelectedGift}
                                          />
                                      ))}
                            </div>
                        ) : null}
                    </div>
                </LiquidGlass>
            </section>

            <GiftDetailsModal
                gift={selectedGift}
                isOpen={Boolean(selectedGift)}
                onClose={() => setSelectedGift(null)}
            />
        </div>
    );
}
