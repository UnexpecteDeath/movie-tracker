"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LiquidGlass } from "@/shared";
import { supabase } from "@/shared/api/supabaseClient";
import styles from "./page.module.css";

const AVATARS_BUCKET = "avatars";
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

type Profile = {
    email: string;
    nickname: string;
    avatarUrl: string | null;
    createdAt: string;
};

const getProfileByUuid = async (): Promise<Profile | null> => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    if (error || !data) {
        throw error;
    }

    const nickname =
        typeof data.nickname === "string" && data.nickname.trim()
            ? data.nickname.trim()
            : user.email;
    const avatarUrl =
        typeof data.avatar_url === "string" && data.avatar_url.trim()
            ? data.avatar_url.trim()
            : null;

    return {
        email: user.email ?? "",
        nickname,
        avatarUrl,
        createdAt: data.created_at
            ? new Intl.DateTimeFormat("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              }).format(new Date(data.created_at))
            : "Неизвестно",
    };
};

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        getProfileByUuid()
            .then((nextProfile) => {
                if (!isMounted) {
                    return;
                }

                if (!nextProfile) {
                    router.replace("/sign-in");
                    return;
                }

                setProfile(nextProfile);
            })
            .catch(() => {
                if (!isMounted) return;

                setError("Не удалось загрузить профиль.");
            })
            .finally(() => {
                if (!isMounted) return;

                setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [router]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        await supabase.auth.signOut();
        router.replace("/sign-in");
        router.refresh();
    };

    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Выберите изображение для аватарки.");
            return;
        }

        if (file.size > MAX_AVATAR_SIZE) {
            toast.error("Аватарка должна быть не больше 5 МБ.");
            return;
        }

        setIsAvatarUploading(true);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/sign-in");
                return;
            }

            const fileExtension = file.name.split(".").pop() || "jpg";
            const filePath = `${user.id}/${Date.now()}.${fileExtension}`;

            const { error: uploadError } = await supabase.storage
                .from(AVATARS_BUCKET)
                .upload(filePath, file, {
                    cacheControl: "3600",
                    contentType: file.type,
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabase.storage
                .from(AVATARS_BUCKET)
                .getPublicUrl(filePath);

            const avatarUrl = publicUrlData.publicUrl;

            const { error: updateError } = await supabase
                .from("profiles")
                .update({ avatar_url: avatarUrl })
                .eq("id", user.id);

            if (updateError) {
                throw updateError;
            }

            setProfile((currentProfile) =>
                currentProfile
                    ? {
                          ...currentProfile,
                          avatarUrl,
                      }
                    : currentProfile,
            );
            toast.success("Аватарка обновлена.");
        } catch {
            toast.error("Не удалось обновить аватарку.");
        } finally {
            setIsAvatarUploading(false);
        }
    };

    return (
        <main className={styles.page}>
            <div className={styles.glow} />
            <div className={styles.glowSecondary} />

            <section className={styles.shell} aria-labelledby="profile-title">
                <div className={styles.copy}>
                    <p className={styles.eyebrow}>Профиль</p>
                    <h1 id="profile-title" className={styles.title}>
                        Ваш киноуголок
                    </h1>
                    <p className={styles.description}>
                        Данные аккаунта для вашего трекера фильмов.
                    </p>
                </div>

                <LiquidGlass
                    className={styles.card}
                    radius="xl"
                    padding="none"
                    shadow
                >
                    <div className={styles.content}>
                        <label
                            className={styles.avatarWrap}
                            aria-label="Изменить аватарку"
                        >
                            <input
                                className={styles.avatarInput}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                disabled={
                                    isLoading || isAvatarUploading || !profile
                                }
                            />
                            {profile?.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    className={styles.avatar}
                                    src={profile.avatarUrl}
                                    alt=""
                                />
                            ) : (
                                <span className={styles.avatarFallback}>
                                    {profile?.nickname
                                        .slice(0, 1)
                                        .toUpperCase() || "M"}
                                </span>
                            )}
                            <span className={styles.avatarOverlay}>
                                {isAvatarUploading ? "..." : "+"}
                            </span>
                        </label>

                        <div className={styles.profileInfo}>
                            <h2 className={styles.name}>
                                {isLoading
                                    ? "Загрузка..."
                                    : profile?.nickname || "Киноман"}
                            </h2>
                            <p className={styles.email}>
                                {profile?.email || error}
                            </p>
                        </div>

                        <div className={styles.meta}>
                            <span className={styles.metaLabel}>
                                Аккаунт создан
                            </span>
                            <span className={styles.metaValue}>
                                {isLoading
                                    ? "Загрузка..."
                                    : profile?.createdAt || "Неизвестно"}
                            </span>
                        </div>

                        <button
                            className={styles.signOutButton}
                            type="button"
                            onClick={handleSignOut}
                            disabled={isSigningOut}
                        >
                            {isSigningOut ? "Выход..." : "Выйти"}
                        </button>
                    </div>
                </LiquidGlass>
            </section>
        </main>
    );
}
