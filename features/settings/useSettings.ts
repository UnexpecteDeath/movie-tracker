import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/shared/api/supabaseClient";
import { useAuth } from "@/features/auth/useAuth";
import { urlBase64ToUint8Array } from "./model";

const SERVICE_WORKER_PATH = "/sw.js";

const getReadyServiceWorkerRegistration = async () => {
    if (!("serviceWorker" in navigator)) {
        throw new Error("Service worker is not supported");
    }

    await navigator.serviceWorker.register(SERVICE_WORKER_PATH);

    return navigator.serviceWorker.ready;
};

const getNotificationsEnabledByPermission = () => {
    return (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
    );
};

export const useSettings = () => {
    const [enabled, setEnabled] = useState(false);
    const { getUser } = useAuth();

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setEnabled(getNotificationsEnabledByPermission());
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    const enableNotifications = async () => {
        try {
            if (!("Notification" in window)) {
                toast.error("Браузер не поддерживает уведомления");
                return;
            }

            if (!("serviceWorker" in navigator)) {
                toast.error("Браузер не поддерживает push-уведомления");
                return;
            }

            if (Notification.permission === "denied") {
                toast.error("Уведомления отключены в браузере");
                return;
            }

            const permission =
                Notification.permission === "granted"
                    ? "granted"
                    : await Notification.requestPermission();

            if (permission !== "granted") {
                setEnabled(false);
                toast.error("Доступ к уведомлениям не предоставлен");
                return;
            }

            const registration = await getReadyServiceWorkerRegistration();

            const existingSubscription =
                await registration.pushManager.getSubscription();

            const user = await getUser();

            if (!user?.id) {
                toast.error("Нет пользователя");
                return;
            }

            if (existingSubscription) {
                await supabase.from("user_settings").upsert({
                    user_id: user.id,
                    push_enabled: true,
                });

                setEnabled(true);
                return;
            }

            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

            if (!vapidPublicKey) {
                toast.error("Не задан публичный VAPID ключ");
                return;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });

            const { error } = await supabase.from("push_subscriptions").insert({
                user_id: user.id,
                endpoint: subscription.endpoint,
                p256dh: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(subscription.getKey("p256dh")!),
                    ),
                ),
                auth: btoa(
                    String.fromCharCode(
                        ...new Uint8Array(subscription.getKey("auth")!),
                    ),
                ),
            });

            if (error) {
                toast.error("Не удалось сохранить подписку");
                return;
            }

            await supabase.from("user_settings").upsert({
                user_id: user.id,
                push_enabled: true,
            });

            setEnabled(true);
            toast.success("Уведомления включены");
        } catch (error) {
            console.error(error);
            toast.error("Не удалось включить уведомления");
        }
    };

    const disableNotifications = async () => {
        try {
            const user = await getUser();

            if (!user?.id) {
                toast.error("Нет пользователя");
                return;
            }

            const registration =
                "serviceWorker" in navigator
                    ? await navigator.serviceWorker.getRegistration()
                    : null;

            const subscription =
                await registration?.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();

                const { error } = await supabase
                    .from("push_subscriptions")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("endpoint", subscription.endpoint);

                if (error) {
                    toast.error("Не удалось удалить подписку");
                    return;
                }
            }

            const { error: settingsError } = await supabase
                .from("user_settings")
                .upsert({
                    user_id: user.id,
                    push_enabled: false,
                });

            if (settingsError) {
                toast.error("Не удалось обновить настройки");
                return;
            }

            setEnabled(false);
            toast.success("Уведомления отключены");
        } catch (error) {
            console.error(error);
            toast.error("Не удалось отключить уведомления");
        }
    };

    return {
        enabled,
        enableNotifications,
        disableNotifications,
    };
};
