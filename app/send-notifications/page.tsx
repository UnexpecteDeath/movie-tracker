"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Notification01Icon,
    RefreshIcon,
    SentIcon,
    UserIcon,
} from "@hugeicons/core-free-icons";
import { LiquidGlass } from "@/shared/ui/LiquidGlass";
import { supabase } from "@/shared/api/supabaseClient";
import styles from "./page.module.css";

type SubscriptionRow = {
    user_id: string | null;
    endpoint: string | null;
};

type ProfileRow = {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
};

type SubscribedUser = {
    userId: string;
    nickname: string;
    avatarUrl: string | null;
    subscriptionsCount: number;
    endpoints: string[];
};

const DEFAULT_TITLE = "";
const DEFAULT_BODY = "";

const getShortId = (value: string) => {
    if (value.length <= 16) return value;

    return `${value.slice(0, 8)}...${value.slice(-6)}`;
};

export default function SendNotificationsPage() {
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [body, setBody] = useState(DEFAULT_BODY);
    const [users, setUsers] = useState<SubscribedUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [sendingUserId, setSendingUserId] = useState<string | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);

    const canSend = useMemo(
        () => title.trim().length > 0 || body.trim().length > 0,
        [body, title],
    );

    const loadSubscribedUsers = useCallback(async () => {
        try {
            setIsLoadingUsers(true);
            setLoadError(null);

            const { data: subscriptionsData, error: subscriptionsError } =
                await supabase
                    .from("push_subscriptions")
                    .select("user_id, endpoint")
                    .order("user_id", { ascending: true });

            if (subscriptionsError) {
                throw new Error(subscriptionsError.message);
            }

            const subscriptions = (subscriptionsData ??
                []) as SubscriptionRow[];
            const usersById = new Map<string, SubscribedUser>();

            subscriptions.forEach((subscription) => {
                const userId = subscription.user_id;

                if (!userId) return;

                const currentUser = usersById.get(userId);
                const endpoint = subscription.endpoint ?? "";

                if (currentUser) {
                    currentUser.subscriptionsCount += 1;

                    if (endpoint) {
                        currentUser.endpoints.push(endpoint);
                    }

                    return;
                }

                usersById.set(userId, {
                    userId,
                    nickname: getShortId(userId),
                    avatarUrl: null,
                    subscriptionsCount: 1,
                    endpoints: endpoint ? [endpoint] : [],
                });
            });

            const userIds = Array.from(usersById.keys());

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } =
                    await supabase
                        .from("profiles")
                        .select("id, nickname, avatar_url")
                        .in("id", userIds);

                if (!profilesError) {
                    ((profilesData ?? []) as ProfileRow[]).forEach(
                        (profile) => {
                            const user = usersById.get(profile.id);

                            if (!user) return;

                            user.nickname =
                                profile.nickname?.trim() ||
                                getShortId(user.userId);
                            user.avatarUrl = profile.avatar_url;
                        },
                    );
                }
            }

            setUsers(
                Array.from(usersById.values()).sort((firstUser, secondUser) =>
                    firstUser.nickname.localeCompare(secondUser.nickname, "ru"),
                ),
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Не удалось загрузить подписчиков";

            console.error(error);
            setLoadError(message);
            toast.error("Не удалось загрузить подписчиков");
        } finally {
            setIsLoadingUsers(false);
        }
    }, []);

    useEffect(() => {
        void loadSubscribedUsers();
    }, [loadSubscribedUsers]);

    const sendNotification = async (userId?: string) => {
        if (!canSend) {
            toast.error("Заполни title и body");
            return;
        }

        if (userId) {
            setSendingUserId(userId);
        } else {
            setIsSendingAll(true);
        }

        try {
            const payload = {
                title: title.trim(),
                body: body.trim(),
                ...(userId ? { user_id: userId } : {}),
            };

            const { error } = await supabase.functions.invoke("quick-api", {
                body: payload,
            });

            if (error) {
                throw new Error(error.message);
            }

            toast.success(
                userId
                    ? "Уведомление отправлено пользователю"
                    : "Уведомление отправлено всем",
            );
        } catch (error) {
            console.error(error);
            toast.error("Не удалось отправить уведомление");
        } finally {
            if (userId) {
                setSendingUserId(null);
            } else {
                setIsSendingAll(false);
            }
        }
    };

    return (
        <div id="scrollable" className={`container ${styles.page}`}>
            <div className={styles.glowPrimary} />
            <div className={styles.glowSecondary} />

            <section className={styles.shell}>
                <div className={styles.header}>
                    <p className={styles.eyebrow}>Admin push</p>
                    <h1 className={styles.title}>Отправка уведомлений</h1>
                    <p className={styles.description}>
                        Заполни текст уведомления и отправь его всем подписчикам
                        или конкретному пользователю.
                    </p>
                </div>

                <LiquidGlass
                    className={styles.surface}
                    radius="xl"
                    padding="none"
                >
                    <div className={styles.formPanel}>
                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Title</span>
                            <input
                                className={styles.input}
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                placeholder="Заголовок"
                            />
                        </label>

                        <label className={styles.field}>
                            <span className={styles.fieldLabel}>Body</span>
                            <textarea
                                className={styles.textarea}
                                value={body}
                                onChange={(event) =>
                                    setBody(event.target.value)
                                }
                                placeholder="..."
                                rows={4}
                            />
                        </label>

                        <button
                            type="button"
                            className={styles.primaryButton}
                            disabled={!canSend || isSendingAll}
                            onClick={() => void sendNotification()}
                        >
                            <HugeiconsIcon
                                icon={SentIcon}
                                width={20}
                                height={20}
                            />
                            {isSendingAll ? "Отправляем..." : "Отправить всем"}
                        </button>
                    </div>
                </LiquidGlass>

                <section className={styles.usersSection}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <p className={styles.sectionEyebrow}>
                                Push subscriptions
                            </p>
                            <h2 className={styles.sectionTitle}>
                                Пользователи с подпиской
                            </h2>
                        </div>

                        <button
                            type="button"
                            className={styles.refreshButton}
                            onClick={() => void loadSubscribedUsers()}
                            disabled={isLoadingUsers}
                            aria-label="Обновить список пользователей"
                        >
                            <HugeiconsIcon
                                icon={RefreshIcon}
                                width={18}
                                height={18}
                            />
                            Обновить
                        </button>
                    </div>

                    {isLoadingUsers ? (
                        <LiquidGlass
                            className={styles.stateCard}
                            radius="lg"
                            padding="none"
                        >
                            <p className={styles.stateText}>
                                Загружаем подписчиков...
                            </p>
                        </LiquidGlass>
                    ) : null}

                    {!isLoadingUsers && loadError ? (
                        <LiquidGlass
                            className={styles.stateCard}
                            radius="lg"
                            padding="none"
                        >
                            <p className={styles.stateTitle}>
                                Список недоступен
                            </p>
                            <p className={styles.stateText}>{loadError}</p>
                        </LiquidGlass>
                    ) : null}

                    {!isLoadingUsers && !loadError && users.length === 0 ? (
                        <LiquidGlass
                            className={styles.stateCard}
                            radius="lg"
                            padding="none"
                        >
                            <p className={styles.stateTitle}>
                                Подписчиков пока нет
                            </p>
                            <p className={styles.stateText}>
                                Когда пользователь включит уведомления, он
                                появится в этом списке.
                            </p>
                        </LiquidGlass>
                    ) : null}

                    {!isLoadingUsers && !loadError && users.length > 0 ? (
                        <div className={styles.usersList}>
                            {users.map((user) => (
                                <LiquidGlass
                                    key={user.userId}
                                    className={styles.userCard}
                                    radius="lg"
                                    padding="none"
                                >
                                    <div className={styles.userAvatar}>
                                        {user.avatarUrl ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={user.avatarUrl}
                                                alt=""
                                                className={styles.avatarImage}
                                            />
                                        ) : (
                                            <HugeiconsIcon
                                                icon={UserIcon}
                                                width={22}
                                                height={22}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.userInfo}>
                                        <span className={styles.userName}>
                                            {user.nickname}
                                        </span>
                                        <span className={styles.userMeta}>
                                            {getShortId(user.userId)} ·{" "}
                                            {user.subscriptionsCount}{" "}
                                            {user.subscriptionsCount === 1
                                                ? "подписка"
                                                : "подписок"}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.userButton}
                                        disabled={
                                            !canSend ||
                                            sendingUserId === user.userId
                                        }
                                        onClick={() =>
                                            void sendNotification(user.userId)
                                        }
                                    >
                                        <HugeiconsIcon
                                            icon={Notification01Icon}
                                            width={18}
                                            height={18}
                                        />
                                        {sendingUserId === user.userId
                                            ? "Отправляем..."
                                            : "Отправить"}
                                    </button>
                                </LiquidGlass>
                            ))}
                        </div>
                    ) : null}
                </section>
            </section>
        </div>
    );
}
