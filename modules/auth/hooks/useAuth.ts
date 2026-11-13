import type { ChangeEvent } from "react";
import type { User } from "@supabase/auth-js";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/shared/api/supabaseClient";
import type { Profile } from "./types";

interface SignIn {
    email: string;
    password: string;
}
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATARS_BUCKET = "avatars";

export const useAuth = () => {
    const router = useRouter();

    const signIn = useCallback(async (args: SignIn) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: args.email.trim(),
            password: args.password,
        });

        return error;
    }, []);

    const getUser = useCallback(async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        return user;
    }, []);

    const getProfileByUuid = useCallback(
        async (uuid: string): Promise<Profile> => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", uuid)
                .single();

            if (error || !data) {
                throw error;
            }

            const nickname =
                typeof data.nickname === "string" && data.nickname.trim()
                    ? data.nickname.trim()
                    : "unknown";
            const avatarUrl =
                typeof data.avatar_url === "string" && data.avatar_url.trim()
                    ? data.avatar_url.trim()
                    : null;
            const streakCount =
                typeof data.streak_count === "number" &&
                Number.isFinite(data.streak_count)
                    ? data.streak_count
                    : 0;
            const balance =
                typeof data.balance === "number" &&
                Number.isFinite(data.balance)
                    ? data.balance
                    : 0;

            return {
                nickname,
                avatarUrl,
                createdAt: data.created_at
                    ? new Intl.DateTimeFormat("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                      }).format(new Date(data.created_at))
                    : "Неизвестно",
                streakCount,
                balance,
            };
        },
        [],
    );

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
        router.replace("/sign-in");
        router.refresh();
    }, [router]);

    const avatarChange = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
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

                toast.success("Аватарка обновлена.");
                return avatarUrl;
            } catch {
                toast.error("Не удалось обновить аватарку.");
            }
        },
        [router],
    );

    const getPrivateInfo = useCallback(async (): Promise<
        (Profile & User) | null
    > => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return null;
        }

        const profile = await getProfileByUuid(user.id);

        return {
            ...user,
            ...profile,
        };
    }, [getProfileByUuid]);

    return {
        signIn,
        getUser,
        getProfileByUuid,
        signOut,
        avatarChange,
        getPrivateInfo,
    };
};
